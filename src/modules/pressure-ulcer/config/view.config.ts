/**
 * 视图层配置
 * 支持 2D/3D 视图切换
 */

import type { ViewConfig, ViewState, Scene3DConfig } from '../types';

/**
 * 默认视图配置
 */
export const DEFAULT_VIEW_CONFIG: ViewConfig = {
  defaultMode: '2d',
  defaultEngine: 'r3f',
  enable3D: true,
  enableTransition: true,
  transitionDuration: 500,
  threeD: {
    defaultCamera: {
      x: 0,
      y: 1.5,
      z: 4,
      targetX: 0,
      targetY: 0.8,
      targetZ: 0,
    },
    backgroundColor: '#f8fafc',
    showGrid: true,
    showAxes: false,
    lightIntensity: 1.2,
    shadowQuality: 'medium',
    antialias: true,
  },
  twoD: {
    backgroundColor: '#f8fafc',
    showGrid: false,
    zoomRange: { min: 0.5, max: 2 },
    defaultZoom: 1,
  },
};

/**
 * 默认视图状态
 */
export const DEFAULT_VIEW_STATE: ViewState = {
  mode: '2d',
  engine: 'r3f',
  posture: 'supine',
  isTransitioning: false,
  transitionProgress: 0,
  cameraPosition: {
    x: 0,
    y: 1.5,
    z: 4,
    targetX: 0,
    targetY: 0.8,
    targetZ: 0,
  },
  autoRotate: false,
};

/**
 * 3D 场景配置
 */
export const DEFAULT_SCENE_CONFIG: Scene3DConfig = {
  name: 'pressure_ulcer_scene',
  backgroundColor: '#f8fafc',
  ambientLight: {
    color: '#ffffff',
    intensity: 0.6,
  },
  mainLight: {
    color: '#ffffff',
    intensity: 1.2,
    position: [5, 10, 5],
    target: [0, 0, 0],
  },
  fillLight: {
    color: '#e0f2fe',
    intensity: 0.4,
    position: [-5, 5, -5],
    target: [0, 0, 0],
  },
  fog: {
    color: '#f8fafc',
    near: 10,
    far: 50,
  },
  grid: {
    size: 10,
    divisions: 20,
    color: '#e2e8f0',
  },
};

/**
 * 身体部位 3D 配置
 * 定义各部位在 3D 空间中的位置和大小
 * 
 * 坐标系说明（躺卧姿态）：
 * - X轴：左右方向（负为左，正为右）
 * - Y轴：上下方向（负为下，正为上）
 * - Z轴：前后方向（负为头，正为脚）
 * 
 * 注意：这些位置是相对于人体模型局部坐标系的
 * 模型会整体旋转为躺卧姿态
 */
export const BODY_PARTS_3D_CONFIG = {
  // 骶骨 - 位于躯干下部后方
  sacrum: {
    position: [0, 0.3, 0.2] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [0.25, 0.2, 0.15] as [number, number, number],
    geometry: 'capsule',
    color: '#f5d0c5',
  },
  // 左脚跟
  leftHeel: {
    position: [-0.15, 0, -0.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [0.12, 0.1, 0.12] as [number, number, number],
    geometry: 'sphere',
    color: '#f5d0c5',
  },
  // 右脚跟
  rightHeel: {
    position: [0.15, 0, -0.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [0.12, 0.1, 0.12] as [number, number, number],
    geometry: 'sphere',
    color: '#f5d0c5',
  },
  // 左大转子（股骨）
  leftTrochanter: {
    position: [-0.35, 0.35, 0.1] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [0.15, 0.18, 0.15] as [number, number, number],
    geometry: 'capsule',
    color: '#f5d0c5',
  },
  // 右大转子（股骨）
  rightTrochanter: {
    position: [0.35, 0.35, 0.1] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [0.15, 0.18, 0.15] as [number, number, number],
    geometry: 'capsule',
    color: '#f5d0c5',
  },
};

/**
 * 姿态旋转配置
 * 注意：模型默认为站立姿态，需要旋转为躺卧姿态
 */
export const POSTURE_ROTATIONS = {
  supine: { x: -Math.PI / 2, y: 0, z: 0 },      // 仰卧位：绕X轴旋转-90度
  prone: { x: Math.PI / 2, y: 0, z: 0 },        // 俯卧位：绕X轴旋转90度
  lateral_left: { x: 0, y: 0, z: Math.PI / 2 }, // 左侧卧位
  lateral_right: { x: 0, y: 0, z: -Math.PI / 2 }, // 右侧卧位
  sitting: { x: -Math.PI / 4, y: 0, z: 0 },     // 坐位：半躺
};

/**
 * 床垫配置
 */
export const MATTRESS_CONFIG = {
  width: 1.2,
  height: 0.15,
  depth: 2.2,
  position: [0, -0.15, 0] as [number, number, number],
  color: '#e8f4f8',
  borderColor: '#b8d4e3',
  pillowColor: '#f0f7fa',
  pillowPosition: [0, 0.05, -0.85] as [number, number, number],
  pillowSize: [0.5, 0.1, 0.3] as [number, number, number],
};

/**
 * 人体模型配置（用于未来精细模型替换）
 */
export const HUMAN_MODEL_CONFIG = {
  /** 当前使用的模型类型 */
  currentModel: 'primitive' as const,
  /** 可用模型列表 */
  availableModels: {
    primitive: {
      id: 'primitive',
      name: '基础几何体',
      description: '使用基础几何体（胶囊、球体）构建的简化人体模型',
      path: null,
    },
    gltf: {
      id: 'gltf',
      name: 'GLTF模型',
      description: '从GLTF/GLB文件加载的精细人体模型',
      path: '/models/human_body.glb',
    },
  },
  /** 模型缩放 */
  scale: 1.0,
  /** 模型偏移 */
  offset: [0, 0, 0] as [number, number, number],
};

/**
 * 伤害颜色映射
 */
export const DAMAGE_COLOR_MAP = {
  normal: '#22c55e',      // 正常 - 绿色
  mild: '#84cc16',        // 轻度 - 黄绿
  moderate: '#eab308',    // 中度 - 黄色
  high: '#f97316',        // 高风险 - 橙色
  severe: '#ef4444',      // 严重 - 红色
  critical: '#dc2626',    // 危急 - 深红
};

/**
 * 获取伤害颜色
 */
export const getDamageColor3D = (damage: number): string => {
  if (damage < 10) return DAMAGE_COLOR_MAP.normal;
  if (damage < 30) return DAMAGE_COLOR_MAP.mild;
  if (damage < 50) return DAMAGE_COLOR_MAP.moderate;
  if (damage < 70) return DAMAGE_COLOR_MAP.high;
  if (damage < 90) return DAMAGE_COLOR_MAP.severe;
  return DAMAGE_COLOR_MAP.critical;
};

/**
 * 获取伤害发光强度
 */
export const getDamageEmissiveIntensity = (damage: number): number => {
  if (damage < 30) return 0;
  if (damage < 50) return 0.2;
  if (damage < 70) return 0.4;
  if (damage < 90) return 0.6;
  return 0.8;
};

/**
 * 视图模式标签
 */
export const VIEW_MODE_LABELS = {
  '2d': '二维视图',
  '3d': '三维视图',
};

/**
 * 渲染引擎标签
 */
export const RENDER_ENGINE_LABELS = {
  r3f: 'R3F',
  deri: 'DERI',
};

/**
 * 姿态标签
 */
export const POSTURE_LABELS = {
  supine: '仰卧位',
  prone: '俯卧位',
  lateral_left: '左侧卧位',
  lateral_right: '右侧卧位',
  sitting: '坐位',
};
