/**
 * 增强版人体模型组件
 * 支持 2D/3D 双模式切换
 * 优化：预加载 3D 场景，避免切换时的大刷新
 */

import { useState, useCallback, memo, useMemo } from 'react';
import {
  Box,
  Paper,
  Text,
  LoadingOverlay,
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
 * 
 * 性能优化策略：
 * 1. 预加载 3D 场景：enable3D 时立即挂载 3D 组件（隐藏），避免切换时的首次挂载延迟
 * 2. CSS opacity 切换：使用 CSS 控制显隐，避免组件卸载/挂载
 * 3. memo 优化：防止不必要的重渲染
 */
export const BodyModelEnhanced = memo(({
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
  const [viewState, setViewState] = useState<ViewState>({
    ...DEFAULT_VIEW_STATE,
    mode: defaultMode,
  });
  const [is3DReady, setIs3DReady] = useState(false);
  const effectivePosture = posture ?? viewState.posture;
  
  const handleModeChange = useCallback((mode: ViewMode) => {
    if (mode === viewState.mode) return;
    setViewState(prev => ({
      ...prev,
      mode,
      isTransitioning: false,
      transitionProgress: 1,
    }));
  }, [viewState.mode]);

  const handleEngineChange = useCallback((engine: RenderEngine) => {
    setViewState(prev => ({ ...prev, engine }));
  }, []);

  const handlePostureChange = useCallback((posture: BodyPosture) => {
    setViewState(prev => ({ ...prev, posture }));
  }, []);

  const handleAutoRotateChange = useCallback((autoRotate: boolean) => {
    setViewState(prev => ({ ...prev, autoRotate }));
  }, []);

  const handleResetCamera = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      cameraPosition: DEFAULT_VIEW_STATE.cameraPosition,
    }));
  }, []);

  const handlePartHover = useCallback((part: BodyPartType | null) => {
    onPartHover?.(part);
  }, [onPartHover]);

  const handlePartClick = useCallback((part: BodyPartType) => {
    onPartClick?.(part);
  }, [onPartClick]);

  const handle3DReady = useCallback(() => {
    setIs3DReady(true);
  }, []);

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
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

        {enable3D && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              opacity: viewState.mode === '3d' && is3DReady ? 1 : 0,
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
              onReady={handle3DReady}
            />
            {!is3DReady && (
              <LoadingOverlay
                visible={true}
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'blue', type: 'bars' }}
              />
            )}
          </Box>
        )}
      </Box>

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
});

BodyModelEnhanced.displayName = 'BodyModelEnhanced';

export default BodyModelEnhanced;
