/**
 * 参数控制面板组件
 * 使用 Mantine UI
 */

import { Paper, Slider, NumberInput, Select, Button, Badge, Group, Text, Stack, Box, Collapse, ActionIcon, Tooltip, Divider, ThemeIcon, SegmentedControl, UnstyledButton } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconUser, IconTemperature, IconDroplet, IconGauge, IconClock, IconDeviceFloppy, IconChevronDown, IconChevronUp, IconRefresh, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import type { SimulationParams } from '../types';
import { PRESET_SCENARIOS } from '../config/presets.config';

interface ParameterPanelProps {
  params: SimulationParams;
  onUpdateParams: (updates: Partial<SimulationParams>) => void;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onReset: () => void;
}

export const ParameterPanel = ({
  params,
  onUpdateParams,
  isRunning,
  isPaused,
  isFinished,
  onStart,
  onPause,
  onResume,
  onFinish,
  onReset,
}: ParameterPanelProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return 'yellow';
    if (bmi < 25) return 'green';
    if (bmi < 30) return 'orange';
    return 'red';
  };

  const getBMILabel = (bmi: number): string => {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 25) return '正常';
    if (bmi < 30) return '超重';
    return '肥胖';
  };

  const getPressureStatus = (pressure: number): { color: string; label: string } => {
    if (pressure <= 32) return { color: 'green', label: '安全' };
    if (pressure <= 70) return { color: 'lime', label: '轻度' };
    if (pressure <= 100) return { color: 'yellow', label: '中度' };
    if (pressure <= 150) return { color: 'orange', label: '高度' };
    return { color: 'red', label: '危险' };
  };

  const getTempStatus = (temp: number): { color: string } => {
    if (temp < 18) return { color: 'blue' };
    if (temp <= 25) return { color: 'green' };
    if (temp < 30) return { color: 'orange' };
    return { color: 'red' };
  };

  const getHumidityStatus = (humidity: number): { color: string } => {
    if (humidity < 30) return { color: 'yellow' };
    if (humidity <= 70) return { color: 'green' };
    return { color: 'orange' };
  };

  const updateParam = (key: keyof SimulationParams, value: number) => {
    const updates: Partial<SimulationParams> = { [key]: value };

    if (key === 'height' || key === 'weight') {
      const newHeight = key === 'height' ? value : params.height;
      const newWeight = key === 'weight' ? value : params.weight;
      const heightInM = newHeight / 100;
      updates.bmi = parseFloat((newWeight / (heightInM * heightInM)).toFixed(1));
    }

    onUpdateParams(updates);
  };

  const pressureStatus = getPressureStatus(params.pressure);
  const tempStatus = getTempStatus(params.temperature);
  const humidityStatus = getHumidityStatus(params.humidity);

  return (
    <Stack gap="xs">
      {/* 预设场景 */}
      <Box>
        <Text size="xs" fw={500} c="dimmed" mb={4}>预设场景</Text>
        <Select
          data={PRESET_SCENARIOS.map(p => ({
            value: p.name,
            label: p.name,
            description: p.description
          }))}
          value={PRESET_SCENARIOS.find(p =>
            JSON.stringify(p.params) === JSON.stringify(params)
          )?.name || null}
          onChange={(value) => {
            const preset = PRESET_SCENARIOS.find(p => p.name === value);
            if (preset?.params) {
              onUpdateParams(preset.params);
            }
          }}
          size="xs"
          clearable
          placeholder="选择预设..."
        />
      </Box>

      <Divider my={4} />

      {/* 身高体重 */}
      <Box>
        <Group justify="space-between" mb={4}>
          <Group gap={4}>
            <IconUser size={12} />
            <Text size="xs" fw={500}>身体参数</Text>
          </Group>
        </Group>

        <Group grow mb={4}>
          <Box>
            <Text size="10px" c="dimmed" mb={2}>身高 (cm)</Text>
            <NumberInput
              value={params.height}
              onChange={(value) => updateParam('height', Number(value))}
              min={140}
              max={200}
              size="xs"
              disabled={isRunning && !isPaused}
            />
          </Box>
          <Box>
            <Text size="10px" c="dimmed" mb={2}>体重 (kg)</Text>
            <NumberInput
              value={params.weight}
              onChange={(value) => updateParam('weight', Number(value))}
              min={40}
              max={150}
              size="xs"
              disabled={isRunning && !isPaused}
            />
          </Box>
        </Group>

        {/* BMI 显示 */}
        <Paper p="xs" radius="xs" bg="gray.0">
          <Group justify="space-between">
            <Text size="xs" c="dimmed">BMI 指数</Text>
            <Group gap={4}>
              <Text size="sm" fw={700} c={getBMIColor(params.bmi)}>
                {params.bmi.toFixed(1)}
              </Text>
              <Badge color={getBMIColor(params.bmi)} variant="light" size="xs">
                {getBMILabel(params.bmi)}
              </Badge>
            </Group>
          </Group>
        </Paper>
      </Box>

      {/* 环境参数 */}
      <Box>
        <Group justify="space-between" mb={4}>
          <Group gap={4}>
            <IconTemperature size={12} />
            <Text size="xs" fw={500}>环境参数</Text>
          </Group>
        </Group>

        {/* 环境温度 */}
        <Box mb="xs">
          <Group justify="space-between" mb={2}>
            <Text size="10px" c="dimmed">环境温度</Text>
            <Group gap={4}>
              <Text size="xs" fw={500}>{params.temperature}°C</Text>
              <Badge color={tempStatus.color} variant="light" size="xs">
                {params.temperature < 18 ? '偏低' : params.temperature > 28 ? '偏高' : '适宜'}
              </Badge>
            </Group>
          </Group>
          <Slider
            value={params.temperature}
            onChange={(value) => updateParam('temperature', value)}
            min={15}
            max={35}
            step={1}
            size="xs"
            color={tempStatus.color}
            disabled={isRunning && !isPaused}
          />
        </Box>

        {/* 环境湿度 */}
        <Box>
          <Group justify="space-between" mb={2}>
            <Text size="10px" c="dimmed">环境湿度</Text>
            <Group gap={4}>
              <Text size="xs" fw={500}>{params.humidity}%</Text>
              <Badge color={humidityStatus.color} variant="light" size="xs">
                {params.humidity < 30 ? '干燥' : params.humidity > 70 ? '潮湿' : '适宜'}
              </Badge>
            </Group>
          </Group>
          <Slider
            value={params.humidity}
            onChange={(value) => updateParam('humidity', value)}
            min={20}
            max={90}
            step={1}
            size="xs"
            color={humidityStatus.color}
            disabled={isRunning && !isPaused}
          />
        </Box>
      </Box>

      {/* 界面压力 */}
      <Box>
        <Group justify="space-between" mb={4}>
          <Group gap={4}>
            <IconGauge size={12} />
            <Text size="xs" fw={500}>界面压力</Text>
          </Group>
          <Tooltip label="毛细血管闭合压约32mmHg" position="left" withinPortal>
            <IconInfoCircle size={12} style={{ cursor: 'help' }} color="var(--mantine-color-gray-5)" />
          </Tooltip>
        </Group>

        <Group justify="space-between" mb={2}>
          <Text size="xs" c="dimmed">{params.pressure} mmHg</Text>
          <Badge color={pressureStatus.color} variant="light" size="xs">
            {pressureStatus.label}风险
          </Badge>
        </Group>

        <Slider
          value={params.pressure}
          onChange={(value) => updateParam('pressure', value)}
          min={0}
          max={300}
          step={1}
          size="xs"
          color={pressureStatus.color}
          disabled={isRunning && !isPaused}
          marks={[
            { value: 32, label: '32' },
            { value: 100, label: '100' },
            { value: 200, label: '200' },
          ]}
        />
      </Box>

      {/* 高级设置 */}
      <Box>
        <UnstyledButton
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ width: '100%', cursor: 'pointer' }}
        >
          <Group justify="space-between" py={4}>
            <Group gap={4}>
              <IconClock size={12} />
              <Text size="xs" fw={500}>时间速度</Text>
            </Group>
            <Group gap={4}>
              <Badge variant="light" size="xs">{params.timeSpeed}x</Badge>
              <ActionIcon variant="subtle" size="xs">
                {showAdvanced ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
              </ActionIcon>
            </Group>
          </Group>
        </UnstyledButton>

        <Collapse in={showAdvanced}>
          <Box p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
            <Text size="10px" c="dimmed" mb={4}>仿真速度倍率</Text>
            <SegmentedControl
              value={params.timeSpeed.toString()}
              onChange={(value) => updateParam('timeSpeed', parseFloat(value))}
              data={[
                { label: '1x', value: '1' },
                { label: '10x', value: '10' },
                { label: '60x', value: '60' },
                { label: '120x', value: '120' },
              ]}
              size="xs"
              fullWidth
              disabled={isRunning && !isPaused}
            />
            <Text size="9px" c="dimmed" mt={4}>
              1x = 实时 | 60x = 1分钟=1小时
            </Text>
          </Box>
        </Collapse>
      </Box>

      <Divider my={4} />

      {/* 仿真控制模块 */}
      <Paper p="xs" radius="xs" bg="blue.0" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={600} c="dimmed">仿真控制</Text>
          <Badge
            color={isRunning && !isPaused ? 'green' : isPaused ? 'yellow' : isFinished ? 'blue' : 'gray'}
            variant="light"
            size="xs"
          >
            {isRunning && !isPaused ? '运行中' : isPaused ? '已暂停' : isFinished ? '已结束' : '就绪'}
          </Badge>
        </Group>

        <Group grow gap="xs">
          <Button
            onClick={onStart}
            disabled={isRunning && !isFinished}
            size="compact-xs"
            color="green"
            leftSection={<IconPlayerPlay size={12} />}
          >
            开始
          </Button>

          {isPaused ? (
            <Button
              onClick={onResume}
              disabled={!isRunning || isFinished}
              size="compact-xs"
              color="green"
              leftSection={<IconPlayerPlay size={12} />}
            >
              继续
            </Button>
          ) : (
            <Button
              onClick={onPause}
              disabled={!isRunning || isPaused || isFinished}
              size="compact-xs"
              variant="light"
              color="yellow"
              leftSection={<IconPlayerPause size={12} />}
            >
              暂停
            </Button>
          )}

          <Button
            onClick={onFinish}
            disabled={!isRunning || isFinished}
            size="compact-xs"
            color="blue"
            leftSection={<IconDeviceFloppy size={12} />}
          >
            结束
          </Button>

          <Button
            onClick={onReset}
            size="compact-xs"
            variant="light"
            leftSection={<IconRefresh size={12} />}
          >
            重置
          </Button>
        </Group>
      </Paper>

      {/* 提示信息 */}
      {isRunning && !isPaused && (
        <Paper p="xs" radius="xs" bg="yellow.0">
          <Group gap={4}>
            <IconInfoCircle size={12} color="var(--mantine-color-yellow-6)" />
            <Text size="10px" c="yellow.8">
              仿真运行中，部分参数已锁定
            </Text>
          </Group>
        </Paper>
      )}
    </Stack>
  );
};