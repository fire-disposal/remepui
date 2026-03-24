/**
 * 伤害预测曲线组件
 * 显示历史数据和未来预测
 */

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Paper, Text, Group, ThemeIcon, Box, Stack, Badge, Alert } from '@mantine/core';
import { IconTrendingUp, IconCrystalBall, IconClock, IconAlertCircle } from '@tabler/icons-react';
import type { HistoryPoint } from '../types';

interface PredictionChartProps {
  /** 历史数据 */
  history: HistoryPoint[];
  /** 预测数据 */
  prediction: Array<{ time: number; damage: number }>;
  /** 预计压疮形成时间（秒） */
  predictedUlcerTime: number | null;
  /** 建议翻身时间（秒） */
  recommendedRepositionTime: number;
  /** 是否运行中 */
  isRunning: boolean;
  /** 格式化时间函数 */
  formatTime: (seconds: number) => string;
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  history,
  prediction,
  predictedUlcerTime,
  recommendedRepositionTime,
  isRunning,
  formatTime,
}) => {
  const option = useMemo(() => {
    // 合并历史和预测数据
    const historyData = history.map(p => ({
      time: p.time,
      damage: p.damagePercent,
      type: 'history' as const,
    }));

    const predictionData = prediction.map(p => ({
      time: p.time + (history.length > 0 ? history[history.length - 1].time : 0),
      damage: p.damage,
      type: 'prediction' as const,
    }));

    const allData = [...historyData, ...predictionData];
    
    if (allData.length < 2) return null;

    const times = allData.map(p => p.time);
    const damages = allData.map(p => p.damage);

    // 标记点
    const markPoints = [];
    
    // 建议翻身时间标记
    if (recommendedRepositionTime > 0) {
      const currentTime = history.length > 0 ? history[history.length - 1].time : 0;
      const repositionTime = currentTime + recommendedRepositionTime;
      markPoints.push({
        name: '建议翻身',
        xAxis: repositionTime,
        yAxis: 30,
        symbol: 'pin',
        symbolSize: 40,
        itemStyle: { color: '#f97316' },
        label: {
          show: true,
          formatter: '建议翻身',
          position: 'top',
          fontSize: 10,
        },
      });
    }

    // 预计压疮形成时间标记
    if (predictedUlcerTime) {
      markPoints.push({
        name: '预计压疮',
        xAxis: predictedUlcerTime,
        yAxis: 70,
        symbol: 'pin',
        symbolSize: 50,
        itemStyle: { color: '#ef4444' },
        label: {
          show: true,
          formatter: '预计压疮',
          position: 'top',
          fontSize: 10,
          color: '#ef4444',
        },
      });
    }

    return {
      grid: {
        top: 40,
        right: 20,
        bottom: 40,
        left: 50,
      },
      xAxis: {
        type: 'category' as const,
        data: times,
        axisLabel: {
          formatter: (value: number) => formatTime(value),
          fontSize: 10,
          color: '#94a3b8',
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          fontSize: 10,
          color: '#94a3b8',
        },
        splitLine: {
          lineStyle: { color: '#f1f5f9', type: 'dashed' as const },
        },
      },
      series: [
        {
          name: '历史数据',
          type: 'line' as const,
          data: historyData.map(p => p.damage),
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: {
            width: 2,
            color: '#3b82f6',
          },
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ],
            },
          },
        },
        {
          name: '预测趋势',
          type: 'line' as const,
          data: predictionData.map(p => p.damage),
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            type: 'dashed' as const,
            color: '#8b5cf6',
          },
          itemStyle: { color: '#8b5cf6' },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139, 92, 246, 0.2)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.02)' },
              ],
            },
          },
        },
      ],
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { type: 'dashed' as const, width: 1 },
        data: [
          {
            yAxis: 30,
            lineStyle: { color: '#f97316' },
            label: { formatter: '警告线', position: 'end', fontSize: 9, color: '#f97316' },
          },
          {
            yAxis: 70,
            lineStyle: { color: '#ef4444' },
            label: { formatter: '危险线', position: 'end', fontSize: 9, color: '#ef4444' },
          },
        ],
      },
      markPoint: {
        data: markPoints,
        animation: true,
      },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#334155', fontSize: 11 },
        formatter: (params: unknown) => {
          const dataArray = params as unknown[];
          if (!dataArray || dataArray.length === 0) return '';
          
          const point = dataArray[0] as { name: number; value: number };
          const timeStr = formatTime(point.name);
          
          let html = `<div style="padding: 4px;"><div style="font-weight: 600; margin-bottom: 4px;">时间: ${timeStr}</div>`;
          
          dataArray.forEach((p: unknown) => {
            const item = p as { seriesName: string; value: number; color: string };
            html += `<div style="color: ${item.color};">● ${item.seriesName}: ${item.value.toFixed(1)}%</div>`;
          });
          
          html += '</div>';
          return html;
        },
      },
      legend: {
        show: true,
        bottom: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { fontSize: 10, color: '#94a3b8' },
        data: ['历史数据', '预测趋势'],
      },
    };
  }, [history, prediction, predictedUlcerTime, recommendedRepositionTime, formatTime]);

  return (
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon color="violet" variant="light" size="sm">
            <IconCrystalBall size={14} />
          </ThemeIcon>
          <Text size="sm" fw={600}>伤害趋势预测</Text>
        </Group>
        {isRunning && (
          <Badge color="green" variant="light" size="sm">
            实时更新
          </Badge>
        )}
      </Group>

      {history.length < 1 ? (
        <Box h={200} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack align="center" gap="xs">
            <ThemeIcon color="gray" variant="light" size="lg" radius="xl">
              <IconTrendingUp size={20} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">开始仿真后显示预测</Text>
          </Stack>
        </Box>
      ) : (
        <ReactECharts
          option={option!}
          style={{ height: 220 }}
          opts={{ renderer: 'svg' }}
        />
      )}

      {/* 预测信息 */}
      <Stack gap="xs" mt="md">
        {predictedUlcerTime && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            py={6}
            styles={{ message: { fontSize: 12 } }}
          >
            <Group gap={4}>
              <Text size="xs" fw={500}>预计压疮形成时间:</Text>
              <Text size="xs" c="red" fw={600}>{formatTime(predictedUlcerTime)}</Text>
            </Group>
          </Alert>
        )}
        
        <Group gap="md">
          <Group gap={4}>
            <IconClock size={14} color="var(--mantine-color-orange-6)" />
            <Text size="xs" c="dimmed">
              建议翻身: <Text span fw={600} c="orange">{formatTime(recommendedRepositionTime)}</Text>
            </Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
};