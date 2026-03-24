/**
 * 视图切换器组件
 * 支持 2D/3D 视图切换
 */

import { useState } from 'react';
import {
  Box,
  Group,
  Button,
  Tooltip,
  SegmentedControl,
  ActionIcon,
  Transition,
  Paper,
} from '@mantine/core';
import {
  IconView360,
  IconView360Off,
  IconCube,
  IconCube3dSphere,
  IconRefresh,
  IconRotate,
  IconCamera,
} from '@tabler/icons-react';
import type { ViewMode, RenderEngine, BodyPosture } from '../types';
import { VIEW_MODE_LABELS, RENDER_ENGINE_LABELS, POSTURE_LABELS } from '../config/view.config';

interface ViewSwitcherProps {
  currentMode: ViewMode;
  currentEngine?: RenderEngine;
  currentPosture?: BodyPosture;
  autoRotate?: boolean;
  disabled?: boolean;
  onModeChange: (mode: ViewMode) => void;
  onEngineChange?: (engine: RenderEngine) => void;
  onPostureChange?: (posture: BodyPosture) => void;
  onAutoRotateChange?: (autoRotate: boolean) => void;
  onResetCamera?: () => void;
}

/**
 * 视图切换器
 */
export const ViewSwitcher = ({
  currentMode,
  currentEngine = 'r3f',
  currentPosture = 'supine',
  autoRotate = false,
  disabled = false,
  onModeChange,
  onEngineChange,
  onPostureChange,
  onAutoRotateChange,
  onResetCamera,
}: ViewSwitcherProps) => {
  const [showEngineOptions, setShowEngineOptions] = useState(false);

  return (
    <Paper p="xs" radius="md" withBorder style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <Group gap="xs" wrap="nowrap">
        {/* 2D/3D 切换 */}
        <SegmentedControl
          value={currentMode}
          onChange={(value) => onModeChange(value as ViewMode)}
          disabled={disabled}
          size="xs"
          data={[
            {
              value: '2d',
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconView360Off size={14} />
                  <span>2D</span>
                </Group>
              ),
            },
            {
              value: '3d',
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconView360 size={14} />
                  <span>3D</span>
                </Group>
              ),
            },
          ]}
        />

        {/* 3D 模式下的额外选项 */}
        {currentMode === '3d' && (
          <Transition mounted={true} transition="fade" duration={200}>
            {(styles) => (
              <Group gap="xs" wrap="nowrap" style={styles}>
                {/* 渲染引擎切换 */}
                {onEngineChange && (
                  <Tooltip label="切换渲染引擎">
                    <ActionIcon
                      variant="light"
                      size="sm"
                      color={currentEngine === 'r3f' ? 'blue' : 'violet'}
                      onClick={() => onEngineChange(currentEngine === 'r3f' ? 'deri' : 'r3f')}
                      disabled={disabled}
                    >
                      {currentEngine === 'r3f' ? <IconCube size={16} /> : <IconCube3dSphere size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}

                {/* 自动旋转 */}
                {onAutoRotateChange && (
                  <Tooltip label={autoRotate ? '停止旋转' : '自动旋转'}>
                    <ActionIcon
                      variant={autoRotate ? 'filled' : 'light'}
                      size="sm"
                      color="blue"
                      onClick={() => onAutoRotateChange(!autoRotate)}
                      disabled={disabled}
                    >
                      <IconRotate size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}

                {/* 重置相机 */}
                {onResetCamera && (
                  <Tooltip label="重置视角">
                    <ActionIcon
                      variant="light"
                      size="sm"
                      color="gray"
                      onClick={onResetCamera}
                      disabled={disabled}
                    >
                      <IconCamera size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            )}
          </Transition>
        )}
      </Group>
    </Paper>
  );
};

export default ViewSwitcher;
