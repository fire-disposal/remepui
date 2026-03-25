/**
 * 增强版人体模型组件
 * 支持 2D/3D 双模式切换
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Text,
} from '@mantine/core';
import { BodyModel } from './BodyModel';
import { BodyModel3D } from './BodyModel3D';
import { ViewSwitcher } from './ViewSwitcher';
import { DEFAULT_VIEW_STATE } from '../config/view.config';
import type {
  BodyPart,
  BodyPartType,
  ViewMode,
  RenderEngine,
  BodyPosture,
  ViewState,
} from '../types';

interface BodyModelEnhancedProps {
  bodyParts: Record<BodyPartType, BodyPart>;
  onReposition?: () => void;
  onPartHover?: (part: BodyPartType | null) => void;
  onPartClick?: (part: BodyPartType) => void;
  isRunning?: boolean;
  isFinished?: boolean;
  defaultMode?: ViewMode;
  enable3D?: boolean;
  posture?: BodyPosture;
}

/**
 * 增强版人体模型
 * 支持 2D/3D 视图切换
 */
export const BodyModelEnhanced = ({
  bodyParts,
  onReposition,
  onPartHover,
  onPartClick,
  isRunning = false,
  isFinished = false,
  defaultMode = '2d',
  enable3D = true,
  posture,
}: BodyModelEnhancedProps) => {
  // 视图状态
  const [viewState, setViewState] = useState<ViewState>({
    ...DEFAULT_VIEW_STATE,
    mode: defaultMode,
  });
  const [hasMounted3D, setHasMounted3D] = useState(defaultMode === '3d');
  const effectivePosture = posture ?? viewState.posture;

  // 切换视图模式
  const handleModeChange = useCallback((mode: ViewMode) => {
    if (mode === viewState.mode) return;
    if (mode === '3d') {
      setHasMounted3D(true);
    }
    setViewState(prev => ({
      ...prev,
      mode,
      isTransitioning: false,
      transitionProgress: 1,
    }));
  }, [viewState.mode]);

  // 切换渲染引擎
  const handleEngineChange = useCallback((engine: RenderEngine) => {
    setViewState(prev => ({ ...prev, engine }));
  }, []);

  // 切换姿态
  const handlePostureChange = useCallback((posture: BodyPosture) => {
    setViewState(prev => ({ ...prev, posture }));
  }, []);

  // 切换自动旋转
  const handleAutoRotateChange = useCallback((autoRotate: boolean) => {
    setViewState(prev => ({ ...prev, autoRotate }));
  }, []);

  // 重置相机
  const handleResetCamera = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      cameraPosition: DEFAULT_VIEW_STATE.cameraPosition,
    }));
  }, []);

  // 处理部位悬停
  const handlePartHover = useCallback((part: BodyPartType | null) => {
    onPartHover?.(part);
  }, [onPartHover]);

  // 处理部位点击
  const handlePartClick = useCallback((part: BodyPartType) => {
    onPartClick?.(part);
  }, [onPartClick]);

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 视图切换器 - 右上角 */}
      {enable3D && (
        <Box
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 100,
          }}
        >
          <ViewSwitcher
            currentMode={viewState.mode}
            currentEngine={viewState.engine}
            currentPosture={effectivePosture}
            autoRotate={viewState.autoRotate}
            onModeChange={handleModeChange}
            onEngineChange={handleEngineChange}
            onPostureChange={handlePostureChange}
            onAutoRotateChange={handleAutoRotateChange}
            onResetCamera={handleResetCamera}
          />
        </Box>
      )}

      {/* 视图内容（2D/3D 保活切换，避免反复卸载导致的大刷新） */}
      <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            opacity: viewState.mode === '2d' ? 1 : 0,
            pointerEvents: viewState.mode === '2d' ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
          <BodyModel
            bodyParts={bodyParts}
            onReposition={onReposition}
            isRunning={isRunning}
            isFinished={isFinished}
          />
        </Box>

        {hasMounted3D && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              opacity: viewState.mode === '3d' ? 1 : 0,
              pointerEvents: viewState.mode === '3d' ? 'auto' : 'none',
              transition: 'opacity 0.2s ease',
            }}
          >
            <BodyModel3D
              bodyParts={bodyParts}
              posture={effectivePosture}
              autoRotate={viewState.autoRotate}
              onPartHover={handlePartHover}
              onPartClick={handlePartClick}
              isRunning={isRunning}
            />
          </Box>
        )}
      </Box>

      {/* 模式指示器 */}
      <Box
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 100,
        }}
      >
        <Paper px="xs" py={4} radius="sm" withBorder>
          <Text size="xs" c="dimmed">
            {viewState.mode === '2d' ? '二维视图' : `三维视图 (${viewState.engine.toUpperCase()})`}
          </Text>
        </Paper>
      </Box>
    </Box>
  );
};

export default BodyModelEnhanced;
