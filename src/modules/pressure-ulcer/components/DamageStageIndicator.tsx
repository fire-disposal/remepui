/**
 * 伤害阶段指示器组件
 * 可视化展示压疮形成的各个阶段
 */

import { Paper, Text, Group, Box, ThemeIcon, Progress, Badge } from '@mantine/core';
import {
  IconCircleCheck, IconAlertCircle, IconAlertTriangle,
  IconHeartBroken, IconSkull
} from '@tabler/icons-react';

interface DamageStageIndicatorProps {
  damagePercent: number;
}

interface StageConfig {
  id: number;
  label: string;
  description: string;
  range: [number, number];
  color: string;
  icon: typeof IconCircleCheck;
}

const STAGES: StageConfig[] = [
  {
    id: 0,
    label: '正常',
    description: '皮肤完整，无损伤',
    range: [0, 10],
    color: 'green',
    icon: IconCircleCheck,
  },
  {
    id: 1,
    label: 'Ⅰ期',
    description: '皮肤完整，出现压之不褪色的红斑',
    range: [10, 30],
    color: 'lime',
    icon: IconAlertCircle,
  },
  {
    id: 2,
    label: 'Ⅱ期',
    description: '部分皮层缺失，浅表溃疡',
    range: [30, 50],
    color: 'yellow',
    icon: IconAlertTriangle,
  },
  {
    id: 3,
    label: 'Ⅲ期',
    description: '全层皮肤缺失，可见皮下脂肪',
    range: [50, 70],
    color: 'orange',
    icon: IconHeartBroken,
  },
  {
    id: 4,
    label: 'Ⅳ期',
    description: '全层组织缺失，暴露骨骼/肌肉',
    range: [70, 100],
    color: 'red',
    icon: IconSkull,
  },
];

const getCurrentStage = (damage: number): StageConfig => {
  for (const stage of STAGES) {
    if (damage >= stage.range[0] && damage < stage.range[1]) {
      return stage;
    }
  }
  return STAGES[STAGES.length - 1];
};

const getStageColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    green: 'var(--mantine-color-green-6)',
    lime: 'var(--mantine-color-lime-6)',
    yellow: 'var(--mantine-color-yellow-6)',
    orange: 'var(--mantine-color-orange-6)',
    red: 'var(--mantine-color-red-6)',
  };
  return colorMap[color] || 'var(--mantine-color-gray-6)';
};

const getStageShadowColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    green: 'var(--mantine-color-green-5)',
    lime: 'var(--mantine-color-lime-5)',
    yellow: 'var(--mantine-color-yellow-5)',
    orange: 'var(--mantine-color-orange-5)',
    red: 'var(--mantine-color-red-5)',
  };
  return colorMap[color] || 'var(--mantine-color-gray-5)';
};

export const DamageStageIndicator: React.FC<DamageStageIndicatorProps> = ({
  damagePercent,
}) => {
  const currentStage = getCurrentStage(damagePercent);
  const IconComponent = currentStage.icon;

  return (
    <Paper shadow="xs" p="sm" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="xs" fw={600}>压疮分期</Text>
        <Badge color={currentStage.color} variant="light" size="sm">
          {currentStage.label}
        </Badge>
      </Group>

      {/* 阶段进度条 */}
      <Box mb="sm">
        <Group gap={0} grow>
          {STAGES.map((stage) => {
            const isActive = damagePercent >= stage.range[0];
            const isCurrent = stage.id === currentStage.id;
            const StageIcon = stage.icon;

            return (
              <Box
                key={stage.id}
                style={{
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Box
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    margin: '0 auto 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive
                      ? getStageColor(stage.color)
                      : 'var(--mantine-color-gray-3)',
                    transition: 'all 0.3s ease',
                    transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: isCurrent
                      ? `0 0 10px ${getStageShadowColor(stage.color)}`
                      : 'none',
                  }}
                >
                  <StageIcon size={12} color="white" />
                </Box>
                <Text
                  size="9px"
                  fw={isCurrent ? 600 : 400}
                  c={isActive ? stage.color : 'dimmed'}
                >
                  {stage.label}
                </Text>
              </Box>
            );
          })}
        </Group>

        {/* 连接线 */}
        <Box
          style={{
            position: 'relative',
            height: 4,
            marginTop: 8,
            marginBottom: 8,
            backgroundColor: 'var(--mantine-color-gray-2)',
            borderRadius: 2,
          }}
        >
          <Box
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${damagePercent}%`,
              background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
      </Box>

      {/* 当前阶段描述 */}
      <Paper p="xs" radius="xs" bg={`${currentStage.color}.0`}>
        <Group gap="xs">
          <ThemeIcon color={currentStage.color} variant="light" size="sm">
            <IconComponent size={14} />
          </ThemeIcon>
          <Box flex={1}>
            <Text size="xs" fw={500} c={`${currentStage.color}.7`}>
              {currentStage.label}：{currentStage.description}
            </Text>
          </Box>
        </Group>
      </Paper>

      {/* 伤害值进度 */}
      <Group justify="space-between" mt="xs">
        <Text size="10px" c="dimmed">伤害累积</Text>
        <Text size="xs" fw={600} c={currentStage.color}>
          {damagePercent.toFixed(1)}%
        </Text>
      </Group>
      <Progress
        value={damagePercent}
        size="xs"
        color={currentStage.color}
        animated={damagePercent > 0}
      />
    </Paper>
  );
};