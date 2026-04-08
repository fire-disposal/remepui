import { Paper, Text, Badge, Stack, Group } from '@mantine/core';
import { IconDatabase, IconAlertCircle, IconCheck, IconClock } from '@tabler/icons-react';

interface RawDataStatsProps {
  data: {
    total: number;
    byStatus?: Record<string, number>;
    bySource?: Record<string, number>;
  };
}

export const RawDataStats = ({ data }: RawDataStatsProps) => {
  const statusColors: Record<string, string> = {
    stored: 'blue',
    ingested: 'green',
    ignored: 'gray',
    format_error: 'orange',
    processing_error: 'red',
  };

  const statusLabels: Record<string, string> = {
    stored: '已存储',
    ingested: '已处理',
    ignored: '已忽略',
    format_error: '格式错误',
    processing_error: '处理错误',
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconDatabase size={20} />
            <Text fw={500}>数据统计</Text>
          </Group>
          <Badge size="lg" color="blue">
            总计: {data.total}
          </Badge>
        </Group>

        {data.byStatus && Object.keys(data.byStatus).length > 0 && (
          <Stack gap="xs">
            <Text size="sm" color="dimmed">按状态</Text>
            <Group gap="xs">
              {Object.entries(data.byStatus).map(([status, count]) => (
                <Badge
                  key={status}
                  variant="light"
                  color={statusColors[status] || 'gray'}
                  leftSection={
                    status === 'ingested' ? <IconCheck size={12} /> :
                    status.includes('error') ? <IconAlertCircle size={12} /> :
                    <IconClock size={12} />
                  }
                >
                  {statusLabels[status] || status}: {count}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}

        {data.bySource && Object.keys(data.bySource).length > 0 && (
          <Stack gap="xs">
            <Text size="sm" color="dimmed">按来源</Text>
            <Group gap="xs">
              {Object.entries(data.bySource).map(([source, count]) => (
                <Badge key={source} variant="outline">
                  {source}: {count}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};