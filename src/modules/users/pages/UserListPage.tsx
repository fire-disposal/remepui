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
  PasswordInput,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconUsers,
  IconRefresh,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import { useUsers, useCreateUser, useDeleteUser } from "../../../shared/api";
import { notifications } from "@mantine/notifications";
import { UserRoles, UserStatus } from "../../../shared/api/types";

const ROLE_OPTIONS = [
  { value: UserRoles.ADMIN, label: "管理员" },
  { value: UserRoles.USER, label: "普通用户" },
];

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
 */
export const UserListPage = () => {
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 表单状态
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>(UserRoles.USER);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // 查询用户列表
  const { data, isLoading, refetch } = useUsers({
    role: filterRole || undefined,
    status: filterStatus || undefined,
    page,
    page_size: 10,
  });

  // 创建用户
  const createMutation = useCreateUser();

  // 删除用户
  const deleteMutation = useDeleteUser();

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
        role,
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
    setRole(UserRoles.USER);
    setEmail("");
    setPhone("");
  };

  const users = data?.data || [];
  const pagination = data?.pagination;

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
            <Text color="dimmed" size="sm" mt={4}>
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
              data={ROLE_OPTIONS}
              value={filterRole}
              onChange={setFilterRole}
              clearable
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
                          color={user.role === UserRoles.ADMIN ? "blue" : "gray"}
                          leftSection={
                            user.role === UserRoles.ADMIN ? (
                              <IconShield size={12} />
                            ) : null
                          }
                        >
                          {ROLE_OPTIONS.find((r) => r.value === user.role)?.label ||
                            user.role}
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
            data={ROLE_OPTIONS}
            value={role}
            onChange={(v) => setRole(v || UserRoles.USER)}
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
    </Container>
  );
};