/**
 * DERI 3D 人体模型组件
 * 使用 DERI (Digital Entity Rendering Interface) 渲染
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Box, Paper, Text, Group, Loader } from '@mantine/core';
import { DERIRenderer, createDERIBodyPartEntity } from '../core/deriRenderer';
import { DEFAULT_DERI_CONFIG } from '../core/deriRenderer';
import type { BodyPart, BodyPartType, BodyPosture } from '../types';

interface BodyModelDERIProps {
  bodyParts: Record<BodyPartType, BodyPart>;
  posture?: BodyPosture;
  autoRotate?: boolean;
  onPartHover?: (part: BodyPartType | null) => void;
  onPartClick?: (part: BodyPartType) => void;
  isRunning?: boolean;
}

/**
 * 身体部位 3D 配置 (DERI)
 */
const BODY_PARTS_DERI_CONFIG: Record<BodyPartType, {
  position: [number, number, number];
  scale: [number, number, number];
}> = {
  sacrum: {
    position: [0, 0.3, -0.15],
    scale: [0.25, 0.2, 0.15],
  },
  leftHeel: {
    position: [-0.15, 0, 0.4],
    scale: [0.12, 0.1, 0.12],
  },
  rightHeel: {
    position: [0.15, 0, 0.4],
    scale: [0.12, 0.1, 0.12],
  },
  leftTrochanter: {
    position: [-0.35, 0.4, 0],
    scale: [0.15, 0.18, 0.15],
  },
  rightTrochanter: {
    position: [0.35, 0.4, 0],
    scale: [0.15, 0.18, 0.15],
  },
};

/**
 * DERI 3D 人体模型
 */
export const BodyModelDERI = ({
  bodyParts,
  posture = 'supine',
  autoRotate = false,
  onPartHover,
  onPartClick,
  isRunning = false,
}: BodyModelDERIProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<DERIRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化 DERI 渲染器
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const renderer = new DERIRenderer(containerRef.current, DEFAULT_DERI_CONFIG);
      rendererRef.current = renderer;
      setIsLoading(false);
    } catch (err) {
      setError('DERI 渲染器初始化失败');
      setIsLoading(false);
      console.error('DERI initialization error:', err);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  // 更新身体部位
  useEffect(() => {
    if (!rendererRef.current || isLoading) return;

    (Object.keys(bodyParts) as BodyPartType[]).forEach(partId => {
      const part = bodyParts[partId];
      const config = BODY_PARTS_DERI_CONFIG[partId];
      const entityId = `body_part_${partId}`;

      // 检查实体是否已存在
      const existingEntity = rendererRef.current?.getEntity(entityId);

      if (!existingEntity) {
        // 创建新实体
        const entity = createDERIBodyPartEntity(
          partId,
          part.damage,
          config.position,
          config.scale
        );
        rendererRef.current?.addEntity(entity);
      } else {
        // 更新现有实体
        const getDamageColor = (d: number): number => {
          if (d < 10) return 0x22c55e;
          if (d < 30) return 0x84cc16;
          if (d < 50) return 0xeab308;
          if (d < 70) return 0xf97316;
          if (d < 90) return 0xef4444;
          return 0xdc2626;
        };

        const color = getDamageColor(part.damage);
        const emissiveIntensity = part.damage > 30 ? Math.min(part.damage / 100, 0.8) : 0;

        rendererRef.current?.updateEntity(entityId, {
          material: {
            type: 'standard',
            params: {
              color,
              roughness: 0.4,
              metalness: 0.1,
              emissive: part.damage > 30 ? color : 0x000000,
              emissiveIntensity,
              opacity: 1,
            },
          },
        });
      }
    });
  }, [bodyParts, isLoading]);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && rendererRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        rendererRef.current.resize(clientWidth, clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 自动旋转
  useEffect(() => {
    if (!rendererRef.current || !autoRotate) return;

    let angle = 0;
    const radius = 4;
    const speed = 0.005;

    const rotate = () => {
      if (!autoRotate || !rendererRef.current) return;
      angle += speed;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      rendererRef.current.setCameraPosition(x, 1.5, z);
      rendererRef.current.setCameraTarget(0, 0.5, 0);
      requestAnimationFrame(rotate);
    };

    const animationId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animationId);
  }, [autoRotate]);

  return (
    <Box
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#f8fafc',
      }}
    >
      {isLoading && (
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <Loader size="lg" color="blue" />
        </Box>
      )}

      {error && (
        <Paper
          p="md"
          radius="md"
          withBorder
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <Text c="red" size="sm">
            {error}
          </Text>
        </Paper>
      )}

      {/* DERI 渲染器会在容器内创建 canvas */}
    </Box>
  );
};

export default BodyModelDERI;
