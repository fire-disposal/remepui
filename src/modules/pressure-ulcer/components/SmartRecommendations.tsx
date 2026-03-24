/**
 * 智能护理建议组件
 * 基于当前状态提供个性化护理建议
 */

import { Paper, Text, Group, Stack, Box, ThemeIcon, Badge, Alert, Timeline, List } from '@mantine/core';
import {
  IconStethoscope, IconClock, IconRotateClockwise, IconAlertTriangle,
  IconCheck, IconInfoCircle, IconHeartRateMonitor, IconThermometer,
  IconDroplet, IconWeight
} from '@tabler/icons-react';
import type { SimulationParams, RiskFactors } from '../types';

interface SmartRecommendationsProps {
  /** 当前参数 */
  params: SimulationParams;
  /** 风险因素 */
  riskFactors: RiskFactors;
  /** 风险系数 */
  riskScore: number;
  /** 当前伤害值 */
  damagePercent: number;
  /** 建议翻身时间 */
  recommendedInterval: number;
  /** 预计压疮时间 */
  predictedUlcerTime: number | null;
  /** 是否运行中 */
  isRunning: boolean;
  /** 是否处于恢复期 */
  isRecovering: boolean;
  /** 翻身次数 */
  repositionCount: number;
  /** 格式化时间 */
  formatTime: (seconds: number) => string;
}

interface Recommendation {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  icon: typeof IconStethoscope;
  title: string;
  description: string;
  action?: string;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  params,
  riskFactors,
  riskScore,
  damagePercent,
  recommendedInterval,
  predictedUlcerTime,
  isRunning,
  isRecovering,
  repositionCount,
  formatTime,
}) => {
  // 生成建议列表
  const recommendations: Recommendation[] = [];

  // 紧急建议
  if (damagePercent >= 50) {
    recommendations.push({
      id: 'urgent-1',
      type: 'urgent',
      icon: IconAlertTriangle,
      title: '立即翻身',
      description: `伤害值已达 ${damagePercent.toFixed(1)}%，组织损伤严重`,
      action: '点击翻身按钮立即改变体位',
    });
  } else if (damagePercent >= 30 && isRunning && !isRecovering) {
    recommendations.push({
      id: 'warning-1',
      type: 'warning',
      icon: IconClock,
      title: '准备翻身',
      description: `建议 ${formatTime(recommendedInterval)} 内实施翻身`,
      action: '准备翻身操作',
    });
  }

  // 恢复期建议
  if (isRecovering) {
    recommendations.push({
      id: 'success-1',
      type: 'success',
      icon: IconCheck,
      title: '恢复期',
      description: '正在恢复中，组织灌注改善',
      action: '保持当前体位',
    });
  }

  // 风险因素建议
  if (riskFactors.pressure > 3) {
    recommendations.push({
      id: 'info-1',
      type: 'warning',
      icon: IconHeartRateMonitor,
      title: '压力过高',
      description: `界面压力 ${params.pressure}mmHg 超过安全范围`,
      action: '建议使用减压垫或气垫床',
    });
  }

  if (params.temperature > 28) {
    recommendations.push({
      id: 'info-2',
      type: 'info',
      icon: IconThermometer,
      title: '环境温度偏高',
      description: '高温增加出汗和皮肤浸渍风险',
      action: '建议调节室温至22-25°C',
    });
  }

  if (params.humidity > 70) {
    recommendations.push({
      id: 'info-3',
      type: 'info',
      icon: IconDroplet,
      title: '湿度过高',
      description: '高湿度环境易导致皮肤浸渍',
      action: '建议使用除湿设备',
    });
  }

  if (params.bmi < 18.5) {
    recommendations.push({
      id: 'info-4',
      type: 'warning',
      icon: IconWeight,
      title: '营养不良风险',
      description: 'BMI偏低，组织耐受性下降',
      action: '建议营养评估和干预',
    });
  }

  // 翻身频率建议
  if (repositionCount === 0 && isRunning) {
    recommendations.push({
      id: 'info-5',
      type: 'info',
      icon: IconRotateClockwise,
      title: '定期翻身',
      description: '尚未进行翻身操作',
      action: `建议每 ${formatTime(recommendedInterval)} 翻身一次`,
    });
  }

  // 预测建议
  if (predictedUlcerTime && predictedUlcerTime < 3600) {
    recommendations.push({
      id: 'urgent-2',
      type: 'urgent',
      icon: IconAlertTriangle,
      title: '高风险预警',
      description: `预计 ${formatTime(predictedUlcerTime)} 后可能形成压疮`,
      action: '密切监测，准备翻身',
    });
  }

  const getColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'urgent': return 'red';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      case 'success': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <Group gap="xs" mb="md">
        <ThemeIcon color="teal" variant="light" size="sm">
          <IconStethoscope size={14} />
        </ThemeIcon>
        <Text size="sm" fw={600}>智能护理建议</Text>
      </Group>

      {recommendations.length === 0 ? (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          py={8}
        >
          <Text size="xs">当前状态良好，请继续保持监测</Text>
        </Alert>
      ) : (
        <Stack gap="xs">
          {recommendations.map((rec) => {
            const IconComponent = rec.icon;
            const color = getColor(rec.type);
            
            return (
              <Paper
                key={rec.id}
                p="xs"
                radius="sm"
                bg={`${color}.0`}
                style={{ borderLeft: `3px solid var(--mantine-color-${color}-6)` }}
              >
                <Group gap="xs" align="start">
                  <ThemeIcon color={color} variant="light" size="sm" mt={2}>
                    <IconComponent size={12} />
                  </ThemeIcon>
                  <Box flex={1}>
                    <Text size="xs" fw={600} c={`${color}.7`}>
                      {rec.title}
                    </Text>
                    <Text size="11px" c="dimmed" mt={2}>
                      {rec.description}
                    </Text>
                    {rec.action && (
                      <Text size="10px" c={color} fw={500} mt={4}>
                        💡 {rec.action}
                      </Text>
                    )}
                  </Box>
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* 护理要点提示 */}
      <Paper p="xs" radius="sm" bg="gray.0" mt="md">
        <Text size="10px" fw={600} c="dimmed" mb={4}>护理要点</Text>
        <List size="xs" c="dimmed" spacing={2}>
          <List.Item>每 {formatTime(Math.min(recommendedInterval, 7200))} 评估一次皮肤状况</List.Item>
          <List.Item>保持皮肤清洁干燥</List.Item>
          <List.Item>使用30°侧卧位减少骶尾部压力</List.Item>
          <List.Item>骨突部位使用减压垫</List.Item>
        </List>
      </Paper>
    </Paper>
  );
};