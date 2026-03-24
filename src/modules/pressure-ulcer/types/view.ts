/**
 * 视图层抽象接口定义
 * 支持 2D/3D 视图切换和扩展
 */

import type { BodyPart, BodyPartType } from './index';

// ============================================================================
// 视图模式类型
// ============================================================================

/**
 * 视图模式
 */
export type ViewMode = '2d' | '3d';

/**
 * 3D 渲染引擎类型
 */
export type RenderEngine = 'r3f' | 'deri';

/**
 * 人体模型姿态
 */
export type BodyPosture = 'supine' | 'prone' | 'lateral_left' | 'lateral_right' | 'sitting';

// ============================================================================
// 视图状态接口
// ============================================================================

/**
 * 视图状态
 */
export interface ViewState {
  /** 当前视图模式 */
  mode: ViewMode;
  /** 3D 渲染引擎 */
  engine: RenderEngine;
  /** 当前姿态 */
  posture: BodyPosture;
  /** 是否正在切换 */
  isTransitioning: boolean;
  /** 切换进度 0-1 */
  transitionProgress: number;
  /** 相机位置 (3D模式) */
  cameraPosition?: CameraPosition;
  /** 是否自动旋转 (3D模式) */
  autoRotate: boolean;
}

/**
 * 相机位置
 */
export interface CameraPosition {
  x: number;
  y: number;
  z: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
}

// ============================================================================
// 视图配置接口
// ============================================================================

/**
 * 视图配置
 */
export interface ViewConfig {
  /** 默认视图模式 */
  defaultMode: ViewMode;
  /** 默认渲染引擎 */
  defaultEngine: RenderEngine;
  /** 是否启用 3D */
  enable3D: boolean;
  /** 是否启用切换动画 */
  enableTransition: boolean;
  /** 切换动画时长 (ms) */
  transitionDuration: number;
  /** 3D 配置 */
  threeD: ThreeDConfig;
  /** 2D 配置 */
  twoD: TwoDConfig;
}

/**
 * 3D 配置
 */
export interface ThreeDConfig {
  /** 默认相机位置 */
  defaultCamera: CameraPosition;
  /** 背景颜色 */
  backgroundColor: string;
  /** 是否显示网格 */
  showGrid: boolean;
  /** 是否显示坐标轴 */
  showAxes: boolean;
  /** 光照强度 */
  lightIntensity: number;
  /** 阴影质量 */
  shadowQuality: 'low' | 'medium' | 'high';
  /** 抗锯齿 */
  antialias: boolean;
}

/**
 * 2D 配置
 */
export interface TwoDConfig {
  /** 背景颜色 */
  backgroundColor: string;
  /** 是否显示网格 */
  showGrid: boolean;
  /** 缩放范围 */
  zoomRange: { min: number; max: number };
  /** 默认缩放 */
  defaultZoom: number;
}

// ============================================================================
// 视图组件接口
// ============================================================================

/**
 * 人体模型视图属性
 */
export interface BodyModelViewProps {
  /** 身体部位数据 */
  bodyParts: Record<BodyPartType, BodyPart>;
  /** 当前视图模式 */
  mode: ViewMode;
  /** 3D 渲染引擎 */
  engine?: RenderEngine;
  /** 当前姿态 */
  posture?: BodyPosture;
  /** 是否运行中 */
  isRunning?: boolean;
  /** 是否已结束 */
  isFinished?: boolean;
  /** 翻身回调 */
  onReposition?: () => void;
  /** 部位悬停回调 */
  onPartHover?: (part: BodyPartType | null) => void;
  /** 部位点击回调 */
  onPartClick?: (part: BodyPartType) => void;
  /** 视图模式切换回调 */
  onModeChange?: (mode: ViewMode) => void;
  /** 相机位置变化回调 (3D) */
  onCameraChange?: (position: CameraPosition) => void;
}

/**
 * 视图切换器属性
 */
export interface ViewSwitcherProps {
  /** 当前模式 */
  currentMode: ViewMode;
  /** 当前引擎 (3D模式) */
  currentEngine?: RenderEngine;
  /** 是否禁用 */
  disabled?: boolean;
  /** 模式切换回调 */
  onModeChange: (mode: ViewMode) => void;
  /** 引擎切换回调 */
  onEngineChange?: (engine: RenderEngine) => void;
}

// ============================================================================
// 3D 实体接口
// ============================================================================

/**
 * 3D 实体基础接口
 */
export interface Entity3D {
  /** 唯一标识 */
  id: string;
  /** 位置 */
  position: [number, number, number];
  /** 旋转 */
  rotation: [number, number, number];
  /** 缩放 */
  scale: [number, number, number];
  /** 是否可见 */
  visible: boolean;
  /** 透明度 */
  opacity: number;
}

/**
 * 身体部位 3D 实体
 */
export interface BodyPartEntity3D extends Entity3D {
  /** 部位类型 */
  partType: BodyPartType;
  /** 部位名称 */
  name: string;
  /** 伤害值 0-100 */
  damage: number;
  /** 压力值 */
  pressure: number;
  /** 高亮颜色 */
  highlightColor?: string;
  /** 是否高亮 */
  isHighlighted: boolean;
  /** 脉冲动画 */
  pulseAnimation?: boolean;
  /** 几何体类型 */
  geometry?: 'sphere' | 'capsule' | 'box';
}

/**
 * 人体模型 3D 实体
 */
export interface HumanBodyEntity3D extends Entity3D {
  /** 部位实体集合 */
  parts: Record<BodyPartType, BodyPartEntity3D>;
  /** 姿态 */
  posture: BodyPosture;
  /** 皮肤材质 */
  skinMaterial: Material3D;
  /** 骨骼可见性 */
  skeletonVisible: boolean;
  /** 肌肉可见性 */
  muscleVisible: boolean;
  /** 血管可见性 */
  vascularVisible: boolean;
}

/**
 * 3D 材质
 */
export interface Material3D {
  /** 颜色 */
  color: string;
  /** 粗糙度 */
  roughness: number;
  /** 金属度 */
  metalness: number;
  /** 透明度 */
  opacity: number;
  /** 自发光 */
  emissive?: string;
  /** 自发光强度 */
  emissiveIntensity?: number;
}

// ============================================================================
// 场景接口
// ============================================================================

/**
 * 3D 场景配置
 */
export interface Scene3DConfig {
  /** 场景名称 */
  name: string;
  /** 背景颜色 */
  backgroundColor: string;
  /** 环境光 */
  ambientLight: LightConfig;
  /** 主光源 */
  mainLight: LightConfig;
  /** 辅助光源 */
  fillLight?: LightConfig;
  /** 雾效 */
  fog?: FogConfig;
  /** 网格 */
  grid?: GridConfig;
}

/**
 * 光源配置
 */
export interface LightConfig {
  /** 颜色 */
  color: string;
  /** 强度 */
  intensity: number;
  /** 位置 */
  position?: [number, number, number];
  /** 目标 */
  target?: [number, number, number];
}

/**
 * 雾效配置
 */
export interface FogConfig {
  /** 颜色 */
  color: string;
  /** 起始距离 */
  near: number;
  /** 结束距离 */
  far: number;
}

/**
 * 网格配置
 */
export interface GridConfig {
  /** 大小 */
  size: number;
  /** 分割数 */
  divisions: number;
  /** 颜色 */
  color: string;
}

// ============================================================================
// DERI 接口 (Digital Entity Rendering Interface)
// ============================================================================

/**
 * DERI 渲染配置
 */
export interface DERIConfig {
  /** 渲染质量 */
  quality: 'low' | 'medium' | 'high' | 'ultra';
  /** 纹理分辨率 */
  textureResolution: number;
  /** 阴影映射大小 */
  shadowMapSize: number;
  /** 后期处理 */
  postProcessing: PostProcessingConfig;
}

/**
 * 后期处理配置
 */
export interface PostProcessingConfig {
  /** 泛光 */
  bloom: boolean;
  /** 环境光遮蔽 */
  ao: boolean;
  /** 色调映射 */
  toneMapping: boolean;
  /** 抗锯齿 */
  antialias: boolean;
}

/**
 * DERI 实体
 */
export interface DERIEntity {
  /** 实体 ID */
  id: string;
  /** 几何体数据 */
  geometry: GeometryData;
  /** 材质数据 */
  material: MaterialData;
  /** 变换矩阵 */
  transform: TransformMatrix;
  /** 动画数据 */
  animation?: AnimationData;
  /** 是否可见 */
  visible?: boolean;
}

/**
 * 几何体数据
 */
export interface GeometryData {
  /** 顶点 */
  vertices: Float32Array;
  /** 法线 */
  normals: Float32Array;
  /** UV */
  uvs: Float32Array;
  /** 索引 */
  indices: Uint16Array;
}

/**
 * 材质数据
 */
export interface MaterialData {
  /** 类型 */
  type: 'standard' | 'physical' | 'toon' | 'custom';
  /** 颜色纹理 */
  colorMap?: string;
  /** 法线纹理 */
  normalMap?: string;
  /** 粗糙度纹理 */
  roughnessMap?: string;
  /** 参数 */
  params: Record<string, number>;
}

/**
 * 变换矩阵
 */
export interface TransformMatrix {
  /** 位置 */
  position: [number, number, number];
  /** 旋转 (四元数) */
  rotation: [number, number, number, number];
  /** 缩放 */
  scale: [number, number, number];
}

/**
 * 动画数据
 */
export interface AnimationData {
  /** 动画名称 */
  name: string;
  /** 时长 (秒) */
  duration: number;
  /** 关键帧 */
  keyframes: Keyframe[];
  /** 是否循环 */
  loop: boolean;
}

/**
 * 关键帧
 */
export interface Keyframe {
  /** 时间 */
  time: number;
  /** 位置 */
  position?: [number, number, number];
  /** 旋转 */
  rotation?: [number, number, number, number];
  /** 缩放 */
  scale?: [number, number, number];
  /** 插值类型 */
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}
