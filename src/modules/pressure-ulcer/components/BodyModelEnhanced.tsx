/**
 * 增强版人体模型组件
 * 支持 2D/3D 双模式切换
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Text,
  Group,
  Transition,
  Loader,
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
}: BodyModelEnhancedProps) => {
  // 视图状态
  const [viewState, setViewState] = useState<ViewState>({
    ...DEFAULT_VIEW_STATE,
    mode: defaultMode,
  });

  const [isLoading, setIsLoading] = useState(false);

  // 切换视图模式
  const handleModeChange = useCallback((mode: ViewMode) => {
    if (mode === viewState.mode) return;

    setIsLoading(true);
    setViewState(prev => ({
      ...prev,
      isTransitioning: true,
      transitionProgress: 0,
    }));

    // 模拟切换动画
    setTimeout(() => {
      setViewState(prev => ({
        ...prev,
        mode,
        isTransitioning: false,
        transitionProgress: 1,
      }));
      setIsLoading(false);
    }, 300);
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
            currentPosture={viewState.posture}
            autoRotate={viewState.autoRotate}
            onModeChange={handleModeChange}
            onEngineChange={handleEngineChange}
            onPostureChange={handlePostureChange}
            onAutoRotateChange={handleAutoRotateChange}
            onResetCamera={handleResetCamera}
          />
        </Box>
      )}

      {/* 加载指示器 */}
      <Transition mounted={isLoading} transition="fade" duration={200}>
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
            }}
          >
            <Loader size="lg" color="blue" />
          </Box>
        )}
      </Transition>

      {/* 视图内容 */}
      <Box
        style={{
          width: '100%',
          height: '100%',
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {viewState.mode === '2d' ? (
          <BodyModel
            bodyParts={bodyParts}
            onReposition={onReposition}
            isRunning={isRunning}
            isFinished={isFinished}
          />
        ) : (
          <BodyModel3D
            bodyParts={bodyParts}
            posture={viewState.posture}
            autoRotate={viewState.autoRotate}
            onPartHover={handlePartHover}
            onPartClick={handlePartClick}
            isRunning={isRunning}
          />
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
