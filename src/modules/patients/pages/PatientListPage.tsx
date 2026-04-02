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
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconUser,
  IconRefresh,
} from "@tabler/icons-react";
import {
  usePatients,
  useCreatePatient,
  useDeletePatient,
  useUpdatePatient,
} from "../../../shared/api";
import { notifications } from "@mantine/notifications";

/**
 * 患者列表页面
 */
export const PatientListPage = () => {
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientExternalId, setNewPatientExternalId] = useState("");
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [editingPatientName, setEditingPatientName] = useState("");
  const [editingPatientExternalId, setEditingPatientExternalId] = useState("");

  // 查询患者列表
  const { data, isLoading, refetch } = usePatients({
    name: searchName || undefined,
    page,
    page_size: 10,
  });

  // 创建患者
  const createMutation = useCreatePatient();

  // 删除患者
  const deleteMutation = useDeletePatient();
  const updateMutation = useUpdatePatient();

  const handleCreatePatient = async () => {
    if (!newPatientName.trim()) {
      notifications.show({
        title: "错误",
        message: "请输入患者姓名",
        color: "red",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: newPatientName,
        external_id: newPatientExternalId || undefined,
      });
      notifications.show({
        title: "成功",
        message: "患者创建成功",
        color: "green",
      });
      setModalOpen(false);
      setNewPatientName("");
      setNewPatientExternalId("");
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "创建失败",
        color: "red",
      });
    }
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (!confirm(`确定要删除患者 "${name}" 吗？`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: "成功",
        message: "患者已删除",
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

  const handleOpenEditPatient = (id: string, name: string, externalId?: string) => {
    setEditingPatientId(id);
    setEditingPatientName(name);
    setEditingPatientExternalId(externalId || "");
    setEditModalOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!editingPatientId) {
      return;
    }
    if (!editingPatientName.trim()) {
      notifications.show({
        title: "错误",
        message: "请输入患者姓名",
        color: "red",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingPatientId,
        data: {
          name: editingPatientName.trim(),
          external_id: editingPatientExternalId.trim() || undefined,
        },
      });
      notifications.show({
        title: "成功",
        message: "患者信息更新成功",
        color: "green",
      });
      setEditModalOpen(false);
      setEditingPatientId(null);
      setEditingPatientName("");
      setEditingPatientExternalId("");
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "更新失败",
        color: "red",
      });
    }
  };

  const patients = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconUser size={28} />
                患者管理
              </Group>
            </Title>
            <Text size="sm" mt={4}>
              管理所有患者信息
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
              新增患者
            </Button>
          </Group>
        </Group>

        {/* 搜索栏 */}
        <Paper p="md" radius="md" withBorder>
          <Group>
            <TextInput
              placeholder="搜索患者姓名..."
              leftSection={<IconSearch size={16} />}
              value={searchName}
              onChange={(e) => {
                setSearchName(e.currentTarget.value);
                setPage(1);
              }}
              style={{ flex: 1 }}
            />
          </Group>
        </Paper>

        {/* 患者列表 */}
        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : patients.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconUser size={48} opacity={0.3} />
                <Text color="dimmed">暂无患者数据</Text>
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setModalOpen(true)}
                >
                  添加第一个患者
                </Button>
              </Stack>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>姓名</Table.Th>
                    <Table.Th>外部ID</Table.Th>
                    <Table.Th>创建时间</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {patients.map((patient) => (
                    <Table.Tr key={patient.id}>
                      <Table.Td>
                        <Text fw={500}>{patient.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        {patient.external_id ? (
                          <Badge variant="light" color="blue">
                            {patient.external_id}
                          </Badge>
                        ) : (
                          <Text color="dimmed">-</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {new Date(patient.created_at).toLocaleDateString("zh-CN")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <Tooltip label="编辑">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleOpenEditPatient(patient.id, patient.name, patient.external_id)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="删除">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeletePatient(patient.id, patient.name)}
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

      {/* 新增患者弹窗 */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="新增患者"
      >
        <Stack gap="md">
          <TextInput
            label="患者姓名"
            placeholder="请输入患者姓名"
            required
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.currentTarget.value)}
          />
          <TextInput
            label="外部ID（可选）"
            placeholder="如医院系统ID等"
            value={newPatientExternalId}
            onChange={(e) => setNewPatientExternalId(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreatePatient} loading={createMutation.isPending}>
              创建
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 编辑患者弹窗 */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPatientId(null);
          setEditingPatientName("");
          setEditingPatientExternalId("");
        }}
        title="编辑患者信息"
      >
        <Stack gap="md">
          <TextInput
            label="患者姓名"
            placeholder="请输入患者姓名"
            required
            value={editingPatientName}
            onChange={(e) => setEditingPatientName(e.currentTarget.value)}
          />
          <TextInput
            label="外部ID（可选）"
            placeholder="如医院系统ID等"
            value={editingPatientExternalId}
            onChange={(e) => setEditingPatientExternalId(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setEditModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdatePatient} loading={updateMutation.isPending}>
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};
