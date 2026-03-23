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
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
  Modal,
  Checkbox,
  Box,
} from "@mantine/core";
import {
  IconLink,
  IconRefresh,
  IconTrash,
  IconPlus,
  IconDeviceDesktop,
  IconUser,
} from "@tabler/icons-react";
import { useBindings, useCreateBinding, useDeleteBinding, useDevices, usePatients } from "../../../shared/api";
import { notifications } from "@mantine/notifications";

/**
 * 绑定关系列表页面
 */
export const BindingListPage = () => {
  const [page, setPage] = useState(1);
  const [filterDeviceId, setFilterDeviceId] = useState<string | null>(null);
  const [filterPatientId, setFilterPatientId] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // 查询绑定列表
  const { data, isLoading, refetch } = useBindings({
    device_id: filterDeviceId || undefined,
    patient_id: filterPatientId || undefined,
    active_only: activeOnly,
    page,
    page_size: 10,
  });

  // 获取设备和患者列表用于选择
  const { data: devicesData } = useDevices({ page: 1, page_size: 100 });
  const { data: patientsData } = usePatients({ page: 1, page_size: 100 });

  // 创建绑定
  const createMutation = useCreateBinding();

  // 删除绑定
  const deleteMutation = useDeleteBinding();

  const handleCreateBinding = async () => {
    if (!selectedDeviceId || !selectedPatientId) {
      notifications.show({
        title: "错误",
        message: "请选择设备和患者",
        color: "red",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        device_id: selectedDeviceId,
        patient_id: selectedPatientId,
      });
      notifications.show({
        title: "成功",
        message: "绑定创建成功",
        color: "green",
      });
      setModalOpen(false);
      setSelectedDeviceId(null);
      setSelectedPatientId(null);
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "创建失败",
        color: "red",
      });
    }
  };

  const handleDeleteBinding = async (id: string) => {
    if (!confirm("确定要解除此绑定吗？")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: "成功",
        message: "绑定已解除",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "解除失败",
        color: "red",
      });
    }
  };

  const bindings = data?.data || [];
  const pagination = data?.pagination;

  const deviceOptions = (devicesData?.data || []).map((d) => ({
    value: d.id,
    label: `${d.serial_number} (${d.device_type})`,
  }));

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
                <IconLink size={28} />
                绑定关系
              </Group>
            </Title>
            <Text color="dimmed" size="sm" mt={4}>
              管理设备与患者的绑定关系
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
              新建绑定
            </Button>
          </Group>
        </Group>

        {/* 筛选栏 */}
        <Paper p="md" radius="md" withBorder>
          <Group>
            <Select
              placeholder="筛选设备"
              data={deviceOptions}
              value={filterDeviceId}
              onChange={setFilterDeviceId}
              clearable
              searchable
              style={{ flex: 1 }}
            />
            <Select
              placeholder="筛选患者"
              data={patientOptions}
              value={filterPatientId}
              onChange={setFilterPatientId}
              clearable
              searchable
              style={{ flex: 1 }}
            />
            <Checkbox
              label="仅显示有效绑定"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.currentTarget.checked)}
            />
          </Group>
        </Paper>

        {/* 绑定列表 */}
        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : bindings.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconLink size={48} opacity={0.3} />
                <Text color="dimmed">暂无绑定数据</Text>
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setModalOpen(true)}
                >
                  创建第一个绑定
                </Button>
              </Stack>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>设备ID</Table.Th>
                    <Table.Th>患者ID</Table.Th>
                    <Table.Th>绑定时间</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {bindings.map((binding) => (
                    <Table.Tr key={binding.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconDeviceDesktop size={16} />
                          <Text size="sm" style={{ fontFamily: "monospace" }}>
                            {binding.device_id.slice(0, 8)}...
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconUser size={16} />
                          <Text size="sm" style={{ fontFamily: "monospace" }}>
                            {binding.patient_id.slice(0, 8)}...
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {new Date(binding.started_at).toLocaleString("zh-CN")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {binding.ended_at ? (
                          <Badge variant="light" color="gray">
                            已解除
                          </Badge>
                        ) : (
                          <Badge variant="light" color="green">
                            有效
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          {!binding.ended_at && (
                            <Tooltip label="解除绑定">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDeleteBinding(binding.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
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

      {/* 新建绑定弹窗 */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDeviceId(null);
          setSelectedPatientId(null);
        }}
        title="新建绑定"
      >
        <Stack gap="md">
          <Select
            label="选择设备"
            placeholder="选择要绑定的设备"
            data={deviceOptions}
            value={selectedDeviceId}
            onChange={setSelectedDeviceId}
            searchable
            required
          />
          <Select
            label="选择患者"
            placeholder="选择要绑定的患者"
            data={patientOptions}
            value={selectedPatientId}
            onChange={setSelectedPatientId}
            searchable
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleCreateBinding}
              loading={createMutation.isPending}
              disabled={!selectedDeviceId || !selectedPatientId}
            >
              创建绑定
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};