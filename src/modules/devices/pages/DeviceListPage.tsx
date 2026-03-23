import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Table,
  Button,
  Group,
  TextInput,
  Modal,
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
  Kbd,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconDeviceDesktop,
  IconRefresh,
  IconLink,
} from "@tabler/icons-react";
import { useDevices, useRegisterDevice, useDeleteDevice, usePatients, useCreateBinding } from "../../../shared/api";
import { notifications } from "@mantine/notifications";
import { DeviceTypes, DeviceStatus } from "../../../shared/api/types";

const DEVICE_TYPE_OPTIONS = [
  { value: DeviceTypes.HEART_RATE_MONITOR, label: "心率监测仪" },
  { value: DeviceTypes.FALL_DETECTOR, label: "跌倒检测器" },
  { value: DeviceTypes.SPO2_SENSOR, label: "血氧传感器" },
  { value: DeviceTypes.SMART_MATTRESS, label: "智能床垫" },
];

const DEVICE_STATUS_COLORS: Record<string, string> = {
  active: "green",
  inactive: "gray",
  maintenance: "orange",
};

const DEVICE_STATUS_LABELS: Record<string, string> = {
  active: "活跃",
  inactive: "未激活",
  maintenance: "维护中",
};

/**
 * 设备列表页面
 */
export const DeviceListPage = () => {
  const [page, setPage] = useState(1);
  const [searchSerial, setSearchSerial] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // 表单状态
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceType, setDeviceType] = useState<string | null>(null);
  const [firmwareVersion, setFirmwareVersion] = useState("");

  // 查询设备列表
  const { data, isLoading, refetch } = useDevices({
    serial_number: searchSerial || undefined,
    device_type: filterType || undefined,
    status: filterStatus || undefined,
    page,
    page_size: 10,
  });

  // 获取患者列表用于绑定
  const { data: patientsData } = usePatients({ page: 1, page_size: 100 });

  // 注册设备
  const registerMutation = useRegisterDevice();

  // 删除设备
  const deleteMutation = useDeleteDevice();

  // 创建绑定
  const bindMutation = useCreateBinding();

  const handleRegisterDevice = async () => {
    if (!serialNumber.trim() || !deviceType) {
      notifications.show({
        title: "错误",
        message: "请填写序列号和设备类型",
        color: "red",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        serial_number: serialNumber,
        device_type: deviceType,
        firmware_version: firmwareVersion || undefined,
      });
      notifications.show({
        title: "成功",
        message: "设备注册成功",
        color: "green",
      });
      setModalOpen(false);
      setSerialNumber("");
      setDeviceType(null);
      setFirmwareVersion("");
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "注册失败",
        color: "red",
      });
    }
  };

  const handleDeleteDevice = async (id: string, serial: string) => {
    if (!confirm(`确定要删除设备 "${serial}" 吗？`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: "成功",
        message: "设备已删除",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "删除失败",
        color: "red",
      });
    }
  };

  const handleBindDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setSelectedPatientId(null);
    setBindModalOpen(true);
  };

  const handleConfirmBind = async () => {
    if (!selectedDeviceId || !selectedPatientId) {
      notifications.show({
        title: "错误",
        message: "请选择要绑定的患者",
        color: "red",
      });
      return;
    }

    try {
      await bindMutation.mutateAsync({
        device_id: selectedDeviceId,
        patient_id: selectedPatientId,
      });
      notifications.show({
        title: "成功",
        message: "设备绑定成功",
        color: "green",
      });
      setBindModalOpen(false);
      setSelectedDeviceId(null);
      setSelectedPatientId(null);
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "绑定失败",
        color: "red",
      });
    }
  };

  const devices = data?.data || [];
  const pagination = data?.pagination;

  const patientOptions = (patientsData?.data || []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconDeviceDesktop size={28} />
                设备管理
              </Group>
            </Title>
            <Text color="dimmed" size="sm" mt={4}>
              管理所有 IoT 设备
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
              onClick={() => setModalOpen(true)}
            >
              注册设备
            </Button>
          </Group>
        </Group>

        {/* 搜索和筛选栏 */}
        <Paper p="md" radius="md" withBorder>
          <Group>
            <TextInput
              placeholder="搜索序列号..."
              leftSection={<IconSearch size={16} />}
              value={searchSerial}
              onChange={(e) => setSearchSerial(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="设备类型"
              data={DEVICE_TYPE_OPTIONS}
              value={filterType}
              onChange={setFilterType}
              clearable
              style={{ width: 180 }}
            />
            <Select
              placeholder="状态"
              data={[
                { value: "active", label: "活跃" },
                { value: "inactive", label: "未激活" },
                { value: "maintenance", label: "维护中" },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              clearable
              style={{ width: 120 }}
            />
          </Group>
        </Paper>

        {/* 设备列表 */}
        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : devices.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconDeviceDesktop size={48} opacity={0.3} />
                <Text color="dimmed">暂无设备数据</Text>
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setModalOpen(true)}
                >
                  注册第一个设备
                </Button>
              </Stack>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>序列号</Table.Th>
                    <Table.Th>类型</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th>当前绑定</Table.Th>
                    <Table.Th>固件版本</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {devices.map((device) => (
                    <Table.Tr key={device.id}>
                      <Table.Td>
                        <Text fw={500} style={{ fontFamily: "monospace" }}>
                          {device.serial_number}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue">
                          {DEVICE_TYPE_OPTIONS.find(t => t.value === device.device_type)?.label || device.device_type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={DEVICE_STATUS_COLORS[device.status] || "gray"}
                        >
                          {DEVICE_STATUS_LABELS[device.status] || device.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {device.current_binding ? (
                          <Group gap="xs">
                            <Text size="sm">{device.current_binding.patient_name || "未知患者"}</Text>
                            <Kbd size="xs">已绑定</Kbd>
                          </Group>
                        ) : (
                          <Text color="dimmed" size="sm">未绑定</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {device.firmware_version || "-"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          {!device.current_binding && (
                            <Tooltip label="绑定患者">
                              <ActionIcon
                                variant="subtle"
                                color="teal"
                                onClick={() => handleBindDevice(device.id)}
                              >
                                <IconLink size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <Tooltip label="编辑">
                            <ActionIcon variant="subtle" color="blue">
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="删除">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeleteDevice(device.id, device.serial_number)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {/* 分页 */}
              {pagination && pagination.total_pages > 1 && (
                <Flex justify="center" p="md">
                  <Pagination
                    value={page}
                    onChange={setPage}
                    total={pagination.total_pages}
                  />
                </Flex>
              )}
            </>
          )}
        </Paper>
      </Stack>

      {/* 注册设备弹窗 */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="注册新设备"
      >
        <Stack gap="md">
          <TextInput
            label="设备序列号"
            placeholder="请输入设备序列号"
            required
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.currentTarget.value)}
          />
          <Select
            label="设备类型"
            placeholder="选择设备类型"
            data={DEVICE_TYPE_OPTIONS}
            value={deviceType}
            onChange={setDeviceType}
            required
          />
          <TextInput
            label="固件版本（可选）"
            placeholder="如 v1.0.0"
            value={firmwareVersion}
            onChange={(e) => setFirmwareVersion(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRegisterDevice} loading={registerMutation.isPending}>
              注册
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 绑定患者弹窗 */}
      <Modal
        opened={bindModalOpen}
        onClose={() => {
          setBindModalOpen(false);
          setSelectedDeviceId(null);
          setSelectedPatientId(null);
        }}
        title="绑定患者"
      >
        <Stack gap="md">
          <Text color="dimmed" size="sm">
            选择要绑定到此设备的患者
          </Text>
          <Select
            label="选择患者"
            placeholder="搜索并选择患者"
            data={patientOptions}
            value={selectedPatientId}
            onChange={setSelectedPatientId}
            searchable
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setBindModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleConfirmBind}
              loading={bindMutation.isPending}
              disabled={!selectedPatientId}
            >
              确认绑定
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};