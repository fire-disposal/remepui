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
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
  PasswordInput,
  ScrollArea,
  Divider,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUsers,
  IconRefresh,
  IconShield,
  IconUser,
  IconEye,
  IconLock,
} from "@tabler/icons-react";
import { useUsers, useCreateUser, useDeleteUser, useRoles, useRoleModules } from "../../../shared/api";
import { notifications } from "@mantine/notifications";

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  inactive: "gray",
  locked: "red",
};

const STATUS_LABELS: Record<string, string> = {
  active: "活跃",
  inactive: "未激活",
  locked: "锁定",
};

/**
 * 用户管理页面
 * 
 * 适配新版 RBAC（基于 role_id 和 role_name）
 */
export const UserListPage = () => {
  const [page, setPage] = useState(1);
  const [filterRoleId, setFilterRoleId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserRoleId, setSelectedUserRoleId] = useState<string | null>(null);

  // 获取角色列表
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  
  // 构建角色选项
  const roleOptions = useMemo(() => {
    return rolesData?.roles.map(role => ({
      value: role.id,
      label: role.name === 'admin' ? '管理员' : 
             role.name === 'user' ? '普通用户' : role.name,
    })) || [];
  }, [rolesData]);

  // 表单状态 - 使用 role_id
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // 查询用户列表 - 使用 role_id 筛选
  const { data, isLoading, refetch } = useUsers({
    role_id: filterRoleId || undefined,
    status: filterStatus || undefined,
    page,
    page_size: 10,
  });

  // 创建用户
  const createMutation = useCreateUser();

  // 删除用户
  const deleteMutation = useDeleteUser();

  // 获取选中用户的角色模块
  const { data: userRoleModules } = useRoleModules(selectedUserRoleId || "");

  const handleCreateUser = async () => {
    if (!username.trim() || !password.trim()) {
      notifications.show({
        title: "错误",
        message: "请填写用户名和密码",
        color: "red",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        username,
        password,
        role_id: roleId || roleOptions[1]?.value || roleOptions[0]?.value, // 使用 role_id 而非 role
        email: email || undefined,
        phone: phone || undefined,
      });
      notifications.show({
        title: "成功",
        message: "用户创建成功",
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

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`确定要删除用户 "${username}" 吗？`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: "成功",
        message: "用户已删除",
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

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setRoleId(roleOptions[1]?.value || roleOptions[0]?.value || "");
    setEmail("");
    setPhone("");
  };

  const openPermissionsModal = (userId: string, userRoleId: string) => {
    setSelectedUserId(userId);
    setSelectedUserRoleId(userRoleId);
    setPermissionsModalOpen(true);
  };

  const users = data?.data || [];
  const pagination = data?.pagination;

  /**
   * 获取角色显示名称
   */
  const getRoleDisplayName = (user: typeof users[0]): string => {
    // 优先使用 role_name
    if (user.role_name) {
      return user.role_name === 'admin' ? '管理员' : 
             user.role_name === 'user' ? '普通用户' : user.role_name;
    }
    // 回退：查找 role_id 对应的角色
    const role = rolesData?.roles.find(r => r.id === user.role_id);
    if (role) {
      return role.name === 'admin' ? '管理员' : 
             role.name === 'user' ? '普通用户' : role.name;
    }
    return "未知角色";
  };

  /**
   * 检查是否为管理员
   */
  const isUserAdmin = (user: typeof users[0]): boolean => {
    return user.role_name?.toLowerCase() === "admin" || 
           rolesData?.roles.find(r => r.id === user.role_id)?.name === "admin";
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconUsers size={28} />
                用户管理
              </Group>
            </Title>
            <Text size="sm" mt={4}>
              管理系统用户账户
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
              新增用户
            </Button>
          </Group>
        </Group>

        {/* 筛选栏 */}
        <Paper p="md" radius="md" withBorder>
          <Group>
            <Select
              placeholder="角色筛选"
              data={roleOptions}
              value={filterRoleId}
              onChange={setFilterRoleId}
              clearable
              disabled={rolesLoading}
              style={{ width: 150 }}
            />
            <Select
              placeholder="状态筛选"
              data={[
                { value: "active", label: "活跃" },
                { value: "inactive", label: "未激活" },
                { value: "locked", label: "锁定" },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              clearable
              style={{ width: 150 }}
            />
          </Group>
        </Paper>

        {/* 用户列表 */}
        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : users.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconUsers size={48} opacity={0.3} />
                <Text color="dimmed">暂无用户数据</Text>
              </Stack>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>用户名</Table.Th>
                    <Table.Th>角色</Table.Th>
                    <Table.Th>联系方式</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th>最后登录</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconUser size={16} />
                          <Text fw={500}>{user.username}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={isUserAdmin(user) ? "blue" : "gray"}
                          leftSection={
                            isUserAdmin(user) ? (
                              <IconShield size={12} />
                            ) : null
                          }
                        >
                          {getRoleDisplayName(user)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          {user.email && (
                            <Text size="sm" color="dimmed">
                              {user.email}
                            </Text>
                          )}
                          {user.phone && (
                            <Text size="sm" color="dimmed">
                              {user.phone}
                            </Text>
                          )}
                          {!user.email && !user.phone && (
                            <Text size="sm" color="dimmed">
                              -
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={STATUS_COLORS[user.status] || "gray"}
                        >
                          {STATUS_LABELS[user.status] || user.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {user.last_login_at
                            ? new Date(user.last_login_at).toLocaleString("zh-CN")
                            : "从未登录"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <Tooltip label="查看权限">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => openPermissionsModal(user.id, user.role_id)}
                            >
                              <IconLock size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="编辑">
                            <ActionIcon variant="subtle" color="blue">
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="删除">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDeleteUser(user.id, user.username)}
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

      {/* 新增用户弹窗 */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="新增用户"
      >
        <Stack gap="md">
          <TextInput
            label="用户名"
            placeholder="请输入用户名"
            required
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <PasswordInput
            label="密码"
            placeholder="请输入密码"
            required
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Select
            label="角色"
            data={roleOptions}
            value={roleId}
            onChange={(v) => setRoleId(v || "")}
            disabled={rolesLoading}
          />
          <TextInput
            label="邮箱（可选）"
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <TextInput
            label="手机号（可选）"
            placeholder="13800138000"
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateUser} loading={createMutation.isPending}>
              创建
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 查看权限弹窗 */}
      <Modal
        opened={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false);
          setSelectedUserId(null);
          setSelectedUserRoleId(null);
        }}
        title="用户权限信息"
        size="lg"
      >
        <ScrollArea h={400}>
          <Stack gap="md">
            <Group>
              <Text fw={500}>角色：</Text>
              <Badge color="blue">
                {rolesData?.roles.find((r) => r.id === selectedUserRoleId)?.name ||
                  "未知角色"}
              </Badge>
            </Group>
            <Divider />
            <Text fw={500}>可访问模块：</Text>
            {userRoleModules?.modules && userRoleModules.modules.length > 0 ? (
              <Stack gap="xs">
                {userRoleModules.modules.map((module) => (
                  <Paper key={module.id} p="sm" withBorder>
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>{module.name}</Text>
                        {module.description && (
                          <Text size="xs" color="dimmed">
                            {module.description}
                          </Text>
                        )}
                      </div>
                      <Badge
                        size="xs"
                        variant="light"
                        color={
                          module.category === "core"
                            ? "blue"
                            : module.category === "admin"
                            ? "grape"
                            : "teal"
                        }
                      >
                        {module.category === "core"
                          ? "核心"
                          : module.category === "admin"
                          ? "管理"
                          : "特色"}
                      </Badge>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Text color="dimmed">暂无模块权限</Text>
            )}
          </Stack>
        </ScrollArea>
      </Modal>
    </Container>
  );
};
