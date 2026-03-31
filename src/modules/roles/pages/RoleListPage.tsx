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
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
  Modal,
  TextInput,
  Textarea,
  Checkbox,
  ScrollArea,
  Card,
  SimpleGrid,
  Divider,
  ThemeIcon,
  Alert,
} from "@mantine/core";
import {
  IconShield,
  IconPlus,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconKey,
  IconCheck,
  IconX,
  IconLock,
  IconUserShield,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
  useRolePermissions,
  useAssignPermission,
  useRevokePermission,
} from "../../../shared/api";
import { notifications } from "@mantine/notifications";
import type { Role, Permission } from "../../../shared/api";

/**
 * 角色权限管理页面
 * 管理员管理角色和分配权限
 */
export const RoleListPage = () => {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // 表单状态
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

  // 查询角色列表
  const { data: rolesData, isLoading: rolesLoading, refetch } = useRoles({
    page,
    page_size: 10,
  });

  // 查询所有权限
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions();

  // 查询选中角色的权限
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } =
    useRolePermissions(selectedRoleId || "");

  // 变更操作
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const assignPermissionMutation = useAssignPermission();
  const revokePermissionMutation = useRevokePermission();

  const roles = rolesData?.roles || [];
  const permissions = permissionsData?.permissions || [];
  const rolePermissions = rolePermissionsData?.permissions || [];

  // 按资源分组的权限
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((perm) => {
      if (!groups[perm.resource]) {
        groups[perm.resource] = [];
      }
      groups[perm.resource].push(perm);
    });
    return groups;
  }, [permissions]);

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      notifications.show({
        title: "错误",
        message: "请输入角色名称",
        color: "red",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: roleName,
        description: roleDescription || null,
      });
      notifications.show({
        title: "成功",
        message: "角色创建成功",
        color: "green",
      });
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "创建失败",
        color: "red",
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !roleName.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: editingRole.id,
        data: {
          name: roleName,
          description: roleDescription || null,
        },
      });
      notifications.show({
        title: "成功",
        message: "角色更新成功",
        color: "green",
      });
      setModalOpen(false);
      setEditingRole(null);
      resetForm();
      refetch();
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "更新失败",
        color: "red",
      });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      notifications.show({
        title: "错误",
        message: "系统角色不能删除",
        color: "red",
      });
      return;
    }

    if (!confirm(`确定要删除角色 "${role.name}" 吗？`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(role.id);
      notifications.show({
        title: "成功",
        message: "角色已删除",
        color: "green",
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "删除失败",
        color: "red",
      });
    }
  };

  const handlePermissionToggle = async (permissionId: string, checked: boolean) => {
    if (!selectedRoleId) return;

    try {
      if (checked) {
        await assignPermissionMutation.mutateAsync({
          id: selectedRoleId,
          data: { permission_id: permissionId },
        });
        notifications.show({
          title: "成功",
          message: "权限已分配",
          color: "green",
        });
      } else {
        await revokePermissionMutation.mutateAsync({
          id: selectedRoleId,
          permissionId,
        });
        notifications.show({
          title: "成功",
          message: "权限已撤销",
          color: "green",
        });
      }
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "操作失败",
        color: "red",
      });
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setModalOpen(true);
  };

  const openPermissionModal = (roleId: string) => {
    setSelectedRoleId(roleId);
    setPermissionModalOpen(true);
  };

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  const isPermissionChecked = (permissionId: string) => {
    return rolePermissions.some((p) => p.id === permissionId);
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconShield size={28} />
                角色权限管理
              </Group>
            </Title>
            <Text size="sm" mt={4}>
              管理系统角色和权限分配
            </Text>
          </div>
          <Group>
            <Tooltip label="刷新">
              <ActionIcon variant="light" onClick={() => refetch()} size="lg">
                <IconRefresh size={20} />
              </ActionIcon>
            </Tooltip>
            <Button leftSection={<IconPlus size={18} />} onClick={openCreateModal}>
              新增角色
            </Button>
          </Group>
        </Group>

        {/* 角色列表 */}
        <Paper radius="md" withBorder>
          {rolesLoading ? (
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
            <>
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
                        <Group gap="xs">
                          <ThemeIcon
                            size="sm"
                            variant="light"
                            color={role.name === "admin" ? "red" : "blue"}
                          >
                            {role.name === "admin" ? (
                              <IconUserShield size={14} />
                            ) : (
                              <IconUserShield size={14} />
                            )}
                          </ThemeIcon>
                          <Text fw={500}>{role.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {role.description || "-"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {role.is_system ? (
                          <Badge variant="light" color="yellow" size="sm">
                            系统
                          </Badge>
                        ) : (
                          <Badge variant="light" color="gray" size="sm">
                            自定义
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {formatDate(role.created_at)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <Tooltip label="权限管理">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => openPermissionModal(role.id)}
                            >
                              <IconKey size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="编辑">
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              onClick={() => openEditModal(role)}
                              disabled={role.is_system}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="删除">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeleteRole(role)}
                              disabled={role.is_system}
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
              {rolesData && rolesData.total > 10 && (
                <Flex justify="center" p="md">
                  <Pagination
                    value={page}
                    onChange={setPage}
                    total={Math.ceil(rolesData.total / 10)}
                  />
                </Flex>
              )}
            </>
          )}
        </Paper>

        {/* 权限概览卡片 */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Card withBorder padding="lg" radius="md">
            <Group mb="md">
              <ThemeIcon size="lg" variant="light" color="blue">
                <IconLock size={20} />
              </ThemeIcon>
              <div>
                <Text fw={500}>系统角色</Text>
                <Text size="sm" color="dimmed">
                  预定义的系统角色，不可删除
                </Text>
              </div>
            </Group>
            <Group gap="xs">
              <Badge variant="light" color="red">
                admin - 管理员
              </Badge>
              <Badge variant="light" color="blue">
                user - 普通用户
              </Badge>
            </Group>
          </Card>

          <Card withBorder padding="lg" radius="md">
            <Group mb="md">
              <ThemeIcon size="lg" variant="light" color="green">
                <IconCheck size={20} />
              </ThemeIcon>
              <div>
                <Text fw={500}>可用资源</Text>
                <Text size="sm" color="dimmed">
                  系统支持的权限资源类型
                </Text>
              </div>
            </Group>
            <Group gap="xs">
              {Object.keys(groupedPermissions).map((resource) => (
                <Badge key={resource} variant="light" size="sm">
                  {resource}
                </Badge>
              ))}
              {Object.keys(groupedPermissions).length === 0 && (
                <Text size="sm" color="dimmed">
                  加载中...
                </Text>
              )}
            </Group>
          </Card>
        </SimpleGrid>
      </Stack>

      {/* 创建/编辑角色弹窗 */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRole(null);
          resetForm();
        }}
        title={editingRole ? "编辑角色" : "新增角色"}
      >
        <Stack gap="md">
          <TextInput
            label="角色名称"
            placeholder="请输入角色名称"
            required
            value={roleName}
            onChange={(e) => setRoleName(e.currentTarget.value)}
          />
          <Textarea
            label="角色描述"
            placeholder="请输入角色描述（可选）"
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.currentTarget.value)}
            rows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setModalOpen(false);
                setEditingRole(null);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button
              onClick={editingRole ? handleUpdateRole : handleCreateRole}
              loading={
                editingRole
                  ? updateMutation.isPending
                  : createMutation.isPending
              }
            >
              {editingRole ? "保存" : "创建"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 权限管理弹窗 */}
      <Modal
        opened={permissionModalOpen}
        onClose={() => {
          setPermissionModalOpen(false);
          setSelectedRoleId(null);
        }}
        title={
          <Group gap="xs">
            <IconKey size={20} />
            <Text>权限管理 - {selectedRole?.name}</Text>
          </Group>
        }
        size="lg"
      >
        {rolePermissionsLoading || permissionsLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : (
          <Stack gap="md">
            {selectedRole?.is_system && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="yellow"
                variant="light"
              >
                系统角色的权限为预定义，不建议修改
              </Alert>
            )}

            <ScrollArea h={400}>
              <Stack gap="lg">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <Card key={resource} withBorder padding="sm" radius="sm">
                    <Group mb="sm">
                      <IconLock size={16} />
                      <Text fw={500} tt="uppercase">
                        {resource}
                      </Text>
                    </Group>
                    <Divider mb="sm" />
                    <Stack gap="xs">
                      {perms.map((perm) => (
                        <Group key={perm.id} justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>
                              {perm.action}
                            </Text>
                            {perm.description && (
                              <Text size="xs" color="dimmed">
                                {perm.description}
                              </Text>
                            )}
                          </div>
                          <Checkbox
                            checked={isPermissionChecked(perm.id)}
                            onChange={(e) =>
                              handlePermissionToggle(perm.id, e.currentTarget.checked)
                            }
                            disabled={
                              assignPermissionMutation.isPending ||
                              revokePermissionMutation.isPending
                            }
                          />
                        </Group>
                      ))}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </ScrollArea>

            <Group justify="flex-end">
              <Button
                onClick={() => {
                  setPermissionModalOpen(false);
                  setSelectedRoleId(null);
                }}
              >
                完成
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};
