/**
 * 仿真记录组件 - 优化版
 * 更清晰的可视化展示，支持筛选排序
 */

import { useState, useMemo } from 'react';
import {
  Paper, Text, Group, Badge, Button, TextInput, Stack, Box,
  Modal, ActionIcon, ScrollArea, Menu, Divider, Grid,
  Timeline, ThemeIcon, Progress, Tooltip, Accordion,
  Select, SegmentedControl
} from '@mantine/core';
import {
  IconHistory, IconTrash, IconSearch, IconCalendar, IconClock,
  IconAlertTriangle, IconTrendingUp, IconChevronDown, IconChevronUp,
  IconFilter, IconSortAscending, IconSortDescending, IconPlayerPlay,
  IconWeight, IconRuler, IconThermometer, IconDroplet, IconGauge,
  IconRotateClockwise, IconInfoCircle
} from '@tabler/icons-react';
import type { SimulationRecord, PressureUlcerEvent } from '../types';

type SortField = 'date' | 'damage' | 'risk' | 'duration';
type SortOrder = 'asc' | 'desc';

interface SimulationRecordsProps {
  records: SimulationRecord[];
  onDelete: (id: string) => void;
  formatTime: (seconds: number) => string;
}

export const SimulationRecords = ({ records, onDelete, formatTime }: SimulationRecordsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<SimulationRecord | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterDamage, setFilterDamage] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // 过滤和排序记录
  const processedRecords = useMemo(() => {
    let filtered = records.filter(record => {
      // 搜索过滤
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        record.id.toLowerCase().includes(searchLower) ||
        new Date(record.startTime).toLocaleString().includes(searchTerm);

      // 伤害程度过滤
      let matchesDamage = true;
      if (filterDamage === 'low') matchesDamage = record.finalDamage < 30;
      else if (filterDamage === 'medium') matchesDamage = record.finalDamage >= 30 && record.finalDamage < 70;
      else if (filterDamage === 'high') matchesDamage = record.finalDamage >= 70;

      return matchesSearch && matchesDamage;
    });

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          break;
        case 'damage':
          comparison = a.finalDamage - b.finalDamage;
          break;
        case 'risk':
          comparison = a.finalRiskScore - b.finalRiskScore;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [records, searchTerm, sortField, sortOrder, filterDamage]);

  const getDamageColor = (damage: number): string => {
    if (damage < 30) return 'green';
    if (damage < 70) return 'orange';
    return 'red';
  };

  const getDamageStage = (damage: number): string => {
    if (damage < 10) return '皮肤完整';
    if (damage < 30) return 'Ⅰ期红斑';
    if (damage < 50) return 'Ⅱ期部分损伤';
    if (damage < 70) return 'Ⅲ期全层损伤';
    return 'Ⅳ期全层组织损伤';
  };

  const getEventTypeLabel = (type: PressureUlcerEvent['type']) => {
    switch (type) {
      case 'warning': return { text: '警告', color: 'orange', icon: IconAlertTriangle };
      case 'danger': return { text: '危险', color: 'red', icon: IconAlertTriangle };
      case 'reposition': return { text: '翻身', color: 'blue', icon: IconRotateClockwise };
      case 'param_change': return { text: '参数', color: 'violet', icon: IconGauge };
      default: return { text: '其他', color: 'gray', icon: IconInfoCircle };
    }
  };

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score <= 2) return { label: '低风险', color: 'green' };
    if (score <= 4) return { label: '较低风险', color: 'lime' };
    if (score <= 6) return { label: '中等风险', color: 'yellow' };
    if (score <= 8) return { label: '高风险', color: 'orange' };
    return { label: '极高风险', color: 'red' };
  };

  return (
    <Stack gap="md">
      {/* 头部统计 */}
      <Paper p="sm" radius="sm" bg="gray.0" withBorder>
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="sm">
              <IconHistory size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">仿真记录</Text>
            <Badge variant="light" color="blue" size="sm">{records.length} 条</Badge>
          </Group>
          <Group gap="xs">
            <Badge color="green" variant="light" size="sm">
              安全: {records.filter(r => r.finalDamage < 30).length}
            </Badge>
            <Badge color="orange" variant="light" size="sm">
              警告: {records.filter(r => r.finalDamage >= 30 && r.finalDamage < 70).length}
            </Badge>
            <Badge color="red" variant="light" size="sm">
              危险: {records.filter(r => r.finalDamage >= 70).length}
            </Badge>
          </Group>
        </Group>
      </Paper>

      {/* 筛选和搜索 */}
      <Group grow align="flex-start" gap="sm">
        <TextInput
          placeholder="搜索记录..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<IconSearch size={14} />}
          size="xs"
          style={{ flex: 2 }}
        />
        <Select
          placeholder="伤害筛选"
          value={filterDamage}
          onChange={(v) => setFilterDamage(v as typeof filterDamage)}
          data={[
            { value: 'all', label: '全部' },
            { value: 'low', label: '安全 (<30%)' },
            { value: 'medium', label: '警告 (30-70%)' },
            { value: 'high', label: '危险 (>70%)' },
          ]}
          size="xs"
          style={{ flex: 1 }}
          clearable
        />
        <Menu position="bottom-end">
          <Menu.Target>
            <Button variant="light" size="xs" leftSection={<IconSortAscending size={14} />}>
              排序
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>排序字段</Menu.Label>
            <Menu.Item onClick={() => setSortField('date')} leftSection={<IconCalendar size={14} />}>
              日期 {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Menu.Item>
            <Menu.Item onClick={() => setSortField('damage')} leftSection={<IconAlertTriangle size={14} />}>
              伤害程度 {sortField === 'damage' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Menu.Item>
            <Menu.Item onClick={() => setSortField('risk')} leftSection={<IconTrendingUp size={14} />}>
              风险系数 {sortField === 'risk' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Menu.Item>
            <Menu.Item onClick={() => setSortField('duration')} leftSection={<IconClock size={14} />}>
              仿真时长 {sortField === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? '降序排列' : '升序排列'}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* 记录列表 */}
      <ScrollArea h={380}>
        <Stack gap="sm">
          {processedRecords.length === 0 ? (
            <Box ta="center" py="xl">
              <ThemeIcon color="gray" variant="light" size="xl" radius="xl">
                <IconHistory size={24} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" mt="sm">
                {records.length === 0 ? '暂无仿真记录' : '没有匹配的记录'}
              </Text>
            </Box>
          ) : (
            processedRecords.map((record) => {
              const riskLevel = getRiskLevel(record.finalRiskScore);
              const damageStage = getDamageStage(record.finalDamage);

              return (
                <Paper
                  key={record.id}
                  p="sm"
                  radius="sm"
                  withBorder
                  style={{
                    borderLeft: `4px solid var(--mantine-color-${getDamageColor(record.finalDamage)}-6)`,
                  }}
                >
                  {/* 记录头部 */}
                  <Group justify="space-between" align="start" mb="xs">
                    <Box>
                      <Group gap="xs" mb={4}>
                        <Text size="sm" fw={600}>记录 #{record.id.slice(-6).toUpperCase()}</Text>
                        <Badge color={getDamageColor(record.finalDamage)} variant="light" size="xs">
                          {damageStage}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {new Date(record.startTime).toLocaleString()}
                      </Text>
                    </Box>
                    <Group gap="xs">
                      <Button
                        variant="light"
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

                  {/* 关键指标 */}
                  <Grid gutter="xs" mb="xs">
                    <Grid.Col span={4}>
                      <Box ta="center" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
                        <Text size="10px" c="dimmed" mb={2}>最终伤害</Text>
                        <Text size="lg" fw={700} c={getDamageColor(record.finalDamage)}>
                          {record.finalDamage.toFixed(1)}%
                        </Text>
                        <Progress
                          value={record.finalDamage}
                          size="xs"
                          color={getDamageColor(record.finalDamage)}
                          mt={4}
                        />
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Box ta="center" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
                        <Text size="10px" c="dimmed" mb={2}>风险系数</Text>
                        <Text size="lg" fw={700} c={riskLevel.color}>
                          {record.finalRiskScore.toFixed(1)}
                        </Text>
                        <Badge color={riskLevel.color} variant="light" size="xs" mt={4}>
                          {riskLevel.label}
                        </Badge>
                      </Box>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Box ta="center" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
                        <Text size="10px" c="dimmed" mb={2}>仿真时长</Text>
                        <Text size="lg" fw={700}>
                          {formatTime(record.duration)}
                        </Text>
                        <Text size="10px" c="dimmed" mt={4}>
                          {record.events.length} 个事件
                        </Text>
                      </Box>
                    </Grid.Col>
                  </Grid>

                  {/* 参数摘要 */}
                  <Group gap="md" wrap="wrap">
                    <Group gap={4}>
                      <IconRuler size={12} color="var(--mantine-color-gray-5)" />
                      <Text size="xs" c="dimmed">{record.params.height}cm</Text>
                    </Group>
                    <Group gap={4}>
                      <IconWeight size={12} color="var(--mantine-color-gray-5)" />
                      <Text size="xs" c="dimmed">{record.params.weight}kg</Text>
                    </Group>
                    <Group gap={4}>
                      <IconThermometer size={12} color="var(--mantine-color-gray-5)" />
                      <Text size="xs" c="dimmed">{record.params.temperature}°C</Text>
                    </Group>
                    <Group gap={4}>
                      <IconDroplet size={12} color="var(--mantine-color-gray-5)" />
                      <Text size="xs" c="dimmed">{record.params.humidity}%</Text>
                    </Group>
                    <Group gap={4}>
                      <IconGauge size={12} color="var(--mantine-color-gray-5)" />
                      <Text size="xs" c="dimmed">{record.params.pressure}mmHg</Text>
                    </Group>
                  </Group>
                </Paper>
              );
            })
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
            <Paper p="sm" radius="sm" bg="gray.0" withBorder>
              <Text size="sm" fw={600} mb="sm">基本信息</Text>
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">记录ID</Text>
                  <Text size="xs" ff="monospace">{selectedRecord.id}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">开始时间</Text>
                  <Text size="xs">{new Date(selectedRecord.startTime).toLocaleString()}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">仿真时长</Text>
                  <Text size="xs">{formatTime(selectedRecord.duration)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">翻身次数</Text>
                  <Text size="xs">{selectedRecord.events.filter(e => e.type === 'reposition').length} 次</Text>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* 仿真结果 */}
            <Paper p="sm" radius="sm" withBorder>
              <Text size="sm" fw={600} mb="sm">仿真结果</Text>
              <Grid gutter="md">
                <Grid.Col span={4}>
                  <Box ta="center" p="sm" bg="gray.0" style={{ borderRadius: 4 }}>
                    <Text size="xs" c="dimmed">最终伤害</Text>
                    <Text size="xl" fw={700} c={getDamageColor(selectedRecord.finalDamage)}>
                      {selectedRecord.finalDamage.toFixed(1)}%
                    </Text>
                    <Progress value={selectedRecord.finalDamage} size="sm" color={getDamageColor(selectedRecord.finalDamage)} mt="xs" />
                  </Box>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Box ta="center" p="sm" bg="gray.0" style={{ borderRadius: 4 }}>
                    <Text size="xs" c="dimmed">最大伤害</Text>
                    <Text size="xl" fw={700} c={getDamageColor(selectedRecord.maxDamage)}>
                      {selectedRecord.maxDamage.toFixed(1)}%
                    </Text>
                  </Box>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Box ta="center" p="sm" bg="gray.0" style={{ borderRadius: 4 }}>
                    <Text size="xs" c="dimmed">风险系数</Text>
                    <Text size="xl" fw={700} c="blue">
                      {selectedRecord.finalRiskScore.toFixed(1)}
                    </Text>
                  </Box>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* 仿真参数 */}
            <Paper p="sm" radius="sm" bg="gray.0" withBorder>
              <Text size="sm" fw={600} mb="sm">仿真参数</Text>
              <Grid gutter="xs">
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconRuler size={14} />
                    <Text size="xs">身高: {selectedRecord.params.height} cm</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconWeight size={14} />
                    <Text size="xs">体重: {selectedRecord.params.weight} kg</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconGauge size={14} />
                    <Text size="xs">BMI: {selectedRecord.params.bmi}</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconThermometer size={14} />
                    <Text size="xs">温度: {selectedRecord.params.temperature}°C</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconDroplet size={14} />
                    <Text size="xs">湿度: {selectedRecord.params.humidity}%</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconGauge size={14} />
                    <Text size="xs">压力: {selectedRecord.params.pressure} mmHg</Text>
                  </Group>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* 事件时间轴 */}
            {selectedRecord.events.length > 0 && (
              <Paper p="sm" radius="sm" withBorder>
                <Text size="sm" fw={600} mb="sm">事件记录 ({selectedRecord.events.length})</Text>
                <Timeline bulletSize={20} lineWidth={2}>
                  {selectedRecord.events.map((event) => {
                    const eventType = getEventTypeLabel(event.type);
                    return (
                      <Timeline.Item
                        key={event.id}
                        bullet={
                          <ThemeIcon color={eventType.color} variant="light" size="sm">
                            <eventType.icon size={12} />
                          </ThemeIcon>
                        }
                        title={
                          <Group gap="xs">
                            <Text size="xs" fw={500}>{eventType.text}</Text>
                            <Text size="xs" c="dimmed">{formatTime(event.simulationTime)}</Text>
                          </Group>
                        }
                      >
                        <Text size="xs" c="dimmed">{event.message}</Text>
                        {event.damagePercent > 0 && (
                          <Text size="xs" c={getDamageColor(event.damagePercent)}>
                            伤害: {event.damagePercent.toFixed(1)}%
                          </Text>
                        )}
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </Paper>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};
