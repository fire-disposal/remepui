import { useState, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Table,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
  Select,
  TextInput,
  Drawer,
  ScrollArea,
  JsonInput,
  Timeline,
  ThemeIcon,
} from "@mantine/core";
import {
  IconClipboardList,
  IconSearch,
  IconRefresh,
  IconEye,
  IconCheck,
  IconX,
  IconClock,
  IconUser,
  IconServer,
  IconActivity,
} from "@tabler/icons-react";
import { useAuditLogs, useAuditLog } from "../../../shared/api";
import { notifications } from "@mantine/notifications";
import type { AuditLog } from "../../../shared/api";

const STATUS_COLORS: Record<string, string> = {
  success: "green",
  failed: "red",
  pending: "yellow",
};

const STATUS_LABELS: Record<string, string> = {
  success: "成功",
  failed: "失败",
  pending: "处理中",
};

const ACTION_LABELS: Record<string, string> = {
  login: "登录",
  logout: "登出",
  create: "创建",
  update: "更新",
  delete: "删除",
  read: "查看",
  "change-password": "修改密码",
  "assign-role": "分配角色",
  "revoke-role": "撤销角色",
};

const RESOURCE_LABELS: Record<string, string> = {
  auth: "认证",
  user: "用户",
  patient: "患者",
  device: "设备",
  binding: "绑定",
  data: "数据",
  role: "角色",
  permission: "权限",
  audit: "审计",
};

/**
 * 审计日志列表页面
 * 管理员查看系统操作日志
 */
export const AuditLogListPage = () => {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterResource, setFilterResource] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 查询审计日志
  const { data, isLoading, refetch } = useAuditLogs({
    status: filterStatus || undefined,
    resource: filterResource || undefined,
    action: filterAction || undefined,
    page,
    page_size: 10,
  });

  // 获取选中日志详情
  const { data: selectedLog, isLoading: detailLoading } = useAuditLog(
    selectedLogId || ""
  );

  // 过滤搜索
  const logs = useMemo(() => {
    if (!data?.logs) return [];
    if (!searchQuery) return data.logs;
    return data.logs.filter(
      (log) =>
        log.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data?.logs, searchQuery]);

  const handleViewDetail = (logId: string) => {
    setSelectedLogId(logId);
    setDrawerOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  const getActionIcon = (action: string) => {
    if (action.includes("login")) return IconUser;
    if (action.includes("create")) return IconCheck;
    if (action.includes("delete")) return IconX;
    if (action.includes("update")) return IconActivity;
    return IconServer;
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "green";
    if (action.includes("delete")) return "red";
    if (action.includes("update")) return "blue";
    if (action.includes("login")) return "violet";
    return "gray";
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconClipboardList size={28} />
                审计日志
              </Group>
            </Title>
            <Text size="sm" mt={4}>
              查看系统操作记录和安全审计信息
            </Text>
          </div>
          <Tooltip label="刷新">
            <ActionIcon variant="light" onClick={() => refetch()} size="lg">
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* 筛选栏 */}
        <Paper p="md" radius="md" withBorder>
          <Group gap="md">
            <TextInput
              placeholder="搜索用户ID或资源ID..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <Select
              placeholder="状态筛选"
              data={[
                { value: "success", label: "成功" },
                { value: "failed", label: "失败" },
                { value: "pending", label: "处理中" },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              clearable
              style={{ width: 140 }}
            />
            <Select
              placeholder="资源类型"
              data={[
                { value: "auth", label: "认证" },
                { value: "user", label: "用户" },
                { value: "patient", label: "患者" },
                { value: "device", label: "设备" },
                { value: "binding", label: "绑定" },
                { value: "role", label: "角色" },
                { value: "permission", label: "权限" },
              ]}
              value={filterResource}
              onChange={setFilterResource}
              clearable
              style={{ width: 140 }}
            />
            <Select
              placeholder="操作类型"
              data={[
                { value: "login", label: "登录" },
                { value: "logout", label: "登出" },
                { value: "create", label: "创建" },
                { value: "update", label: "更新" },
                { value: "delete", label: "删除" },
                { value: "read", label: "查看" },
              ]}
              value={filterAction}
              onChange={setFilterAction}
              clearable
              style={{ width: 140 }}
            />
          </Group>
        </Paper>

        {/* 日志列表 */}
        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : logs.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconClipboardList size={48} opacity={0.3} />
                <Text color="dimmed">暂无审计日志</Text>
              </Stack>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>时间</Table.Th>
                    <Table.Th>操作</Table.Th>
                    <Table.Th>资源</Table.Th>
                    <Table.Th>用户ID</Table.Th>
                    <Table.Th>资源ID</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {logs.map((log) => (
                    <Table.Tr key={log.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconClock size={14} color="gray" />
                          <Text size="sm">{formatDate(log.created_at)}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={getActionColor(log.action)}
                          leftSection={(() => {
                            const Icon = getActionIcon(log.action);
                            return <Icon size={12} />;
                          })()}
                        >
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {RESOURCE_LABELS[log.resource] || log.resource}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed" style={{ fontFamily: "monospace" }}>
                          {log.user_id ? log.user_id.slice(0, 8) + "..." : "系统"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed" style={{ fontFamily: "monospace" }}>
                          {log.resource_id
                            ? log.resource_id.slice(0, 8) + "..."
                            : "-"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={STATUS_COLORS[log.status] || "gray"}
                        >
                          {STATUS_LABELS[log.status] || log.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <Tooltip label="查看详情">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewDetail(log.id)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {/* 分页 */}
              {data && data.total > 0 && (
                <Flex justify="center" p="md">
                  <Pagination
                    value={page}
                    onChange={setPage}
                    total={Math.ceil(data.total / (data.page_size || 10))}
                  />
                </Flex>
              )}
            </>
          )}
        </Paper>
      </Stack>

      {/* 详情抽屉 */}
      <Drawer
        opened={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedLogId(null);
        }}
        title="审计日志详情"
        position="right"
        size="lg"
        padding="xl"
      >
        {detailLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : selectedLog ? (
          <ScrollArea h="calc(100vh - 100px)">
            <Timeline active={-1} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                bullet={
                  <ThemeIcon size={22} variant="light" color={getActionColor(selectedLog.action)}>
                    {(() => {
                      const Icon = getActionIcon(selectedLog.action);
                      return <Icon size={14} />;
                    })()}
                  </ThemeIcon>
                }
                title={ACTION_LABELS[selectedLog.action] || selectedLog.action}
              >
                <Text size="xs" color="dimmed" mt={4}>
                  {formatDate(selectedLog.created_at)}
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={<IconUser size={12} />} title="操作信息">
                <Stack gap="xs" mt="xs">
                  <Group>
                    <Text size="sm" fw={500}>操作用户:</Text>
                    <Text size="sm" style={{ fontFamily: "monospace" }}>
                      {selectedLog.user_id || "系统"}
                    </Text>
                  </Group>
                  <Group>
                    <Text size="sm" fw={500}>资源类型:</Text>
                    <Badge variant="light" size="sm">
                      {RESOURCE_LABELS[selectedLog.resource] || selectedLog.resource}
                    </Badge>
                  </Group>
                  <Group>
                    <Text size="sm" fw={500}>资源ID:</Text>
                    <Text size="sm" style={{ fontFamily: "monospace" }}>
                      {selectedLog.resource_id || "-"}
                    </Text>
                  </Group>
                  <Group>
                    <Text size="sm" fw={500}>执行状态:</Text>
                    <Badge
                      variant="light"
                      color={STATUS_COLORS[selectedLog.status] || "gray"}
                      size="sm"
                    >
                      {STATUS_LABELS[selectedLog.status] || selectedLog.status}
                    </Badge>
                  </Group>
                </Stack>
              </Timeline.Item>

              {selectedLog.ip_address && (
                <Timeline.Item bullet={<IconServer size={12} />} title="请求信息">
                  <Stack gap="xs" mt="xs">
                    <Group>
                      <Text size="sm" fw={500}>IP 地址:</Text>
                      <Text size="sm">{selectedLog.ip_address}</Text>
                    </Group>
                    {selectedLog.user_agent && (
                      <Group>
                        <Text size="sm" fw={500}>User Agent:</Text>
                        <Text size="xs" color="dimmed" style={{ maxWidth: 300, wordBreak: "break-all" }}>
                          {selectedLog.user_agent}
                        </Text>
                      </Group>
                    )}
                    {selectedLog.duration_ms && (
                      <Group>
                        <Text size="sm" fw={500}>执行耗时:</Text>
                        <Text size="sm">{selectedLog.duration_ms}ms</Text>
                      </Group>
                    )}
                  </Stack>
                </Timeline.Item>
              )}

              <Timeline.Item bullet={<IconActivity size={12} />} title="详情数据">
                <Paper withBorder p="sm" radius="sm" mt="xs">
                  <JsonInput
                    value={JSON.stringify(selectedLog.details, null, 2)}
                    readOnly
                    autosize
                    minRows={6}
                    maxRows={20}
                    formatOnBlur
                    styles={{
                      input: {
                        fontFamily: "monospace",
                        fontSize: "12px",
                      },
                    }}
                  />
                </Paper>
              </Timeline.Item>

              {selectedLog.error_message && (
                <Timeline.Item bullet={<IconX size={12} />} title="错误信息" color="red">
                  <Paper withBorder p="sm" radius="sm" mt="xs" bg="red.0">
                    <Text size="sm" color="red">
                      {selectedLog.error_message}
                    </Text>
                  </Paper>
                </Timeline.Item>
              )}
            </Timeline>
          </ScrollArea>
        ) : null}
      </Drawer>
    </Container>
  );
};
