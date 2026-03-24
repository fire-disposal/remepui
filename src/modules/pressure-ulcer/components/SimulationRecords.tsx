/**
 * 仿真记录组件
 * 使用 Mantine UI
 */

import { useState } from 'react';
import {
  Paper, Text, Group, Badge, Button, TextInput, Stack, Box,
  Modal, ActionIcon, Accordion, ThemeIcon, ScrollArea
} from '@mantine/core';
import {
  IconHistory, IconTrash, IconSearch, IconCalendar, IconClock,
  IconAlertTriangle, IconTrendingUp, IconChevronDown, IconChevronUp
} from '@tabler/icons-react';
import type { SimulationRecord, PressureUlcerEvent } from '../types';

interface SimulationRecordsProps {
  records: SimulationRecord[];
  onDelete: (id: string) => void;
  formatTime: (seconds: number) => string;
}

export const SimulationRecords = ({ records, onDelete, formatTime }: SimulationRecordsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SimulationRecord | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.id.toLowerCase().includes(searchLower) ||
      new Date(record.startTime).toLocaleString().includes(searchTerm) ||
      record.finalRiskScore.toString().includes(searchTerm)
    );
  });

  const toggleEvents = (recordId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const getDamageColor = (damage: number): string => {
    if (damage < 30) return 'green';
    if (damage < 70) return 'orange';
    return 'red';
  };

  const getEventTypeLabel = (type: PressureUlcerEvent['type']) => {
    switch (type) {
      case 'warning': return { text: '警告', color: 'orange' };
      case 'danger': return { text: '危险', color: 'red' };
      case 'reposition': return { text: '翻身', color: 'blue' };
      case 'param_change': return { text: '参数调整', color: 'violet' };
      default: return { text: '其他', color: 'gray' };
    }
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="sm">
            <IconHistory size={14} />
          </ThemeIcon>
          <Text fw={600} size="sm">仿真记录查询</Text>
        </Group>
        <Badge variant="light" color="blue">{records.length} 条</Badge>
      </Group>

      {/* 搜索栏 */}
      <TextInput
        placeholder="搜索记录ID、日期或风险系数..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftSection={<IconSearch size={14} />}
        mb="md"
      />

      {/* 记录列表 */}
      <ScrollArea h={400}>
        <Stack gap="sm">
          {filteredRecords.length === 0 ? (
            <Box ta="center" py="xl">
              <IconHistory size={32} color="var(--mantine-color-gray-4)" />
              <Text size="sm" c="dimmed" mt="sm">暂无仿真记录</Text>
            </Box>
          ) : (
            filteredRecords.map((record) => (
              <Paper
                key={record.id}
                p="sm"
                radius="sm"
                bg="gray.0"
                withBorder
                className="hover:border-blue-300 transition-colors"
              >
                <Group justify="space-between" align="start">
                  <Box flex={1}>
                    <Group gap="xs" mb="xs">
                      <Text size="sm" fw={500}>记录 #{record.id.slice(0, 8)}</Text>
                      <Badge color={getDamageColor(record.finalDamage)} variant="light" size="xs">
                        伤害 {record.finalDamage.toFixed(1)}%
                      </Badge>
                    </Group>

                    <Group gap="md" mb="xs">
                      <Group gap={4}>
                        <IconCalendar size={12} color="var(--mantine-color-gray-5)" />
                        <Text size="xs" c="dimmed">
                          {new Date(record.startTime).toLocaleString()}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <IconClock size={12} color="var(--mantine-color-gray-5)" />
                        <Text size="xs" c="dimmed">{formatTime(record.duration)}</Text>
                      </Group>
                    </Group>

                    <Group gap="md">
                      <Group gap={4}>
                        <IconTrendingUp size={12} color="var(--mantine-color-gray-5)" />
                        <Text size="xs" c="dimmed">风险: {record.finalRiskScore.toFixed(1)}</Text>
                      </Group>
                      <Group gap={4}>
                        <IconAlertTriangle size={12} color="var(--mantine-color-gray-5)" />
                        <Text size="xs" c="dimmed">事件: {record.events.length}</Text>
                      </Group>
                    </Group>
                  </Box>

                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => toggleEvents(record.id)}
                    >
                      {expandedEvents.has(record.id) ? (
                        <IconChevronUp size={14} />
                      ) : (
                        <IconChevronDown size={14} />
                      )}
                    </ActionIcon>
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      onClick={() => setSelectedRecord(record)}
                    >
                      详情
                    </Button>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => onDelete(record.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>

                {/* 展开的事件列表 */}
                {expandedEvents.has(record.id) && (
                  <Box mt="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                    <Text size="xs" c="dimmed" mb="xs">事件记录</Text>
                    {record.events.length === 0 ? (
                      <Text size="xs" c="dimmed">无事件记录</Text>
                    ) : (
                      <Stack gap="xs">
                        {record.events.slice(0, 5).map((event) => (
                          <Group key={event.id} gap="xs">
                            <Badge
                              color={getEventTypeLabel(event.type).color}
                              variant="light"
                              size="xs"
                            >
                              {getEventTypeLabel(event.type).text}
                            </Badge>
                            <Text size="xs" flex={1}>{event.message}</Text>
                            <Text size="xs" c="dimmed">{formatTime(event.simulationTime)}</Text>
                          </Group>
                        ))}
                        {record.events.length > 5 && (
                          <Text size="xs" c="dimmed" ta="center">
                            还有 {record.events.length - 5} 个事件...
                          </Text>
                        )}
                      </Stack>
                    )}
                  </Box>
                )}
              </Paper>
            ))
          )}
        </Stack>
      </ScrollArea>

      {/* 详情模态框 */}
      <Modal
        opened={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={
          <Group gap="xs">
            <IconHistory size={18} />
            <Text fw={600}>仿真记录详情</Text>
          </Group>
        }
        size="lg"
      >
        {selectedRecord && (
          <Stack gap="md">
            {/* 基本信息 */}
            <Paper p="sm" radius="sm" bg="gray.0">
              <Text size="sm" fw={500} mb="xs">基本信息</Text>
              <Group grow>
                <Box>
                  <Text size="xs" c="dimmed">记录ID</Text>
                  <Text size="xs" ff="monospace">{selectedRecord.id}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">开始时间</Text>
                  <Text size="xs">{new Date(selectedRecord.startTime).toLocaleString()}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">仿真时长</Text>
                  <Text size="xs">{formatTime(selectedRecord.duration)}</Text>
                </Box>
              </Group>
            </Paper>

            {/* 仿真结果 */}
            <Paper p="sm" radius="sm" bg="gray.0">
              <Text size="sm" fw={500} mb="xs">仿真结果</Text>
              <Group grow>
                <Box ta="center">
                  <Text size="xs" c="dimmed">最终伤害</Text>
                  <Text size="lg" fw={700} c={getDamageColor(selectedRecord.finalDamage)}>
                    {selectedRecord.finalDamage.toFixed(1)}%
                  </Text>
                </Box>
                <Box ta="center">
                  <Text size="xs" c="dimmed">最大伤害</Text>
                  <Text size="lg" fw={700} c={getDamageColor(selectedRecord.maxDamage)}>
                    {selectedRecord.maxDamage.toFixed(1)}%
                  </Text>
                </Box>
                <Box ta="center">
                  <Text size="xs" c="dimmed">风险系数</Text>
                  <Text size="lg" fw={700} c="blue">
                    {selectedRecord.finalRiskScore.toFixed(1)}
                  </Text>
                </Box>
              </Group>
            </Paper>

            {/* 仿真参数 */}
            <Paper p="sm" radius="sm" bg="gray.0">
              <Text size="sm" fw={500} mb="xs">仿真参数</Text>
              <Group grow>
                <Text size="xs">身高: {selectedRecord.params.height} cm</Text>
                <Text size="xs">体重: {selectedRecord.params.weight} kg</Text>
                <Text size="xs">BMI: {selectedRecord.params.bmi}</Text>
                <Text size="xs">温度: {selectedRecord.params.temperature}°C</Text>
                <Text size="xs">湿度: {selectedRecord.params.humidity}%</Text>
                <Text size="xs">压力: {selectedRecord.params.pressure} mmHg</Text>
              </Group>
            </Paper>
          </Stack>
        )}
      </Modal>
    </Paper>
  );
};