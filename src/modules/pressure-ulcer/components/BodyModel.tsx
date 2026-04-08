/**
 * 人体模型组件 - 2D SVG 版本
 * 使用 Mantine UI 组件
 * 
 * 性能优化：使用 memo 防止不必要的重渲染
 */

import { useState, useCallback, useRef, memo } from 'react';
import { Badge, Button, Group, Text, Box, Paper, Tooltip, Progress, ThemeIcon } from '@mantine/core';
import { IconRotateClockwise, IconAlertTriangle } from '@tabler/icons-react';
import { BODY_PARTS_CONFIG, BODY_PART_LABELS } from '../config/bodyParts.config';
import type { BodyPart, BodyPartType } from '../types';

interface BodyModelProps {
  bodyParts: Record<BodyPartType, BodyPart>;
  onReposition?: () => void;
  isRunning?: boolean;
  isFinished?: boolean;
}

/**
 * 获取伤害对应的颜色
 */
const getDamageColor = (damage: number): string => {
  if (damage < 30) {
    const ratio = damage / 30;
    const r = Math.round(34 + (239 - 34) * ratio);
    const g = Math.round(197 + (68 - 197) * ratio);
    const b = Math.round(94 + (68 - 94) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (damage < 70) {
    const ratio = (damage - 30) / 40;
    const r = Math.round(239 + (220 - 239) * ratio);
    const g = Math.round(68 + (38 - 68) * ratio);
    const b = Math.round(68 + (38 - 68) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return '#dc2626';
};

/**
 * 获取伤害等级标签
 */
const getDamageLabel = (damage: number): { label: string; color: string } => {
  if (damage < 10) return { label: '正常', color: 'green' };
  if (damage < 30) return { label: '轻度风险', color: 'lime' };
  if (damage < 50) return { label: '中度风险', color: 'yellow' };
  if (damage < 70) return { label: '高风险', color: 'orange' };
  return { label: '严重损伤', color: 'red' };
};

/**
 * 获取压疮分期
 */
const getPressureUlcerStage = (damage: number): string => {
  if (damage < 10) return '皮肤完整';
  if (damage < 30) return 'Ⅰ期：红斑';
  if (damage < 50) return 'Ⅱ期：部分皮层损伤';
  if (damage < 70) return 'Ⅲ期：全层皮肤损伤';
  return 'Ⅳ期：全层组织损伤';
};

export const BodyModel = memo(({
  bodyParts,
  onReposition,
  isRunning = false,
  isFinished = false,
}: BodyModelProps) => {
  const [hoveredPart, setHoveredPart] = useState<BodyPartType | null>(null);
  const [rotationY, setRotationY] = useState(0);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const directionRef = useRef(1);

  const handleReposition = useCallback(() => {
    if (isRepositioning) return;

    setIsRepositioning(true);
    const direction = directionRef.current;
    setRotationY(direction * 10);
    onReposition?.();

    setTimeout(() => {
      setRotationY(0);
      setIsRepositioning(false);
      directionRef.current = -direction;
    }, 2000);
  }, [isRepositioning, onReposition]);

  // 计算总体伤害状态
  const maxDamage = Math.max(...Object.values(bodyParts).map(p => p.damage));
  const hasHighDamage = maxDamage >= 50;
  const hasCriticalDamage = maxDamage >= 70;

  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* SVG 人体模型 */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: 0,
        }}
      >
        <svg
          viewBox="0 0 200 480"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: 200,
            maxHeight: 380,
            filter: hasCriticalDamage
              ? 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.5))'
              : hasHighDamage
                ? 'drop-shadow(0 0 15px rgba(249, 115, 22, 0.4))'
                : 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))',
            transform: `perspective(600px) rotateY(${rotationY}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.5s ease-in-out, filter 0.3s ease',
          }}
        >
          <defs>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f5d0c5" />
              <stop offset="30%" stopColor="#fce4dc" />
              <stop offset="50%" stopColor="#fdf2ed" />
              <stop offset="70%" stopColor="#fce4dc" />
              <stop offset="100%" stopColor="#f5d0c5" />
            </linearGradient>
            <radialGradient id="highlight" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            {/* 脉冲动画 */}
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { opacity: 0.2; transform: scale(1); }
                  50% { opacity: 0.35; transform: scale(1.1); }
                }
                .damage-pulse {
                  animation: pulse 1.5s ease-in-out infinite;
                }
              `}
            </style>
          </defs>

          <g transform="translate(0, 10)">
            {/* 头部 */}
            <ellipse cx="100" cy="28" rx="22" ry="25" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <ellipse cx="94" cy="20" rx="8" ry="10" fill="url(#highlight)" />

            {/* 颈部 */}
            <path d="M 90 50 Q 100 55 110 50 L 110 62 Q 100 65 90 62 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 肩膀 */}
            <ellipse cx="52" cy="70" rx="18" ry="10" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <ellipse cx="148" cy="70" rx="18" ry="10" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 胸部 */}
            <path d="M 68 75 Q 50 85 48 105 Q 46 125 50 140 Q 55 155 72 158 L 128 158 Q 145 155 150 140 Q 154 125 152 105 Q 150 85 132 75 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 腹部 */}
            <path d="M 72 158 Q 65 172 68 190 Q 72 205 82 210 L 118 210 Q 128 205 132 190 Q 135 172 128 158 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 骨盆/臀部 */}
            <path d="M 68 210 Q 55 220 53 238 Q 52 255 60 268 Q 72 278 100 278 Q 128 278 140 268 Q 148 255 147 238 Q 145 220 132 210 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 左臂 */}
            <path d="M 36 72 Q 20 82 18 105 Q 16 128 20 148 Q 25 162 38 166 L 48 162 Q 44 148 46 130 Q 50 110 55 95 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <path d="M 20 168 Q 12 182 10 202 Q 8 222 14 240 Q 20 254 34 258 L 44 254 Q 40 238 44 218 Q 48 198 48 182 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <ellipse cx="28" cy="272" rx="12" ry="15" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 右臂 */}
            <path d="M 164 72 Q 180 82 182 105 Q 184 128 180 148 Q 175 162 162 166 L 152 162 Q 156 148 154 130 Q 150 110 145 95 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <path d="M 180 168 Q 188 182 190 202 Q 192 222 186 240 Q 180 254 166 258 L 156 254 Q 160 238 156 218 Q 152 198 152 182 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <ellipse cx="172" cy="272" rx="12" ry="15" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 左腿 */}
            <path d="M 72 278 Q 55 288 53 308 Q 52 328 56 345 Q 62 360 76 363 L 92 362 Q 90 345 92 328 Q 96 310 94 295 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <path d="M 54 365 Q 44 375 42 392 Q 40 410 46 425 Q 52 438 64 440 L 78 438 Q 74 425 78 408 Q 82 392 82 378 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <ellipse cx="58" cy="455" rx="16" ry="11" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 右腿 */}
            <path d="M 128 278 Q 145 288 147 308 Q 148 328 144 345 Q 138 360 124 363 L 108 362 Q 110 345 108 328 Q 104 310 106 295 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <path d="M 146 365 Q 156 375 158 392 Q 160 410 154 425 Q 148 438 136 440 L 122 438 Q 126 425 122 408 Q 118 392 118 378 Z" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />
            <ellipse cx="142" cy="455" rx="16" ry="11" fill="url(#skinGradient)" stroke="#d4a89a" strokeWidth="0.8" />

            {/* 压疮高发部位标记 */}
            {(Object.keys(bodyParts) as BodyPartType[]).map((partId) => {
              const part = bodyParts[partId];
              const site = BODY_PARTS_CONFIG[partId];
              const color = getDamageColor(part.damage);
              const isHovered = hoveredPart === partId;

              const sizeMultiplier = 1 + part.damage / 120;
              const rx = site.svg.rx * sizeMultiplier;
              const ry = site.svg.ry * sizeMultiplier;

              // 是否显示脉冲动画
              const showPulse = isRunning && part.damage >= 30;

              return (
                <g
                  key={partId}
                  onMouseEnter={() => setHoveredPart(partId)}
                  onMouseLeave={() => setHoveredPart(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* 外层光晕 */}
                  {part.damage >= 30 && (
                    <ellipse
                      cx={site.svg.cx}
                      cy={site.svg.cy}
                      rx={rx * 1.6}
                      ry={ry * 1.6}
                      fill={color}
                      opacity={isHovered ? 0.4 : 0.2}
                      className={showPulse ? 'damage-pulse' : undefined}
                      style={{ transition: 'opacity 0.3s ease' }}
                    />
                  )}

                  <ellipse
                    cx={site.svg.cx}
                    cy={site.svg.cy}
                    rx={rx * 1.4}
                    ry={ry * 1.4}
                    fill={color}
                    opacity={isHovered ? 0.35 : 0.2}
                  />

                  <ellipse
                    cx={site.svg.cx}
                    cy={site.svg.cy}
                    rx={rx}
                    ry={ry}
                    fill={color}
                    stroke="white"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    style={{
                      filter: part.damage >= 50 ? `drop-shadow(0 0 ${part.damage / 8}px ${color})` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />

                  {part.damage >= 10 && (
                    <text
                      x={site.svg.cx}
                      y={site.svg.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={Math.max(7, Math.min(rx, ry) * 0.4)}
                      fontWeight="bold"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {Math.round(part.damage)}%
                    </text>
                  )}

                  {part.damage < 10 && (
                    <text
                      x={site.svg.cx}
                      y={site.svg.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                    >
                      {BODY_PART_LABELS[partId]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* 体位标签 - 左上角 */}
        <Badge
          variant="outline"
          size="sm"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          仰卧位
        </Badge>

        {/* 状态指示器 - 右上角 */}
        {hasCriticalDamage && (
          <ThemeIcon
            color="red"
            variant="light"
            size="md"
            radius="xl"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              animation: 'pulse 1s infinite',
            }}
          >
            <IconAlertTriangle size={16} />
          </ThemeIcon>
        )}
      </Box>

      {/* 底部控制区 */}
      <Box
        style={{
          padding: '8px',
          borderTop: '1px solid var(--mantine-color-gray-2)',
          backgroundColor: 'var(--mantine-color-gray-0)',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Tooltip label="翻身可重置伤害累积" position="top">
          <Button
            onClick={handleReposition}
            disabled={!isRunning || isFinished}
            size="compact-sm"
            color="grape"
            leftSection={<IconRotateClockwise size={14} />}
          >
            翻身
          </Button>
        </Tooltip>
      </Box>

      {/* 悬停提示面板 */}
      {hoveredPart && (
        <Paper
          shadow="sm"
          p="xs"
          radius="sm"
          style={{
            position: 'absolute',
            top: 40,
            right: 8,
            zIndex: 100,
            maxWidth: 160,
          }}
        >
          <Text fw={600} size="xs">{BODY_PARTS_CONFIG[hoveredPart].name}</Text>
          <Text size="10px" c="dimmed">{BODY_PARTS_CONFIG[hoveredPart].nameEn}</Text>
          
          <Group gap={4} mt={4}>
            <Badge
              color={getDamageLabel(bodyParts[hoveredPart].damage).color}
              variant="light"
              size="xs"
            >
              {getDamageLabel(bodyParts[hoveredPart].damage).label}
            </Badge>
          </Group>
          
          <Text size="10px" mt={4}>伤害: {bodyParts[hoveredPart].damage.toFixed(1)}%</Text>
          <Text size="9px" c="dimmed" mt={2}>{getPressureUlcerStage(bodyParts[hoveredPart].damage)}</Text>
          
          <Progress
            value={bodyParts[hoveredPart].damage}
            size="xs"
            color={getDamageLabel(bodyParts[hoveredPart].damage).color}
            mt={4}
          />
        </Paper>
      )}
    </Box>
  );
});

BodyModel.displayName = 'BodyModel';