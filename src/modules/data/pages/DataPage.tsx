import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Pagination,
  Flex,
  JsonInput,
  Accordion,
  TextInput,
} from "@mantine/core";
import {
  IconChartLine,
  IconRefresh,
  IconCalendar,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { useData } from "../../../shared/api";

const DATA_TYPE_OPTIONS = [
  { value: "heart_rate", label: "心率数据" },
  { value: "spo2", label: "血氧数据" },
  { value: "fall_event", label: "跌倒事件" },
  { value: "mattress", label: "床垫数据" },
];

const DATA_TYPE_COLORS: Record<string, string> = {
  heart_rate: "red",
  spo2: "blue",
  fall_event: "orange",
  mattress: "teal",
};

/**
 * 数据查询页面
 */
export const DataPage = () => {
  const [page, setPage] = useState(1);
  const [dataType, setDataType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 查询数据
  const { data, isLoading, refetch } = useData({
    data_type: dataType || undefined,
    start_time: startDate ? new Date(startDate).toISOString() : undefined,
    end_time: endDate ? new Date(endDate + "T23:59:59").toISOString() : undefined,
    page,
    page_size: 20,
  });

  const records = data?.data || [];
  const pagination = data?.pagination;

  const formatPayload = (payload: Record<string, unknown>) => {
    return JSON.stringify(payload, null, 2);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconChartLine size={28} />
                数据查询
              </Group>
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              查看设备上报的健康数据
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

        {/* 筛选栏 */}
        <Paper p="md" radius="md" withBorder>
          <Group>
            <Select
              placeholder="数据类型"
              data={DATA_TYPE_OPTIONS}
              value={dataType}
              onChange={setDataType}
              clearable
              style={{ width: 180 }}
            />
            <TextInput
              placeholder="开始日期 (YYYY-MM-DD)"
              leftSection={<IconCalendar size={16} />}
              value={startDate}
              onChange={(e) => setStartDate(e.currentTarget.value)}
              style={{ width: 200 }}
            />
            <TextInput
              placeholder="结束日期 (YYYY-MM-DD)"
              leftSection={<IconCalendar size={16} />}
              value={endDate}
              onChange={(e) => setEndDate(e.currentTarget.value)}
              style={{ width: 200 }}
            />
          </Group>
        </Paper>

        {/* 数据列表 */}
        <Paper radius="md" withBorder>
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : records.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="md">
                <IconChartLine size={48} opacity={0.3} />
                <Text c="dimmed">暂无数据记录</Text>
              </Stack>
            </Center>
          ) : (
            <>
              <Accordion variant="separated" radius={0}>
                {records.map((record, index) => (
                  <Accordion.Item key={`${record.time}-${index}`} value={`item-${index}`}>
                    <Accordion.Control>
                      <Group justify="space-between">
                        <Group>
                          <Badge
                            variant="light"
                            color={DATA_TYPE_COLORS[record.data_type] || "gray"}
                          >
                            {DATA_TYPE_OPTIONS.find(t => t.value === record.data_type)?.label || record.data_type}
                          </Badge>
                          <Text size="sm" style={{ fontFamily: "monospace" }}>
                            <IconDeviceDesktop size={14} style={{ marginRight: 4 }} />
                            {record.device_id.slice(0, 8)}...
                          </Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          {new Date(record.time).toLocaleString("zh-CN")}
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        <Group>
                          <Text size="sm" c="dimmed">来源:</Text>
                          <Badge size="sm" variant="outline">{record.source}</Badge>
                        </Group>
                        {record.subject_id && (
                          <Group>
                            <Text size="sm" c="dimmed">患者ID:</Text>
                            <Text size="sm" style={{ fontFamily: "monospace" }}>{record.subject_id}</Text>
                          </Group>
                        )}
                        <Text size="sm" c="dimmed" mt="xs">数据负载:</Text>
                        <JsonInput
                          value={formatPayload(record.payload)}
                          readOnly
                          autosize
                          minRows={3}
                          maxRows={10}
                          styles={{ input: { fontFamily: "monospace", fontSize: "12px" } }}
                        />
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>

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
    </Container>
  );
};