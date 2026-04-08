import { useState, useMemo, useCallback } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Table,
  Group,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
  Select,
  TextInput,
  Chip,
  Drawer,
  ScrollArea,
  Checkbox,
  Menu,
  Alert,
  Divider,
  Modal,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconDatabase,
  IconRefresh,
  IconFilter,
  IconEye,
  IconDownload,
  IconTrash,
  IconChevronDown,
  IconFileText,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRawData, rawDataApi } from '../../../shared/api';
import { JsonViewer } from '../components/JsonViewer';
import { notifications } from '@mantine/notifications';

const STATUS_CONFIG = {
  stored: { color: 'blue', label: '已存储' },
  ingested: { color: 'green', label: '已处理' },
  ignored: { color: 'gray', label: '已忽略' },
  format_error: { color: 'orange', label: '格式错误' },
  processing_error: { color: 'red', label: '处理错误' },
};

export const RawDataPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterSerialNumber, setFilterSerialNumber] = useState<string>('');
  const [filterDeviceType, setFilterDeviceType] = useState<string | null>(null);
  const [filterStartTime, setFilterStartTime] = useState<string | null>(null);
  const [filterEndTime, setFilterEndTime] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useRawData({
    source: filterSource || undefined,
    status: filterStatus || undefined,
    serial_number: filterSerialNumber || undefined,
    device_type: filterDeviceType || undefined,
    start_time: filterStartTime || undefined,
    end_time: filterEndTime || undefined,
    page,
    page_size: pageSize,
  });

  const records = data?.data || [];
  const pagination = data?.pagination;

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === records.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(records.map(r => r.id)));
    }
  };

  const handleViewDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailDrawerOpen(true);
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      notifications.show({
        title: '导出中',
        message: '正在准备下载数据...',
        color: 'blue',
        loading: true,
      });

      const blob = await rawDataApi.export({
        source: filterSource || undefined,
        serial_number: filterSerialNumber || undefined,
        device_type: filterDeviceType || undefined,
        status: filterStatus || undefined,
      }, format);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raw-data-export-${new Date().toISOString()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      notifications.show({
        title: '导出成功',
        message: '数据已下载',
        color: 'green',
      });
      setExportModalOpen(false);
    } catch (error) {
      notifications.show({
        title: '导出失败',
        message: error instanceof Error ? error.message : '未知错误',
        color: 'red',
      });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRows.size === 0) return;
    
    if (!confirm(`确定要删除 ${selectedRows.size} 条记录吗？此操作不可恢复。`)) return;

    try {
      // 模拟批量删除
      notifications.show({
        title: '删除中',
        message: `正在删除 ${selectedRows.size} 条记录...`,
        color: 'orange',
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      notifications.show({
        title: '删除成功',
        message: `已删除 ${selectedRows.size} 条记录`,
        color: 'green',
      });

      setSelectedRows(new Set());
      refetch();
    } catch (error) {
      notifications.show({
        title: '删除失败',
        message: error instanceof Error ? error.message : '未知错误',
        color: 'red',
      });
    }
  };

  const uniqueSources = useMemo(() => {
    const sources = new Set(records.map(r => r.source).filter(Boolean));
    return Array.from(sources).map(s => ({ value: s, label: s }));
  }, [records]);

  const uniqueDeviceTypes = useMemo(() => {
    const types = new Set(records.map(r => r.device_type).filter(Boolean));
    return Array.from(types).map(t => ({ value: t!, label: t! }));
  }, [records]);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    records.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      if (r.source) {
        bySource[r.source] = (bySource[r.source] || 0) + 1;
      }
    });

    return {
      total: pagination?.total || 0,
      byStatus,
      bySource,
    };
  }, [records, pagination]);

  return (
    <Container fluid py="md">
      <Stack gap="md">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconDatabase size={28} />
                原始数据管理
              </Group>
            </Title>
            <Text size="sm" color="dimmed" mt={4}>
              查看和管理设备上报的原始数据
            </Text>
          </div>
          <Group>
            <Tooltip label="刷新数据">
              <ActionIcon 
                variant="light" 
                onClick={() => refetch()}
                loading={isFetching}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="light"
              onClick={() => setExportModalOpen(true)}
            >
              导出数据
            </Button>
          </Group>
        </Group>

        {/* 筛选器 */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>筛选条件</Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => {
                  setFilterSource(null);
                  setFilterStatus(null);
                  setFilterSerialNumber('');
                  setFilterDeviceType(null);
                  setFilterStartTime(null);
                  setFilterEndTime(null);
                }}
              >
                重置
              </Button>
            </Group>
            <Group>
              <TextInput
                placeholder="序列号"
                value={filterSerialNumber}
                onChange={(e) => setFilterSerialNumber(e.currentTarget.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="来源"
                data={uniqueSources}
                value={filterSource}
                onChange={setFilterSource}
                clearable
                style={{ width: 150 }}
              />
              <Select
                placeholder="设备类型"
                data={uniqueDeviceTypes}
                value={filterDeviceType}
                onChange={setFilterDeviceType}
                clearable
                style={{ width: 150 }}
              />
              <Select
                placeholder="状态"
                data={Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label,
                }))}
                value={filterStatus}
                onChange={setFilterStatus}
                clearable
                style={{ width: 150 }}
              />
              <DateInput
                placeholder="开始时间"
                value={filterStartTime}
                onChange={setFilterStartTime}
                clearable
                style={{ width: 180 }}
                valueFormat="YYYY-MM-DD"
              />
              <DateInput
                placeholder="结束时间"
                value={filterEndTime}
                onChange={setFilterEndTime}
                clearable
                style={{ width: 180 }}
                valueFormat="YYYY-MM-DD"
              />
            </Group>
          </Stack>
        </Paper>

        {/* 批量操作栏 */}
        {selectedRows.size > 0 && (
          <Alert color="blue" variant="light">
            <Group justify="space-between">
              <Text>已选择 {selectedRows.size} 条记录</Text>
              <Group>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => setSelectedRows(new Set())}
                >
                  取消选择
                </Button>
                <Button
                  size="xs"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleExport('json')}
                >
                  导出选中
                </Button>
                <Button
                  size="xs"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={handleBatchDelete}
                >
                  批量删除
                </Button>
              </Group>
            </Group>
          </Alert>
        )}

        {/* 数据列表 */}
        <Paper withBorder style={{ flex: 1 }}>
          {isLoading ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text color="dimmed">加载数据中...</Text>
              </Stack>
            </Center>
          ) : records.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconDatabase size={48} opacity={0.3} />
                <Text color="dimmed">暂无数据</Text>
              </Stack>
            </Center>
          ) : (
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 40 }}>
                      <Checkbox
                        checked={selectedRows.size === records.length}
                        indeterminate={selectedRows.size > 0 && selectedRows.size < records.length}
                        onChange={handleSelectAll}
                      />
                    </Table.Th>
                    <Table.Th>来源</Table.Th>
                    <Table.Th>序列号</Table.Th>
                    <Table.Th>设备类型</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th>载荷大小</Table.Th>
                    <Table.Th>接收时间</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Checkbox
                          checked={selectedRows.has(record.id)}
                          onChange={() => handleSelectRow(record.id)}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">{record.source}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.serial_number || '-'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.device_type || '-'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={STATUS_CONFIG[record.status]?.color || 'gray'}
                        >
                          {STATUS_CONFIG[record.status]?.label || record.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {record.payload_size ? `${record.payload_size} B` : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {new Date(record.received_at).toLocaleString('zh-CN')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <Tooltip label="查看详情">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewDetail(record)}
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
            </ScrollArea>
          )}
        </Paper>

        {/* 分页 */}
        {pagination && pagination.total_pages > 1 && (
          <Group justify="space-between">
            <Text size="sm" color="dimmed">
              共 {pagination.total} 条记录
            </Text>
            <Pagination
              value={page}
              onChange={setPage}
              total={pagination.total_pages}
            />
          </Group>
        )}
      </Stack>

      {/* 详情抽屉 */}
      <Drawer
        opened={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedRecord(null);
        }}
        title="数据详情"
        position="right"
        size="lg"
      >
        {selectedRecord && (
          <Stack gap="md">
            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Group>
                  <Text fw={500} style={{ width: 100 }}>ID:</Text>
                  <Text size="sm" color="dimmed">{selectedRecord.id}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>来源:</Text>
                  <Badge variant="light">{selectedRecord.source}</Badge>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>序列号:</Text>
                  <Text size="sm">{selectedRecord.serial_number || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>设备类型:</Text>
                  <Text size="sm">{selectedRecord.device_type || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>状态:</Text>
                  <Badge
                    variant="light"
                    color={STATUS_CONFIG[selectedRecord.status]?.color || 'gray'}
                  >
                    {STATUS_CONFIG[selectedRecord.status]?.label || selectedRecord.status}
                  </Badge>
                </Group>
                {selectedRecord.status_message && (
                  <Group>
                    <Text fw={500} style={{ width: 100 }}>状态说明:</Text>
                    <Text size="sm" color="dimmed">{selectedRecord.status_message}</Text>
                  </Group>
                )}
                <Group>
                  <Text fw={500} style={{ width: 100 }}>载荷大小:</Text>
                  <Text size="sm">{selectedRecord.payload_size || 0} 字节</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>接收时间:</Text>
                  <Text size="sm">
                    {new Date(selectedRecord.received_at).toLocaleString('zh-CN')}
                  </Text>
                </Group>
                {selectedRecord.processed_at && (
                  <Group>
                    <Text fw={500} style={{ width: 100 }}>处理时间:</Text>
                    <Text size="sm">
                      {new Date(selectedRecord.processed_at).toLocaleString('zh-CN')}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            <Divider />

            <JsonViewer
              data={selectedRecord.raw_payload_preview || {}}
              title="载荷预览"
              maxHeight={500}
            />
          </Stack>
        )}
      </Drawer>

      {/* 导出模态框 */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="导出数据"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" color="dimmed">
            选择导出格式和数据范围
          </Text>
          
          <Group>
            <Button
              fullWidth
              variant="light"
              leftSection={<IconFileText size={16} />}
              onClick={() => handleExport('json')}
            >
              导出为 JSON
            </Button>
            <Button
              fullWidth
              variant="light"
              leftSection={<IconFileText size={16} />}
              onClick={() => handleExport('csv')}
            >
              导出为 CSV
            </Button>
          </Group>

          <Alert color="blue" variant="light">
            {selectedRows.size > 0 ? (
              <Text size="sm">将导出选中的 {selectedRows.size} 条记录</Text>
            ) : (
              <Text size="sm">将导出当前筛选条件下的所有记录（{pagination?.total || 0} 条）</Text>
            )}
          </Alert>
        </Stack>
      </Modal>
    </Container>
  );
};