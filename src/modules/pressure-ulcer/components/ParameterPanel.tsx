/**
 * 参数控制面板组件 - 优化版
 * 支持仿真运行时实时调整参数
 */

import {
  Paper, Slider, NumberInput, Select, Button, Badge, Group, Text, Stack, Box,
  Collapse, ActionIcon, Tooltip, Divider, ThemeIcon, SegmentedControl, UnstyledButton
} from '@mantine/core';
import {
  IconPlayerPlay, IconPlayerPause, IconUser, IconTemperature,
  IconGauge, IconClock, IconDeviceFloppy, IconChevronDown, IconChevronUp,
  IconRefresh, IconInfoCircle, IconBolt, IconAlertCircle
} from '@tabler/icons-react';
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
  currentDamage?: number;
  riskScore?: number;
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
  currentDamage = 0,
  riskScore = 0,
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

  const getTempStatus = (temp: number): { color: string; label: string } => {
    if (temp < 18) return { color: 'blue', label: '偏冷' };
    if (temp <= 25) return { color: 'green', label: '适宜' };
    if (temp < 30) return { color: 'orange', label: '偏热' };
    return { color: 'red', label: '过热' };
  };

  const getHumidityStatus = (humidity: number): { color: string; label: string } => {
    if (humidity < 30) return { color: 'yellow', label: '干燥' };
    if (humidity <= 70) return { color: 'green', label: '适宜' };
    return { color: 'orange', label: '潮湿' };
  };

  // 实时更新参数，不限制运行状态
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

  // 计算参数变化对伤害的预估影响
  const getDamageImpact = (): { text: string; color: string } | null => {
    if (!isRunning) return null;

    // 基于当前压力与临界压力(32mmHg)的关系估算
    const pressureRatio = params.pressure / 32;
    if (pressureRatio > 2) {
      return { text: '高压风险↑', color: 'red' };
    } else if (pressureRatio > 1.5) {
      return { text: '压力偏高', color: 'orange' };
    } else if (pressureRatio < 0.8) {
      return { text: '压力安全', color: 'green' };
    }
    return null;
  };

  const damageImpact = getDamageImpact();

  return (
    <Stack gap="xs">
      {/* 实时调整提示 */}
      {isRunning && (
        <Paper p="xs" radius="xs" bg="blue.0" withBorder>
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="sm">
              <IconBolt size={14} />
            </ThemeIcon>
            <Text size="xs" c="blue.8">
              仿真运行中，参数实时生效
            </Text>
          </Group>
        </Paper>
      )}

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

      {/* 身体参数 */}
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
              // 移除 disabled 限制，允许实时调整
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
      <Paper p="xs" radius="xs" bg="gray.0" withBorder>
        <Group gap={4} mb="xs">
          <IconTemperature size={14} />
          <Text size="xs" fw={600}>环境参数</Text>
        </Group>

        <Stack gap="sm">
          {/* 环境温度 */}
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="11px" c="dimmed">环境温度</Text>
              <Group gap={6}>
                <Text size="sm" fw={600}>{params.temperature}°C</Text>
                <Badge color={tempStatus.color} variant="light" size="xs">
                  {tempStatus.label}
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
              marks={[
                { value: 18, label: '18°' },
                { value: 25, label: '25°' },
              ]}
            />
          </Box>

          <Divider />

          {/* 环境湿度 */}
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="11px" c="dimmed">环境湿度</Text>
              <Group gap={6}>
                <Text size="sm" fw={600}>{params.humidity}%</Text>
                <Badge color={humidityStatus.color} variant="light" size="xs">
                  {humidityStatus.label}
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
              marks={[
                { value: 30, label: '30%' },
                { value: 70, label: '70%' },
              ]}
            />
          </Box>
        </Stack>
      </Paper>

      {/* 界面压力 */}
      <Paper p="xs" radius="xs" bg="gray.0" withBorder>
        <Group justify="space-between" mb="xs">
          <Group gap={4}>
            <IconGauge size={14} />
            <Text size="xs" fw={600}>界面压力</Text>
          </Group>
          <Tooltip label="毛细血管闭合压约32mmHg" position="left" withinPortal>
            <IconInfoCircle size={12} style={{ cursor: 'help' }} color="var(--mantine-color-gray-5)" />
          </Tooltip>
        </Group>

        <Stack gap="xs">
          {/* 压力数值和状态 */}
          <Group justify="space-between" align="center">
            <Group gap={8}>
              <Text size="lg" fw={700} c={pressureStatus.color}>
                {params.pressure}
              </Text>
              <Text size="xs" c="dimmed">mmHg</Text>
            </Group>
            <Group gap={6}>
              {damageImpact && (
                <Badge color={damageImpact.color} variant="filled" size="xs">
                  {damageImpact.text}
                </Badge>
              )}
              <Badge color={pressureStatus.color} variant="light" size="xs">
                {pressureStatus.label}风险
              </Badge>
            </Group>
          </Group>

          <Slider
            value={params.pressure}
            onChange={(value) => updateParam('pressure', value)}
            min={0}
            max={300}
            step={1}
            size="xs"
            color={pressureStatus.color}
            marks={[
              { value: 32, label: '32' },
              { value: 100, label: '100' },
              { value: 200, label: '200' },
            ]}
          />

          {/* 压力影响提示 */}
          {isRunning && (
            <Paper p={6} radius="xs" bg={params.pressure > 32 ? 'red.0' : 'green.0'}>
              <Group gap="xs">
                <Text size="11px" c={params.pressure > 32 ? 'red.7' : 'green.7'}>
                  伤害累积: {params.pressure > 32 ? '↑ 加快' : '→ 正常'}
                </Text>
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>

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
          {!isRunning ? (
            <Button
              onClick={onStart}
              size="compact-xs"
              color="green"
              leftSection={<IconPlayerPlay size={12} />}
            >
              开始
            </Button>
          ) : isPaused ? (
            <Button
              onClick={onResume}
              size="compact-xs"
              color="green"
              leftSection={<IconPlayerPlay size={12} />}
            >
              继续
            </Button>
          ) : (
            <Button
              onClick={onPause}
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
            disabled={!isRunning}
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

      {/* 风险提示 */}
      {isRunning && params.pressure > 100 && (
        <Paper p="xs" radius="xs" bg="red.0" withBorder>
          <Group gap="xs">
            <ThemeIcon color="red" variant="light" size="sm">
              <IconAlertCircle size={14} />
            </ThemeIcon>
            <Text size="10px" c="red.8">
              高压警告：当前压力 {params.pressure}mmHg 远超安全值
            </Text>
          </Group>
        </Paper>
      )}
    </Stack>
  );
};
