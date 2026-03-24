/**
 * 警报系统组件
 * 使用 Mantine UI
 */

import { Paper, Text, Group, ActionIcon, Badge, Box, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconAlertOctagon, IconVolume, IconVolumeOff } from '@tabler/icons-react';
import type { AlertLevel } from '../types';

interface AlertSystemProps {
  alertLevel: AlertLevel;
  message: string;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onTestAudio: () => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  alertLevel,
  message,
  audioEnabled,
  onToggleAudio,
  onTestAudio,
}) => {
  if (alertLevel === 'none') {
    return (
      <Paper p="sm" radius="md" withBorder>
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon color="green" variant="light" size="sm">
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--mantine-color-green-5)' }} />
            </ThemeIcon>
            <Box>
              <Text size="xs" fw={500} c="dimmed">系统正常</Text>
              <Text size="10px" c="dimmed">当前无警报</Text>
            </Box>
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="light"
              size="xs"
              onClick={onTestAudio}
            >
              测试
            </ActionIcon>
            <ActionIcon
              variant={audioEnabled ? 'light' : 'subtle'}
              color={audioEnabled ? 'blue' : 'gray'}
              onClick={onToggleAudio}
              size="sm"
            >
              {audioEnabled ? <IconVolume size={14} /> : <IconVolumeOff size={14} />}
            </ActionIcon>
          </Group>
        </Group>
      </Paper>
    );
  }

  const isWarning = alertLevel === 'warning';
  const isDanger = alertLevel === 'danger';

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={{
        borderColor: isWarning ? 'var(--mantine-color-orange-4)' : 'var(--mantine-color-red-5)',
        backgroundColor: isWarning ? 'var(--mantine-color-orange-0)' : 'var(--mantine-color-red-0)',
      }}
    >
      <Group align="start" gap="sm">
        {/* 警报图标 */}
        <ThemeIcon
          color={isWarning ? 'orange' : 'red'}
          variant="light"
          size="md"
        >
          {isWarning ? <IconAlertTriangle size={16} /> : <IconAlertOctagon size={16} />}
        </ThemeIcon>

        {/* 警报内容 */}
        <Box flex={1}>
          <Group gap="xs" mb={2}>
            <Text size="sm" fw={700} c={isWarning ? 'orange.7' : 'red.7'}>
              {isWarning ? '警告' : '危险'}
            </Text>
            {audioEnabled && (
              <Badge size="xs" variant="light" color="gray">
                声音提示中
              </Badge>
            )}
          </Group>
          <Text size="xs" c={isWarning ? 'orange.8' : 'red.8'}>
            {message}
          </Text>

          {/* 建议操作 */}
          <Group gap={4} mt="xs">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isWarning ? 'var(--mantine-color-orange-5)' : 'var(--mantine-color-red-5)',
                animation: 'pulse 1s infinite',
              }}
            />
            <Text size="10px" fw={500} c={isWarning ? 'orange.7' : 'red.7'}>
              {isWarning ? '建议立即实施翻身操作' : '请立即采取医疗干预'}
            </Text>
          </Group>
        </Box>

        {/* 声音控制 */}
        <ActionIcon
          variant={audioEnabled ? 'light' : 'subtle'}
          color={audioEnabled ? (isWarning ? 'orange' : 'red') : 'gray'}
          onClick={onToggleAudio}
          size="sm"
        >
          {audioEnabled ? <IconVolume size={14} /> : <IconVolumeOff size={14} />}
        </ActionIcon>
      </Group>
    </Paper>
  );
};