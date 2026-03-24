/**
 * 伤害累积图表组件 - 优化版
 * 支持标记参数变化点
 */

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Paper, Text, Group, ThemeIcon, Box, Stack, Badge, Tooltip } from '@mantine/core';
import { IconTrendingUp, IconActivity, IconAlertTriangle, IconSettings } from '@tabler/icons-react';
import type { HistoryPoint } from '../types';

interface DamageChartProps {
  history: HistoryPoint[];
  isRunning: boolean;
  paramChangePoints?: Array<{ time: number; param: string; value: number }>;
}

export const DamageChart: React.FC<DamageChartProps> = ({
  history,
  isRunning,
  paramChangePoints = []
}) => {
  const option = useMemo(() => {
    if (history.length < 2) {
      return null;
    }

    const times = history.map(p => p.time);
    const damages = history.map(p => p.damagePercent);
    const riskScores = history.map(p => p.riskScore);

    // 构建 markLine 数据 - 包含参数变化点
    const markLines: Array<{
      xAxis: number;
      lineStyle?: { color: string; type: string };
      label?: { formatter: string; position: string; fontSize: number; color: string };
    }> = [];

    // 添加参数变化标记
    paramChangePoints.forEach(point => {
      // 找到最接近的时间点
      const closestTime = times.reduce((prev, curr) =>
        Math.abs(curr - point.time) < Math.abs(prev - point.time) ? curr : prev
      );

      markLines.push({
        xAxis: closestTime,
        lineStyle: { color: '#3b82f6', type: 'dashed' },
        label: {
          formatter: `${point.param}`,
          position: 'top',
          fontSize: 8,
          color: '#3b82f6',
        },
      });
    });

    return {
      grid: {
        top: 40,
        right: 15,
        bottom: 40,
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
              ...markLines,
            ],
          },
          markPoint: paramChangePoints.length > 0 ? {
            symbol: 'pin',
            symbolSize: 30,
            data: paramChangePoints.map(point => ({
              xAxis: point.time,
              yAxis: 'max',
              value: point.param,
              itemStyle: { color: '#3b82f6' },
            })),
            label: {
              show: true,
              fontSize: 8,
              formatter: '{b}',
            },
          } : undefined,
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

          const damagePoint = dataArray[0] as { name: number; value: number; dataIndex: number };
          const riskPoint = dataArray[1] as { name: number; value: number };

          if (!damagePoint) return '';

          const time = Math.floor(damagePoint.name / 60);
          const seconds = Math.floor(damagePoint.name % 60);
          const timeStr = time > 0 ? `${time}分${seconds}秒` : `${seconds}秒`;

          // 查找该时间点的参数变化
          const paramChange = paramChangePoints.find(p =>
            Math.abs(p.time - damagePoint.name) < 5
          );

          let html = `
            <div style="padding: 4px;">
              <div style="font-weight: 600; margin-bottom: 4px;">时间: ${timeStr}</div>
              <div style="color: #ef4444;">● 伤害: ${damagePoint.value.toFixed(1)}%</div>
              ${riskPoint ? `<div style="color: #3b82f6;">● 风险: ${riskPoint.value.toFixed(1)}</div>` : ''}
          `;

          if (paramChange) {
            html += `<div style="color: #3b82f6; margin-top: 4px; font-size: 10px;">⚙ ${paramChange.param}: ${paramChange.value}</div>`;
          }

          html += '</div>';
          return html;
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
  }, [history, paramChangePoints]);

  // 获取最新数据
  const latestDamage = history.length > 0 ? history[history.length - 1].damagePercent : 0;
  const latestRisk = history.length > 0 ? history[history.length - 1].riskScore : 0;

  return (
    <Box>
      <Group justify="space-between" mb="sm" px="md" pt="md">
        <Group gap="sm">
          <ThemeIcon color="blue" variant="light" size="md" radius="md">
            <IconTrendingUp size={18} />
          </ThemeIcon>
          <Text size="sm" fw={600}>伤害累积曲线</Text>
          {paramChangePoints.length > 0 && (
            <Tooltip label="图表中蓝色虚线标记了参数调整时刻">
              <Badge color="blue" variant="light" size="sm" leftSection={<IconSettings size={12} />}>
                {paramChangePoints.length} 次调整
              </Badge>
            </Tooltip>
          )}
        </Group>
        {isRunning && (
          <Group gap="sm">
            <Badge color="green" variant="light" size="sm">
              实时更新
            </Badge>
            <ThemeIcon color="green" variant="light" size="md" radius="md">
              <IconActivity size={18} style={{ animation: 'pulse 1.5s infinite' }} />
            </ThemeIcon>
          </Group>
        )}
      </Group>

      {history.length < 2 ? (
        <Box h={180} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack align="center" gap="sm">
            <ThemeIcon color="gray" variant="light" size="xl" radius="xl">
              <IconActivity size={28} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">开始仿真后显示数据</Text>
            <Text size="xs" c="dimmed">曲线将实时更新，参数调整会标记在图表上</Text>
          </Stack>
        </Box>
      ) : (
        <ReactECharts
          option={option!}
          style={{ height: 180 }}
          opts={{ renderer: 'svg' }}
        />
      )}

      {/* 图例和当前值 */}
      <Paper mx="md" mb="md" p="xs" radius="xs" bg="gray.0" withBorder>
        <Group justify="space-between" align="center">
          <Group gap="lg">
            <Group gap={6}>
              <div style={{ width: 20, height: 4, backgroundColor: '#22c55e', borderRadius: 2 }} />
              <Text size="xs" c="dimmed">安全</Text>
            </Group>
            <Group gap={6}>
              <div style={{ width: 20, height: 4, backgroundColor: '#f97316', borderRadius: 2 }} />
              <Text size="xs" c="dimmed">警告</Text>
            </Group>
            <Group gap={6}>
              <div style={{ width: 20, height: 4, backgroundColor: '#ef4444', borderRadius: 2 }} />
              <Text size="xs" c="dimmed">危险</Text>
            </Group>
            {paramChangePoints.length > 0 && (
              <Group gap={6}>
                <div style={{ width: 20, height: 4, background: 'repeating-linear-gradient(90deg, #3b82f6, #3b82f6 3px, transparent 3px, transparent 6px)' }} />
                <Text size="xs" c="dimmed">参数调整</Text>
              </Group>
            )}
          </Group>

          {history.length > 0 && (
            <Group gap="sm">
              <Text size="xs" c="dimmed">当前伤害:</Text>
              <Badge
                size="sm"
                color={latestDamage >= 70 ? 'red' : latestDamage >= 30 ? 'orange' : 'green'}
                variant="light"
              >
                {latestDamage.toFixed(1)}%
              </Badge>
            </Group>
          )}
        </Group>
      </Paper>
    </Box>
  );
};
