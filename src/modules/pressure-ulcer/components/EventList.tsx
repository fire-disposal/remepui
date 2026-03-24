/**
 * 事件列表组件
 * 以表格形式展示仿真事件
 */

import { useState, useMemo } from 'react';
import {
  Paper, Text, Group, Badge, Stack, Box, ThemeIcon, ScrollArea,
  Table, ActionIcon, Tooltip, TextInput, Select
} from '@mantine/core';
import {
  IconAlertTriangle, IconAlertOctagon, IconRotateClockwise,
  IconSettings, IconList, IconSearch, IconFilter
} from '@tabler/icons-react';
import type { PressureUlcerEvent } from '../types';

interface EventListProps {
  events: PressureUlcerEvent[];
  formatTime: (seconds: number) => string;
}

/**
 * 获取事件类型配置
 */
const getEventConfig = (type: PressureUlcerEvent['type']) => {
  switch (type) {
    case 'warning':
      return {
        icon: IconAlertTriangle,
        color: 'orange',
        label: '警告'
      };
    case 'danger':
      return {
        icon: IconAlertOctagon,
        color: 'red',
        label: '危险'
      };
    case 'reposition':
      return {
        icon: IconRotateClockwise,
        color: 'blue',
        label: '翻身'
      };
    case 'param_change':
      return {
        icon: IconSettings,
        color: 'violet',
        label: '参数调整'
      };
    default:
      return {
        icon: IconList,
        color: 'gray',
        label: '其他'
      };
  }
};

export const EventList: React.FC<EventListProps> = ({
  events,
  formatTime
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  // 过滤后的事件
  const filteredEvents = useMemo(() => {
    let result = [...events].sort((a, b) => b.simulationTime - a.simulationTime);

    if (filterType && filterType !== 'all') {
      result = result.filter(e => e.type === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.message.toLowerCase().includes(term) ||
        e.id.toLowerCase().includes(term)
      );
    }

    return result;
  }, [events, filterType, searchTerm]);

  if (events.length === 0) {
    return (
      <Box ta="center" py="xl">
        <ThemeIcon color="gray" variant="light" size="lg" radius="xl" mb="sm">
          <IconList size={20} />
        </ThemeIcon>
        <Text size="sm" c="dimmed">暂无事件记录</Text>
        <Text size="xs" c="dimmed">开始仿真后，事件将在此显示</Text>
      </Box>
    );
  }

  return (
    <Stack gap="md">
      {/* 工具栏 */}
      <Group gap="md">
        <TextInput
          placeholder="搜索事件..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<IconSearch size={14} />}
          size="xs"
          flex={1}
        />
        <Select
          placeholder="筛选类型"
          value={filterType}
          onChange={setFilterType}
          data={[
            { value: 'all', label: '全部类型' },
            { value: 'warning', label: '警告' },
            { value: 'danger', label: '危险' },
            { value: 'reposition', label: '翻身' },
            { value: 'param_change', label: '参数调整' }
          ]}
          size="xs"
          w={120}
          clearable
        />
        <Badge variant="light" color="blue" size="sm">
          {filteredEvents.length} / {events.length}
        </Badge>
      </Group>

      {/* 事件表格 */}
      <ScrollArea h={350}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={80}>时间</Table.Th>
              <Table.Th w={80}>类型</Table.Th>
              <Table.Th>描述</Table.Th>
              <Table.Th w={70}>伤害值</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredEvents.map((event) => {
              const config = getEventConfig(event.type);
              const IconComponent = config.icon;

              return (
                <Table.Tr key={event.id}>
                  <Table.Td>
                    <Text ff="monospace" size="xs">
                      {formatTime(event.simulationTime)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={config.color}
                      variant="light"
                      size="xs"
                      leftSection={<IconComponent size={10} />}
                    >
                      {config.label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={event.message} position="top" withinPortal>
                      <Text size="xs" lineClamp={1}>
                        {event.message}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    {event.damagePercent !== undefined ? (
                      <Badge
                        color={
                          event.damagePercent >= 70 ? 'red' :
                          event.damagePercent >= 30 ? 'orange' : 'green'
                        }
                        variant="light"
                        size="xs"
                      >
                        {event.damagePercent.toFixed(1)}%
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">-</Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* 汇总信息 */}
      <Group justify="space-between" p="xs" bg="gray.0">
        <Group gap="md">
          <Group gap={4}>
            <IconAlertTriangle size={12} color="var(--mantine-color-orange-6)" />
            <Text size="xs" c="dimmed">
              警告: {events.filter(e => e.type === 'warning').length}
            </Text>
          </Group>
          <Group gap={4}>
            <IconAlertOctagon size={12} color="var(--mantine-color-red-6)" />
            <Text size="xs" c="dimmed">
              危险: {events.filter(e => e.type === 'danger').length}
            </Text>
          </Group>
          <Group gap={4}>
            <IconRotateClockwise size={12} color="var(--mantine-color-blue-6)" />
            <Text size="xs" c="dimmed">
              翻身: {events.filter(e => e.type === 'reposition').length}
            </Text>
          </Group>
        </Group>
        <Text size="xs" c="dimmed">
          共 {events.length} 个事件
        </Text>
      </Group>
    </Stack>
  );
};