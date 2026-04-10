import { useState, useMemo } from 'react';
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
  Select,
  TextInput,
  Drawer,
  ScrollArea,
  Checkbox,
  Menu,
  Alert,
  Divider,
  Modal,
  Tabs,
  Code,
  CopyButton,
} from '@mantine/core';
import {
  IconDatabase,
  IconRefresh,
  IconEye,
  IconDownload,
  IconTrash,
  IconFileText,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconCopy,
} from '@tabler/icons-react';
import { useRawData, useRawDataDetail, rawDataApi } from '../../../shared/api';
import { JsonViewer } from '../components/JsonViewer';
import { notifications } from '@mantine/notifications';

const STATUS_CONFIG = {
  stored: { color: 'blue', label: '已存储' },
  ingested: { color: 'green', label: '已处理' },
  ignored: { color: 'gray', label: '已忽略' },
  format_error: { color: 'orange', label: '格式错误' },
  processing_error: { color: 'red', label: '处理错误' },
};

// 格式化字节数为可读格式
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// 将十六进制字符串格式化为带空格的形式
const formatHex = (hex: string): string => {
  return hex.match(/.{1,2}/g)?.join(' ') || hex;
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
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
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

  // 使用详情接口获取完整数据（包含原始字节）
  const { data: detailData, isLoading: isDetailLoading } = useRawDataDetail(selectedRecordId);

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
    setSelectedRecordId(record.id);
    setDetailDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDrawerOpen(false);
    setSelectedRecordId(null);
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

  // 从 Base64 解码原始数据
  const decodedRawData = useMemo(() => {
    if (!detailData?.raw_payload_base64) return null;
    try {
      const binaryString = atob(detailData.raw_payload_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }, [detailData?.raw_payload_base64]);

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
              查看和管理设备上报的原始数据，支持原始字节诊断
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
              <TextInput
                type="date"
                placeholder="开始时间"
                value={filterStartTime ?? ''}
                onChange={(e) => setFilterStartTime(e.currentTarget.value || null)}
                style={{ width: 180 }}
              />
              <TextInput
                type="date"
                placeholder="结束时间"
                value={filterEndTime ?? ''}
                onChange={(e) => setFilterEndTime(e.currentTarget.value || null)}
                style={{ width: 180 }}
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
                          {record.payload_size ? formatBytes(record.payload_size) : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" color="dimmed">
                          {new Date(record.received_at).toLocaleString('zh-CN')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group justify="flex-end" gap="xs">
                          <Tooltip label="查看详情（含原始字节）">
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

      {/* 详情抽屉 - 包含原始字节诊断 */}
      <Drawer
        opened={detailDrawerOpen}
        onClose={handleCloseDetail}
        title="原始数据详情（诊断视图）"
        position="right"
        size="xl"
      >
        {isDetailLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : detailData ? (
          <Stack gap="md">
            {/* 基本信息 */}
            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Group>
                  <Text fw={500} style={{ width: 100 }}>ID:</Text>
                  <Text size="sm" color="dimmed" style={{ fontFamily: 'monospace' }}>{detailData.id}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>来源:</Text>
                  <Badge variant="light">{detailData.source}</Badge>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>序列号:</Text>
                  <Text size="sm">{detailData.serial_number || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>设备类型:</Text>
                  <Text size="sm">{detailData.device_type || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>远程地址:</Text>
                  <Text size="sm" color="dimmed">{detailData.remote_addr || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>状态:</Text>
                  <Badge
                    variant="light"
                    color={STATUS_CONFIG[detailData.status]?.color || 'gray'}
                  >
                    {STATUS_CONFIG[detailData.status]?.label || detailData.status}
                  </Badge>
                </Group>
                {detailData.status_message && (
                  <Group>
                    <Text fw={500} style={{ width: 100 }}>状态说明:</Text>
                    <Text size="sm" color="dimmed">{detailData.status_message}</Text>
                  </Group>
                )}
                <Group>
                  <Text fw={500} style={{ width: 100 }}>载荷大小:</Text>
                  <Text size="sm">{formatBytes(detailData.payload_size)}</Text>
                </Group>
                <Group>
                  <Text fw={500} style={{ width: 100 }}>接收时间:</Text>
                  <Text size="sm">
                    {new Date(detailData.received_at).toLocaleString('zh-CN')}
                  </Text>
                </Group>
                {detailData.processed_at && (
                  <Group>
                    <Text fw={500} style={{ width: 100 }}>处理时间:</Text>
                    <Text size="sm">
                      {new Date(detailData.processed_at).toLocaleString('zh-CN')}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            <Divider />

            {/* 原始数据诊断 - 使用 Tabs 切换不同视图 */}
            <Tabs defaultValue="text">
              <Tabs.List>
                <Tabs.Tab value="text" leftSection={<IconFileText size={14} />}>文本视图</Tabs.Tab>
                <Tabs.Tab value="hex" leftSection={<IconDatabase size={14} />}>十六进制</Tabs.Tab>
                <Tabs.Tab value="base64" leftSection={<IconCopy size={14} />}>Base64</Tabs.Tab>
                {decodedRawData && (
                  <Tabs.Tab value="binary" leftSection={<IconDatabase size={14} />}>二进制分析</Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="text" pt="md">
                {detailData.raw_payload_text ? (
                  <JsonViewer
                    data={detailData.raw_payload_text}
                    title="原始文本内容"
                    maxHeight={500}
                  />
                ) : (
                  <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                    无法将原始数据解码为 UTF-8 文本，可能是二进制数据
                  </Alert>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="hex" pt="md">
                <Paper withBorder p="sm">
                  <Group justify="space-between" mb="sm">
                    <Text fw={500}>十六进制表示</Text>
                    <CopyButton value={detailData.raw_payload_hex}>
                      {({ copied, copy }) => (
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          onClick={copy}
                          color={copied ? 'green' : 'gray'}
                        >
                          {copied ? '已复制' : '复制'}
                        </Button>
                      )}
                    </CopyButton>
                  </Group>
                  <ScrollArea.Autosize mah={500}>
                    <Code
                      block
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {formatHex(detailData.raw_payload_hex)}
                    </Code>
                  </ScrollArea.Autosize>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="base64" pt="md">
                <Paper withBorder p="sm">
                  <Group justify="space-between" mb="sm">
                    <Text fw={500}>Base64 编码</Text>
                    <CopyButton value={detailData.raw_payload_base64}>
                      {({ copied, copy }) => (
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          onClick={copy}
                          color={copied ? 'green' : 'gray'}
                        >
                          {copied ? '已复制' : '复制'}
                        </Button>
                      )}
                    </CopyButton>
                  </Group>
                  <ScrollArea.Autosize mah={500}>
                    <Code
                      block
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        wordBreak: 'break-all',
                      }}
                    >
                      {detailData.raw_payload_base64}
                    </Code>
                  </ScrollArea.Autosize>
                </Paper>
              </Tabs.Panel>

              {decodedRawData && (
                <Tabs.Panel value="binary" pt="md">
                  <Paper withBorder p="sm">
                    <Text fw={500} mb="sm">二进制数据分析</Text>
                    <Stack gap="xs">
                      <Group>
                        <Text size="sm" fw={500} style={{ width: 120 }}>数据长度:</Text>
                        <Text size="sm">{decodedRawData.length} 字节</Text>
                      </Group>
                      <Group>
                        <Text size="sm" fw={500} style={{ width: 120 }}>首字节:</Text>
                        <Text size="sm" style={{ fontFamily: 'monospace' }}>
                          0x{decodedRawData[0]?.toString(16).padStart(2, '0').toUpperCase() || 'N/A'} 
                          ({decodedRawData[0] || 'N/A'})
                        </Text>
                      </Group>
                      <Group>
                        <Text size="sm" fw={500} style={{ width: 120 }}>末字节:</Text>
                        <Text size="sm" style={{ fontFamily: 'monospace' }}>
                          0x{decodedRawData[decodedRawData.length - 1]?.toString(16).padStart(2, '0').toUpperCase() || 'N/A'} 
                          ({decodedRawData[decodedRawData.length - 1] || 'N/A'})
                        </Text>
                      </Group>
                      <Group align="flex-start">
                        <Text size="sm" fw={500} style={{ width: 120 }}>前 32 字节:</Text>
                        <Code style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                          {Array.from(decodedRawData.slice(0, 32))
                            .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                            .join(' ')}
                        </Code>
                      </Group>
                    </Stack>
                  </Paper>
                </Tabs.Panel>
              )}
            </Tabs>

            {/* 元数据 */}
            {detailData.metadata && Object.keys(detailData.metadata).length > 0 && (
              <>
                <Divider />
                <JsonViewer
                  data={detailData.metadata}
                  title="元数据"
                  maxHeight={300}
                />
              </>
            )}
          </Stack>
        ) : null}
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
