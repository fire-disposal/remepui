/**
 * 伤害累积图表组件
 * 使用 ECharts
 */

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Paper, Text, Group, ThemeIcon, Box, Stack, Badge } from '@mantine/core';
import { IconTrendingUp, IconActivity, IconAlertTriangle } from '@tabler/icons-react';
import type { HistoryPoint } from '../types';

interface DamageChartProps {
  history: HistoryPoint[];
  isRunning: boolean;
}

export const DamageChart: React.FC<DamageChartProps> = ({ history, isRunning }) => {
  const option = useMemo(() => {
    if (history.length < 2) {
      return null;
    }

    const times = history.map(p => p.time);
    const damages = history.map(p => p.damagePercent);
    const riskScores = history.map(p => p.riskScore);

    return {
      grid: {
        top: 30,
        right: 15,
        bottom: 30,
        left: 45,
      },
      xAxis: {
        type: 'category' as const,
        data: times,
        axisLabel: {
          formatter: (value: number) => {
            const minutes = Math.floor(value / 60);
            const seconds = Math.floor(value % 60);
            return minutes > 0 ? `${minutes}m${seconds}s` : `${seconds}s`;
          },
          fontSize: 9,
          color: '#94a3b8',
          rotate: 0,
        },
        axisLine: {
          lineStyle: { color: '#e2e8f0' },
        },
        splitLine: {
          show: false,
        },
        name: '时间',
        nameLocation: 'middle' as const,
        nameGap: 25,
        nameTextStyle: {
          fontSize: 10,
          color: '#94a3b8',
        },
      },
      yAxis: [
        {
          type: 'value' as const,
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%',
            fontSize: 9,
            color: '#94a3b8',
          },
          axisLine: {
            show: false,
          },
          splitLine: {
            lineStyle: { color: '#f1f5f9', type: 'dashed' as const },
          },
          name: '伤害',
          nameLocation: 'middle' as const,
          nameGap: 35,
          nameTextStyle: {
            fontSize: 10,
            color: '#94a3b8',
          },
        },
        {
          type: 'value' as const,
          min: 0,
          max: 10,
          axisLabel: {
            formatter: '{value}',
            fontSize: 9,
            color: '#94a3b8',
          },
          axisLine: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          name: '风险',
          nameLocation: 'middle' as const,
          nameGap: 30,
          nameTextStyle: {
            fontSize: 10,
            color: '#94a3b8',
          },
        },
      ],
      series: [
        {
          name: '伤害累积',
          type: 'line' as const,
          data: damages,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2.5,
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#22c55e' },
                { offset: 0.3, color: '#84cc16' },
                { offset: 0.5, color: '#eab308' },
                { offset: 0.7, color: '#f97316' },
                { offset: 1, color: '#ef4444' },
              ],
            },
          },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
                { offset: 0.3, color: 'rgba(249, 115, 22, 0.2)' },
                { offset: 0.5, color: 'rgba(234, 179, 8, 0.15)' },
                { offset: 0.7, color: 'rgba(132, 204, 22, 0.1)' },
                { offset: 1, color: 'rgba(34, 197, 94, 0.05)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed' as const,
              width: 1,
            },
            data: [
              {
                yAxis: 30,
                lineStyle: { color: '#f97316' },
                label: {
                  formatter: '警告线',
                  position: 'end' as const,
                  fontSize: 9,
                  color: '#f97316',
                },
              },
              {
                yAxis: 70,
                lineStyle: { color: '#ef4444' },
                label: {
                  formatter: '危险线',
                  position: 'end' as const,
                  fontSize: 9,
                  color: '#ef4444',
                },
              },
            ],
          },
        },
        {
          name: '风险系数',
          type: 'line' as const,
          yAxisIndex: 1,
          data: riskScores,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 1.5,
            color: '#3b82f6',
            type: 'dashed' as const,
          },
          opacity: 0.7,
        },
      ],
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155',
          fontSize: 11,
        },
        formatter: (params: unknown) => {
          const dataArray = params as unknown[];
          if (!dataArray || dataArray.length === 0) return '';
          
          const damagePoint = dataArray[0] as { name: number; value: number };
          const riskPoint = dataArray[1] as { name: number; value: number };
          
          if (!damagePoint) return '';
          
          const time = Math.floor(damagePoint.name / 60);
          const seconds = Math.floor(damagePoint.name % 60);
          const timeStr = time > 0 ? `${time}分${seconds}秒` : `${seconds}秒`;
          
          return `
            <div style="padding: 4px;">
              <div style="font-weight: 600; margin-bottom: 4px;">时间: ${timeStr}</div>
              <div style="color: #ef4444;">● 伤害: ${damagePoint.value.toFixed(1)}%</div>
              ${riskPoint ? `<div style="color: #3b82f6;">● 风险: ${riskPoint.value.toFixed(1)}</div>` : ''}
            </div>
          `;
        },
      },
      legend: {
        show: true,
        bottom: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: {
          fontSize: 9,
          color: '#94a3b8',
        },
        data: ['伤害累积', '风险系数'],
      },
    };
  }, [history]);

  // 获取最新数据
  const latestDamage = history.length > 0 ? history[history.length - 1].damagePercent : 0;
  const latestRisk = history.length > 0 ? history[history.length - 1].riskScore : 0;

  return (
    <Box>
      <Group justify="space-between" mb="xs" px="sm" pt="sm">
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="xs">
            <IconTrendingUp size={12} />
          </ThemeIcon>
          <Text size="xs" fw={600}>伤害累积曲线</Text>
        </Group>
        {isRunning && (
          <Group gap="xs">
            <Badge color="green" variant="light" size="xs">
              实时更新
            </Badge>
            <ThemeIcon color="green" variant="light" size="xs">
              <IconActivity size={12} style={{ animation: 'pulse 1s infinite' }} />
            </ThemeIcon>
          </Group>
        )}
      </Group>

      {history.length < 2 ? (
        <Box h={120} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack align="center" gap="xs">
            <ThemeIcon color="gray" variant="light" size="lg" radius="xl">
              <IconActivity size={18} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">开始仿真后显示数据</Text>
            <Text size="10px" c="dimmed">曲线将实时更新</Text>
          </Stack>
        </Box>
      ) : (
        <ReactECharts
          option={option!}
          style={{ height: 140 }}
          opts={{ renderer: 'svg' }}
        />
      )}

      {/* 图例和当前值 */}
      <Group justify="space-between" px="sm" pb="sm">
        <Group gap="md">
          <Group gap={4}>
            <div style={{ width: 16, height: 3, backgroundColor: '#22c55e', borderRadius: 2 }} />
            <Text size="9px" c="dimmed">安全</Text>
          </Group>
          <Group gap={4}>
            <div style={{ width: 16, height: 3, backgroundColor: '#f97316', borderRadius: 2 }} />
            <Text size="9px" c="dimmed">警告</Text>
          </Group>
          <Group gap={4}>
            <div style={{ width: 16, height: 3, backgroundColor: '#ef4444', borderRadius: 2 }} />
            <Text size="9px" c="dimmed">危险</Text>
          </Group>
        </Group>
        
        {history.length > 0 && (
          <Group gap="md">
            <Text size="9px" c="dimmed">
              当前: <Text span c={latestDamage >= 70 ? 'red' : latestDamage >= 30 ? 'orange' : 'green'} fw={600}>{latestDamage.toFixed(1)}%</Text>
            </Text>
          </Group>
        )}
      </Group>
    </Box>
  );
};