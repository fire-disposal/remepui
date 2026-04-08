import { useState, useMemo } from "react";
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
  ScrollArea,
  Checkbox,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconShield,
  IconRefresh,
  IconLock,
} from "@tabler/icons-react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useModules,
  useRoleModules,
  useSetRoleModules,
} from "../../../shared/api";
import { notifications } from "@mantine/notifications";

const CATEGORY_LABELS: Record<string, string> = {
  core: "核心功能",
  admin: "管理功能",
  feature: "特色功能",
};

const CATEGORY_COLORS: Record<string, string> = {
  core: "blue",
  admin: "grape",
  feature: "teal",
};

export const RolesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, refetch } = useRoles();
  const { data: modulesData } = useModules();

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const setModulesMutation = useSetRoleModules();

  const { data: roleModules, refetch: refetchRoleModules } =
    useRoleModules(selectedRoleId || "");

  const roles = data?.roles || [];
  const modules = modulesData?.modules || [];

  const selectedModules = useMemo(() => {
    return roleModules?.modules || [];
  }, [roleModules]);

  const handleCreateRole = async () => {
    if (!name.trim()) {
      notifications.show({
        title: "错误",
        message: "请填写角色名称",
        color: "red",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name,
        description: description || null,
      });
      notifications.show({
        title: "成功",
        message: "角色创建成功",
        color: "green",
      });
      setModalOpen(false);
      resetForm();
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "创建失败",
        color: "red",
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRoleId || !name.trim()) {
      notifications.show({
        title: "错误",
        message: "请填写角色名称",
        color: "red",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedRoleId,
        data: {
          name,
          description: description || null,
        },
      });
      notifications.show({
        title: "成功",
        message: "角色更新成功",
        color: "green",
      });
      setEditModalOpen(false);
      resetForm();
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "更新失败",
        color: "red",
      });
    }
  };

  const handleDeleteRole = async (
    id: string,
    roleName: string,
    isSystem: boolean
  ) => {
    if (isSystem) {
      notifications.show({
        title: "错误",
        message: "系统角色不能删除",
        color: "red",
      });
      return;
    }

    if (!confirm(`确定要删除角色 "${roleName}" 吗？`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: "成功",
        message: "角色已删除",
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

  const handleToggleModule = async (moduleId: string, checked: boolean) => {
    if (!selectedRoleId) return;

    const currentIds = selectedModules.map((m) => m.id);
    const newIds = checked
      ? [...currentIds, moduleId]
      : currentIds.filter((id) => id !== moduleId);

    try {
      await setModulesMutation.mutateAsync({
        id: selectedRoleId,
        data: { module_ids: newIds },
      });
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "操作失败",
        color: "red",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedRoleId(null);
  };

  const openEditModal = (role: (typeof roles)[0]) => {
    setSelectedRoleId(role.id);
    setName(role.name);
    setDescription(role.description || "");
    setEditModalOpen(true);
  };

  const openPermissionsModal = (roleId: string) => {
    setSelectedRoleId(roleId);
    setPermissionsModalOpen(true);
  };

  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, typeof modules> = {};
    for (const mod of modules) {
      if (!grouped[mod.category]) {
        grouped[mod.category] = [];
      }
      grouped[mod.category].push(mod);
    }
    return grouped;
  }, [modules]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconShield size={28} />
                角色管理
              </Group>
            </Title>
            <Text size="sm" mt={4}>
              管理系统角色和模块权限配置
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
              新增角色
            </Button>
          </Group>
        </Group>

        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : roles.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconShield size={48} opacity={0.3} />
                <Text color="dimmed">暂无角色数据</Text>
              </Stack>
            </Center>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>角色名称</Table.Th>
                  <Table.Th>描述</Table.Th>
                  <Table.Th>类型</Table.Th>
                  <Table.Th>创建时间</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {roles.map((role) => (
                  <Table.Tr key={role.id}>
                    <Table.Td>
                      <Text fw={500}>{role.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" color="dimmed">
                        {role.description || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={role.is_system ? "blue" : "gray"}
                      >
                        {role.is_system ? "系统角色" : "自定义角色"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" color="dimmed">
                        {new Date(role.created_at).toLocaleString("zh-CN")}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="flex-end" gap="xs">
                        <Tooltip label="模块权限配置">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => openPermissionsModal(role.id)}
                          >
                            <IconLock size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="编辑">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => openEditModal(role)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="删除">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() =>
                              handleDeleteRole(role.id, role.name, role.is_system)
                            }
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
          )}
        </Paper>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="新增角色"
      >
        <Stack gap="md">
          <TextInput
            label="角色名称"
            placeholder="请输入角色名称"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <TextInput
            label="描述（可选）"
            placeholder="请输入角色描述"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateRole} loading={createMutation.isPending}>
              创建
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          resetForm();
        }}
        title="编辑角色"
      >
        <Stack gap="md">
          <TextInput
            label="角色名称"
            placeholder="请输入角色名称"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <TextInput
            label="描述（可选）"
            placeholder="请输入角色描述"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setEditModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateRole} loading={updateMutation.isPending}>
              更新
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false);
          setSelectedRoleId(null);
        }}
        title="模块权限配置"
        size="lg"
      >
        <ScrollArea h={400}>
          <Stack gap="lg">
            {Object.entries(modulesByCategory).map(([category, mods]) => (
              <Paper key={category} p="md" withBorder>
                <Group mb="sm">
                  <Badge color={CATEGORY_COLORS[category] || "gray"}>
                    {CATEGORY_LABELS[category] || category}
                  </Badge>
                </Group>
                <Stack gap="xs">
                  {mods.map((mod) => (
                    <Checkbox
                      key={mod.id}
                      label={
                        <Group gap="xs">
                          <Text fw={500}>{mod.name}</Text>
                          {mod.description && (
                            <Text size="sm" color="dimmed">
                              - {mod.description}
                            </Text>
                          )}
                        </Group>
                      }
                      checked={selectedModules.some((m) => m.id === mod.id)}
                      onChange={(e) =>
                        handleToggleModule(mod.id, e.currentTarget.checked)
                      }
                    />
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Modal>
    </Container>
  );
};