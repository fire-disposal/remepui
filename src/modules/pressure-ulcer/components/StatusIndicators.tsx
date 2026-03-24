/**
 * 状态指示器组件
 * 使用 Mantine UI
 */

import { Paper, Text, Group, Progress, Tooltip, Stack, Box } from '@mantine/core';
import type { RiskFactors } from '../types';

interface StatusIndicatorsProps {
  riskScore: number;
  damagePercent: number;
  riskFactors: RiskFactors;
}

// 获取风险系数颜色
const getRiskColor = (score: number): string => {
  if (score <= 2) return 'green';
  if (score <= 4) return 'lime';
  if (score <= 6) return 'yellow';
  if (score <= 8) return 'orange';
  return 'red';
};

// 获取风险等级标签
const getRiskLabel = (score: number): string => {
  if (score <= 2) return '低风险';
  if (score <= 4) return '较低风险';
  if (score <= 6) return '中等风险';
  if (score <= 8) return '高风险';
  return '极高风险';
};

// 获取伤害颜色
const getDamageColor = (damage: number): string => {
  if (damage < 30) return 'green';
  if (damage < 70) return 'orange';
  return 'red';
};

// 获取伤害阶段标签
const getDamageLabel = (damage: number): string => {
  if (damage < 30) return '可逆阶段';
  if (damage < 70) return '需干预阶段';
  return '不可逆损伤';
};

export const StatusIndicators: React.FC<StatusIndicatorsProps> = ({
  riskScore,
  damagePercent,
  riskFactors,
}) => {
  const riskColor = getRiskColor(riskScore);
  const damageColor = getDamageColor(damagePercent);

  return (
    <Group grow gap="md">
      {/* 风险系数指示器 */}
      <Tooltip
        position="bottom"
        withArrow
        withinPortal
        label={
          <Stack gap={4} p={4}>
            <Text size="xs" fw={600}>风险系数详情</Text>
            <Group justify="space-between" gap="xl">
              <Text size="xs" c="dimmed">BMI影响:</Text>
              <Text size="xs" fw={500}>+{riskFactors.bmi.toFixed(1)}</Text>
            </Group>
            <Group justify="space-between" gap="xl">
              <Text size="xs" c="dimmed">温度影响:</Text>
              <Text size="xs" fw={500}>+{riskFactors.temperature.toFixed(1)}</Text>
            </Group>
            <Group justify="space-between" gap="xl">
              <Text size="xs" c="dimmed">湿度影响:</Text>
              <Text size="xs" fw={500}>+{riskFactors.humidity.toFixed(1)}</Text>
            </Group>
            <Group justify="space-between" gap="xl">
              <Text size="xs" c="dimmed">压力影响:</Text>
              <Text size="xs" fw={500}>+{riskFactors.pressure.toFixed(1)}</Text>
            </Group>
          </Stack>
        }
      >
        <Paper
          shadow="xs"
          radius="md"
          withBorder
          style={{ overflow: 'hidden', cursor: 'help' }}
        >
          <Box
            p="sm"
            style={{
              background: `linear-gradient(to right, #48bb78, #9ae6b4, #ecc94b, #ed8936, #e53e3e)`,
            }}
          >
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="white" fw={500}>压疮风险系数</Text>
            </Group>
            <Group align="baseline" gap={4}>
              <Text size="xl" fw={700} c={riskScore > 5 ? 'white' : 'dark'}>
                {riskScore.toFixed(1)}
              </Text>
              <Text size="sm" c={riskScore > 5 ? 'white' : 'dark'}>/ 10</Text>
            </Group>
            <Text size="xs" c={riskScore > 5 ? 'white' : 'dark'} fw={500}>
              {getRiskLabel(riskScore)}
            </Text>
            <Progress
              value={riskScore * 10}
              size="xs"
              color="white"
              mt="xs"
              style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
            />
          </Box>
        </Paper>
      </Tooltip>

      {/* 伤害累积指示器 */}
      <Tooltip
        position="bottom"
        withArrow
        withinPortal
        label={
          <Stack gap={4} p={4}>
            <Text size="xs" fw={600}>伤害累积说明</Text>
            <Group gap={4}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <Text size="xs">0-30% 可逆阶段</Text>
            </Group>
            <Group gap={4}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f97316' }} />
              <Text size="xs">30-70% 需干预阶段</Text>
            </Group>
            <Group gap={4}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <Text size="xs">70-100% 不可逆损伤</Text>
            </Group>
          </Stack>
        }
      >
        <Paper
          shadow="xs"
          radius="md"
          withBorder
          style={{ overflow: 'hidden', cursor: 'help' }}
        >
          <Box
            p="sm"
            style={{
              background: `linear-gradient(to right, #48bb78 0%, #48bb78 30%, #ed8936 30%, #ed8936 70%, #e53e3e 70%, #e53e3e 100%)`,
            }}
          >
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="white" fw={500}>伤害累积值</Text>
            </Group>
            <Group align="baseline" gap={4}>
              <Text size="xl" fw={700} c={damagePercent > 50 ? 'white' : 'dark'}>
                {damagePercent.toFixed(1)}
              </Text>
              <Text size="sm" c={damagePercent > 50 ? 'white' : 'dark'}>%</Text>
            </Group>
            <Text size="xs" c={damagePercent > 50 ? 'white' : 'dark'} fw={500}>
              {getDamageLabel(damagePercent)}
            </Text>
            <Progress
              value={damagePercent}
              size="xs"
              color="white"
              mt="xs"
              style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
            />
          </Box>
        </Paper>
      </Tooltip>
    </Group>
  );
};