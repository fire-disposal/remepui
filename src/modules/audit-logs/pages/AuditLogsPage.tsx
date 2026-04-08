import { useState } from "react";
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
  Modal,
  ScrollArea,
  Divider,
} from "@mantine/core";
import {
  IconRefresh,
  IconClipboardText,
  IconEye,
  IconUser,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { useAuditLogs, useAuditLog } from "../../../shared/api";
import { notifications } from "@mantine/notifications";

const STATUS_COLORS: Record<string, string> = {
  success: "green",
  failed: "red",
  pending: "yellow",
};

const STATUS_LABELS: Record<string, string> = {
  success: "成功",
  failed: "失败",
  pending: "待处理",
};

export const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterResource, setFilterResource] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [startTimeStr, setStartTimeStr] = useState<string>("");
  const [endTimeStr, setEndTimeStr] = useState<string>("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useAuditLogs({
    user_id: filterUserId || undefined,
    action: filterAction || undefined,
    resource: filterResource || undefined,
    status: filterStatus || undefined,
    start_time: startTimeStr || undefined,
    end_time: endTimeStr || undefined,
    page,
    page_size: 20,
  });

  const { data: logDetail } = useAuditLog(selectedLogId || "");

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const actionOptions = [
    { value: "login", label: "登录" },
    { value: "logout", label: "登出" },
    { value: "create", label: "创建" },
    { value: "update", label: "更新" },
    { value: "delete", label: "删除" },
    { value: "read", label: "读取" },
  ];

  const resourceOptions = [
    { value: "user", label: "用户" },
    { value: "patient", label: "患者" },
    { value: "device", label: "设备" },
    { value: "binding", label: "绑定" },
    { value: "data", label: "数据" },
    { value: "role", label: "角色" },
    { value: "permission", label: "权限" },
  ];

  const openDetailModal = (logId: string) => {
    setSelectedLogId(logId);
    setDetailModalOpen(true);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconClipboardText size={28} />
                审计日志
              </Group>
            </Title>
            <Text size="sm" mt={4}>
              查看系统操作记录和审计日志
            </Text>
          </div>
          <Group>
            <Tooltip label="刷新">
              <ActionIcon variant="light" onClick={() => refetch()}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Paper p="md" radius="md" withBorder>
          <Group>
            <TextInput
              placeholder="用户 ID"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.currentTarget.value)}
              style={{ width: 150 }}
            />
            <Select
              placeholder="操作类型"
              data={actionOptions}
              value={filterAction}
              onChange={setFilterAction}
              clearable
              style={{ width: 120 }}
            />
            <Select
              placeholder="资源类型"
              data={resourceOptions}
              value={filterResource}
              onChange={setFilterResource}
              clearable
              style={{ width: 120 }}
            />
            <Select
              placeholder="状态"
              data={[
                { value: "success", label: "成功" },
                { value: "failed", label: "失败" },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              clearable
              style={{ width: 100 }}
            />
            <TextInput
              placeholder="开始时间 (YYYY-MM-DD)"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.currentTarget.value)}
              style={{ width: 150 }}
            />
            <TextInput
              placeholder="结束时间 (YYYY-MM-DD)"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.currentTarget.value)}
              style={{ width: 150 }}
            />
          </Group>
        </Paper>

        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : logs.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconClipboardText size={48} opacity={0.3} />
                <Text color="dimmed">暂无审计日志数据</Text>
              </Stack>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>时间</Table.Th>
                    <Table.Th>用户</Table.Th>
                    <Table.Th>操作</Table.Th>
                    <Table.Th>资源</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th>IP 地址</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {logs.map((log) => (
                    <Table.Tr key={log.id}>
                      <Table.Td>
                        <Text size="sm">{formatDateTime(log.created_at)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconUser size={14} />
                          <Text size="sm">{log.user_id || "系统"}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">{log.action}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{log.resource}</Text>
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
                        <Group gap="xs">
                          <IconDeviceDesktop size={14} />
                          <Text size="sm" color="dimmed">
                            {log.ip_address || "-"}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <Tooltip label="查看详情">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => openDetailModal(log.id)}
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

              {totalPages > 1 && (
                <Flex justify="center" p="md">
                  <Pagination
                    value={page}
                    onChange={setPage}
                    total={totalPages}
                  />
                </Flex>
              )}
            </>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLogId(null);
        }}
        title="审计日志详情"
        size="lg"
      >
        {logDetail ? (
          <ScrollArea h={400}>
            <Stack gap="md">
              <Group>
                <Text fw={500}>时间:</Text>
                <Text>{formatDateTime(logDetail.created_at)}</Text>
              </Group>
              <Divider />
              <Group>
                <Text fw={500}>用户 ID:</Text>
                <Text>{logDetail.user_id || "系统操作"}</Text>
              </Group>
              <Group>
                <Text fw={500}>操作:</Text>
                <Badge variant="light">{logDetail.action}</Badge>
              </Group>
              <Group>
                <Text fw={500}>资源:</Text>
                <Text>{logDetail.resource}</Text>
              </Group>
              <Group>
                <Text fw={500}>资源 ID:</Text>
                <Text>{logDetail.resource_id || "-"}</Text>
              </Group>
              <Divider />
              <Group>
                <Text fw={500}>状态:</Text>
                <Badge
                  variant="light"
                  color={STATUS_COLORS[logDetail.status] || "gray"}
                >
                  {STATUS_LABELS[logDetail.status] || logDetail.status}
                </Badge>
              </Group>
              {logDetail.error_message && (
                <Group>
                  <Text fw={500}>错误信息:</Text>
                  <Text color="red">{logDetail.error_message}</Text>
                </Group>
              )}
              <Divider />
              <Group>
                <Text fw={500}>IP 地址:</Text>
                <Text>{logDetail.ip_address || "-"}</Text>
              </Group>
              <Group>
                <Text fw={500}>User Agent:</Text>
                <Text size="sm" color="dimmed">
                  {logDetail.user_agent || "-"}
                </Text>
              </Group>
              {logDetail.duration_ms && (
                <Group>
                  <Text fw={500}>耗时:</Text>
                  <Text>{logDetail.duration_ms}ms</Text>
                </Group>
              )}
              <Divider />
              <Text fw={500}>详情:</Text>
              <Paper p="sm" withBorder>
                <pre style={{ fontSize: "12px", overflow: "auto" }}>
                  {JSON.stringify(logDetail.details, null, 2)}
                </pre>
              </Paper>
            </Stack>
          </ScrollArea>
        ) : (
          <Center p="xl">
            <Loader />
          </Center>
        )}
      </Modal>
    </Container>
  );
};