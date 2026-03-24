/**
 * 时间控制组件
 * 使用 Mantine UI
 */

import { Paper, Text, Group, Progress, Tooltip, Stack, Box } from '@mantine/core';
import { IconClock, IconHourglass, IconAlertCircle } from '@tabler/icons-react';

interface TimeControlProps {
  elapsedTime: number;
  criticalTime: number;
  formatTime: (seconds: number) => string;
  isRunning: boolean;
}

export const TimeControl: React.FC<TimeControlProps> = ({
  elapsedTime,
  criticalTime,
  formatTime,
  isRunning,
}) => {
  // 计算剩余可逆转时间
  const remainingTime = Math.max(0, criticalTime - elapsedTime);
  const progressPercent = Math.min(100, (elapsedTime / criticalTime) * 100);

  // 判断时间状态
  const getTimeStatus = () => {
    if (progressPercent < 50) return { color: 'green', label: '安全' };
    if (progressPercent < 80) return { color: 'yellow', label: '注意' };
    return { color: 'red', label: '紧急' };
  };

  const timeStatus = getTimeStatus();

  return (
    <Paper shadow="xs" p="sm" radius="md" withBorder>
      <Group grow>
        {/* 累计受压时间 */}
        <Box>
          <Group gap={4} mb={4}>
            <IconClock size={14} style={{ color: isRunning ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-4)' }} />
            <Text size="xs" c="dimmed">累计受压时间</Text>
          </Group>
          <Text size="lg" ff="monospace" fw={700} c="dark">
            {formatTime(elapsedTime)}
          </Text>
        </Box>

        {/* 可逆转临界时间 */}
        <Tooltip
          position="bottom"
          withArrow
          withinPortal
          label={
            <Stack gap={4} p={4}>
              <Text size="xs" fw={600}>可逆转临界时间说明</Text>
              <Text size="10px" c="dimmed">
                基于当前风险系数和界面压力动态计算的安全时间窗口。
              </Text>
            </Stack>
          }
        >
          <Box style={{ cursor: 'help' }}>
            <Group gap={4} mb={4}>
              <IconHourglass size={14} style={{ color: 'var(--mantine-color-amber-6)' }} />
              <Text size="xs" c="dimmed">剩余可逆转时间</Text>
            </Group>
            <Text size="lg" ff="monospace" fw={700} c={timeStatus.color}>
              {formatTime(remainingTime)}
            </Text>
          </Box>
        </Tooltip>
      </Group>

      {/* 进度条 */}
      <Box mt="sm">
        <Group justify="space-between" mb={4}>
          <Text size="10px" c="dimmed">时间进度</Text>
          <Text size="10px" c={timeStatus.color} fw={500}>
            {timeStatus.label} ({progressPercent.toFixed(0)}%)
          </Text>
        </Group>
        <Progress
          value={progressPercent}
          size="sm"
          color={timeStatus.color}
          animated={isRunning && progressPercent < 100}
        />
      </Box>

      {/* 提示信息 */}
      <Group gap={4} mt="sm">
        {progressPercent >= 80 ? (
          <>
            <IconAlertCircle size={14} style={{ color: 'var(--mantine-color-red-5)' }} />
            <Text size="xs" c="red" fw={500}>建议立即翻身！</Text>
          </>
        ) : progressPercent >= 50 ? (
          <>
            <IconAlertCircle size={14} style={{ color: 'var(--mantine-color-yellow-5)' }} />
            <Text size="xs" c="yellow.7">请注意观察，准备翻身</Text>
          </>
        ) : (
          <>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--mantine-color-green-5)' }} />
            <Text size="xs" c="dimmed">当前处于安全时间范围内</Text>
          </>
        )}
      </Group>
    </Paper>
  );
};