import { useCallback, useMemo, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Container,
  Title,
  Stack,
  Group,
  Button,
  Badge,
  Text,
  Paper,
  Modal,
  Select,
  Alert,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconUser,
  IconDeviceDesktop,
  IconLink,
  IconRefresh,
  IconPlus,
  IconTrash,
  IconAlertCircle,
} from '@tabler/icons-react';
import { usePatients, useDevices, useBindings, useCreateBinding, useDeleteBinding } from '../../../shared/api';
import { notifications } from '@mantine/notifications';

// 自定义患者节点
const PatientNode = ({ data }: NodeProps) => {
  return (
    <Paper
      p="md"
      withBorder
      style={{
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
        minWidth: 180,
      }}
    >
      <Handle type="target" position={Position.Right} />
      <Group gap="xs">
        <IconUser size={24} color="#2196f3" />
        <Stack gap={4}>
          <Text fw={600} size="sm">{data.label}</Text>
          <Text size="xs" color="dimmed">患者</Text>
        </Stack>
      </Group>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
};

// 自定义设备节点
const DeviceNode = ({ data }: NodeProps) => {
  const statusColor = data.status === 'active' ? '#4caf50' : '#9e9e9e';
  
  return (
    <Paper
      p="md"
      withBorder
      style={{
        backgroundColor: '#f3e5f5',
        borderColor: '#9c27b0',
        minWidth: 180,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <Group gap="xs">
        <IconDeviceDesktop size={24} color="#9c27b0" />
        <Stack gap={4}>
          <Group gap={4}>
            <Text fw={600} size="sm">{data.label}</Text>
            <Badge
              size="xs"
              color={statusColor}
              variant="dot"
            >
              {data.status}
            </Badge>
          </Group>
          <Text size="xs" color="dimmed">{data.deviceType}</Text>
        </Stack>
      </Group>
      <Handle type="source" position={Position.Left} />
    </Paper>
  );
};

const nodeTypes = {
  patient: PatientNode,
  device: DeviceNode,
};

export const BindingVisualPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const { data: patientsData, isLoading: patientsLoading } = usePatients();
  const { data: devicesData, isLoading: devicesLoading } = useDevices();
  const { data: bindingsData, isLoading: bindingsLoading, refetch } = useBindings({ active_only: true });
  
  const createBindingMutation = useCreateBinding();
  const deleteBindingMutation = useDeleteBinding();

  const patients = patientsData?.data || [];
  const devices = devicesData?.data || [];
  const bindings = bindingsData?.bindings || [];

  // 将数据转换为节点和边
  useEffect(() => {
    if (patientsLoading || devicesLoading || bindingsLoading) return;

    const patientNodes: Node[] = patients.map((patient, index) => ({
      id: `patient-${patient.id}`,
      type: 'patient',
      position: { x: 50, y: index * 120 },
      data: {
        label: patient.name || `患者 ${patient.id.slice(0, 8)}`,
        patientId: patient.id,
      },
    }));

    const deviceNodes: Node[] = devices.map((device, index) => ({
      id: `device-${device.id}`,
      type: 'device',
      position: { x: 500, y: index * 120 },
      data: {
        label: device.serial_number || device.device_type,
        deviceId: device.id,
        status: device.status,
        deviceType: device.device_type,
      },
    }));

    const bindingEdges: Edge[] = bindings.map((binding) => ({
      id: `binding-${binding.id}`,
      source: `device-${binding.device_id}`,
      target: `patient-${binding.patient_id}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4caf50', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#4caf50',
      },
      data: {
        bindingId: binding.id,
        startTime: binding.bound_at,
      },
    }));

    setNodes([...patientNodes, ...deviceNodes]);
    setEdges(bindingEdges);
  }, [patients, devices, bindings, patientsLoading, devicesLoading, bindingsLoading, setNodes, setEdges]);

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;

      const deviceId = params.source.replace('device-', '');
      const patientId = params.target.replace('patient-', '');

      try {
        await createBindingMutation.mutateAsync({
          device_id: deviceId,
          patient_id: patientId,
        });

        notifications.show({
          title: '成功',
          message: '绑定创建成功',
          color: 'green',
        });

        refetch();
      } catch (error) {
        notifications.show({
          title: '错误',
          message: error instanceof Error ? error.message : '创建绑定失败',
          color: 'red',
        });
      }
    },
    [createBindingMutation, refetch]
  );

  const handleDeleteBinding = useCallback(
    async (edge: Edge) => {
      if (!edge.data?.bindingId) return;

      if (!confirm('确定要解除此绑定吗？')) return;

      try {
        await deleteBindingMutation.mutateAsync(edge.data.bindingId);
        
        notifications.show({
          title: '成功',
          message: '绑定已解除',
          color: 'green',
        });

        refetch();
      } catch (error) {
        notifications.show({
          title: '错误',
          message: error instanceof Error ? error.message : '解除绑定失败',
          color: 'red',
        });
      }
    },
    [deleteBindingMutation, refetch]
  );

  const handleCreateBinding = async () => {
    if (!selectedDevice || !selectedPatient) {
      notifications.show({
        title: '错误',
        message: '请选择设备和患者',
        color: 'red',
      });
      return;
    }

    try {
      await createBindingMutation.mutateAsync({
        device_id: selectedDevice,
        patient_id: selectedPatient,
      });

      notifications.show({
        title: '成功',
        message: '绑定创建成功',
        color: 'green',
      });

      setCreateModalOpen(false);
      setSelectedDevice(null);
      setSelectedPatient(null);
      refetch();
    } catch (error) {
      notifications.show({
        title: '错误',
        message: error instanceof Error ? error.message : '创建绑定失败',
        color: 'red',
      });
    }
  };

  const isLoading = patientsLoading || devicesLoading || bindingsLoading;

  return (
    <Container fluid py="md" style={{ height: 'calc(100vh - 100px)' }}>
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconLink size={28} />
                可视化绑定管理
              </Group>
            </Title>
            <Text size="sm" color="dimmed" mt={4}>
              拖拽设备到患者以创建绑定关系
            </Text>
          </div>
          <Group>
            <Tooltip label="刷新">
              <ActionIcon variant="light" onClick={() => refetch()}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setCreateModalOpen(true)}
            >
              快速创建绑定
            </Button>
          </Group>
        </Group>

        <Paper withBorder style={{ flex: 1, position: 'relative' }}>
          {isLoading ? (
            <Center h="100%">
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text color="dimmed">加载中...</Text>
              </Stack>
            </Center>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onEdgeClick={(_, edge) => handleDeleteBinding(edge)}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#aaa" gap={16} />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  if (node.type === 'patient') return '#e3f2fd';
                  return '#f3e5f5';
                }}
                maskColor="rgba(0,0,0,0.1)"
              />
            </ReactFlow>
          )}
        </Paper>

        <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
          <Text size="sm">
            <strong>操作提示：</strong>
            点击设备节点的连接点拖拽到患者节点创建绑定，或使用右上角"快速创建绑定"按钮。
            点击已绑定的连线可以解除绑定。
          </Text>
        </Alert>
      </Stack>

      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedDevice(null);
          setSelectedPatient(null);
        }}
        title="快速创建绑定"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="选择设备"
            placeholder="请选择设备"
            data={devices.map(d => ({
              value: d.id,
              label: `${d.serial_number || d.id.slice(0, 8)} (${d.device_type})`,
            }))}
            value={selectedDevice}
            onChange={setSelectedDevice}
            searchable
          />
          <Select
            label="选择患者"
            placeholder="请选择患者"
            data={patients.map(p => ({
              value: p.id,
              label: p.name || `患者 ${p.id.slice(0, 8)}`,
            }))}
            value={selectedPatient}
            onChange={setSelectedPatient}
            searchable
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setCreateModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateBinding}
              loading={createBindingMutation.isPending}
              disabled={!selectedDevice || !selectedPatient}
            >
              创建绑定
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};