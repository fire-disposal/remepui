/**
 * 事件时间轴组件
 * 可视化展示仿真过程中的事件序列
 */

import { useMemo } from 'react';
import {
  Paper, Text, Group, Badge, Stack, Box, ThemeIcon, ScrollArea, Timeline
} from '@mantine/core';
import {
  IconAlertTriangle, IconAlertOctagon, IconRotateClockwise,
  IconSettings, IconClock, IconTimeline
} from '@tabler/icons-react';
import type { PressureUlcerEvent } from '../types';

interface EventTimelineProps {
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
        label: '警告',
        description: '伤害累积达到警告阈值'
      };
    case 'danger':
      return {
        icon: IconAlertOctagon,
        color: 'red',
        label: '危险',
        description: '压疮已形成，需立即干预'
      };
    case 'reposition':
      return {
        icon: IconRotateClockwise,
        color: 'blue',
        label: '翻身',
        description: '实施翻身操作'
      };
    case 'param_change':
      return {
        icon: IconSettings,
        color: 'violet',
        label: '参数调整',
        description: '仿真参数已变更'
      };
    default:
      return {
        icon: IconClock,
        color: 'gray',
        label: '事件',
        description: ''
      };
  }
};

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  formatTime
}) => {
  // 按时间排序的事件
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.simulationTime - b.simulationTime);
  }, [events]);

  if (events.length === 0) {
    return (
      <Box ta="center" py="xl">
        <ThemeIcon color="gray" variant="light" size="lg" radius="xl" mb="sm">
          <IconTimeline size={20} />
        </ThemeIcon>
        <Text size="sm" c="dimmed">暂无事件记录</Text>
        <Text size="xs" c="dimmed">开始仿真后，事件将在此显示</Text>
      </Box>
    );
  }

  return (
    <Stack gap="md">
      {/* 统计信息 */}
      <Group gap="md">
        <Paper p="xs" radius="sm" bg="orange.0" flex={1}>
          <Group gap="xs">
            <IconAlertTriangle size={14} color="var(--mantine-color-orange-6)" />
            <Box>
              <Text size="xs" c="dimmed">警告</Text>
              <Text size="sm" fw={600} c="orange.7">
                {events.filter(e => e.type === 'warning').length}
              </Text>
            </Box>
          </Group>
        </Paper>
        <Paper p="xs" radius="sm" bg="red.0" flex={1}>
          <Group gap="xs">
            <IconAlertOctagon size={14} color="var(--mantine-color-red-6)" />
            <Box>
              <Text size="xs" c="dimmed">危险</Text>
              <Text size="sm" fw={600} c="red.7">
                {events.filter(e => e.type === 'danger').length}
              </Text>
            </Box>
          </Group>
        </Paper>
        <Paper p="xs" radius="sm" bg="blue.0" flex={1}>
          <Group gap="xs">
            <IconRotateClockwise size={14} color="var(--mantine-color-blue-6)" />
            <Box>
              <Text size="xs" c="dimmed">翻身</Text>
              <Text size="sm" fw={600} c="blue.7">
                {events.filter(e => e.type === 'reposition').length}
              </Text>
            </Box>
          </Group>
        </Paper>
        <Paper p="xs" radius="sm" bg="violet.0" flex={1}>
          <Group gap="xs">
            <IconSettings size={14} color="var(--mantine-color-violet-6)" />
            <Box>
              <Text size="xs" c="dimmed">参数</Text>
              <Text size="sm" fw={600} c="violet.7">
                {events.filter(e => e.type === 'param_change').length}
              </Text>
            </Box>
          </Group>
        </Paper>
      </Group>

      {/* 时间轴 */}
      <ScrollArea h={350}>
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {sortedEvents.map((event) => {
            const config = getEventConfig(event.type);
            const IconComponent = config.icon;

            return (
              <Timeline.Item
                key={event.id}
                bullet={
                  <ThemeIcon color={config.color} variant="light" size={22} radius="xl">
                    <IconComponent size={12} />
                  </ThemeIcon>
                }
                title={
                  <Group gap="xs">
                    <Text size="sm" fw={600}>{config.label}</Text>
                    <Badge color={config.color} variant="light" size="xs">
                      {formatTime(event.simulationTime)}
                    </Badge>
                  </Group>
                }
              >
                <Text size="xs" c="dimmed" mb={4}>
                  {event.message}
                </Text>
                {event.damagePercent !== undefined && (
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">伤害值:</Text>
                    <Badge 
                      color={event.damagePercent >= 70 ? 'red' : event.damagePercent >= 30 ? 'orange' : 'green'} 
                      variant="light" 
                      size="xs"
                    >
                      {event.damagePercent.toFixed(1)}%
                    </Badge>
                  </Group>
                )}
                {event.paramChanges && (
                  <Group gap={4} mt={4}>
                    {Object.entries(event.paramChanges).map(([key, value]) => (
                      <Badge key={key} variant="outline" size="xs">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Timeline.Item>
            );
          })}
        </Timeline>
      </ScrollArea>
    </Stack>
  );
};