/**
 * 压疮仿真系统类型定义
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 身体部位类型
 * 5 个压疮最高发部位（仰卧位）
 */
export type BodyPartType =
  | "sacrum"
  | "leftHeel"
  | "rightHeel"
  | "leftTrochanter"
  | "rightTrochanter";

/**
 * 警报级别
 */
export type AlertLevel = "none" | "warning" | "danger";

/**
 * 事件类型
 */
export type PressureUlcerEventType =
  | "warning"
  | "danger"
  | "reposition"
  | "param_change";

// ============================================================================
// 核心数据类型
// ============================================================================

/**
 * 身体部位数据
 */
export interface BodyPart {
  id: BodyPartType;
  name: string;
  nameEn: string;
  x: number;
  y: number;
  radius: number;
  damage: number;
  pressure: number;
}

/**
 * 仿真参数
 */
export interface SimulationParams {
  /** 身高 (cm) */
  height: number;
  /** 体重 (kg) */
  weight: number;
  /** BMI 指数 */
  bmi: number;
  /** 环境温度 (°C) */
  temperature: number;
  /** 环境湿度 (%) */
  humidity: number;
  /** 界面压力 (mmHg) */
  pressure: number;
  /** 时间速度倍率 */
  timeSpeed: number;
}

/**
 * 历史数据点
 */
export interface HistoryPoint {
  time: number;
  riskScore: number;
  damagePercent: number;
  sacrumDamage: number;
}

/**
 * 压疮事件
 */
export interface PressureUlcerEvent {
  id: string;
  timestamp: string;
  simulationTime: number;
  type: PressureUlcerEventType;
  message: string;
  damagePercent: number;
  bodyPart?: BodyPartType;
  paramChanges?: Partial<SimulationParams>;
}

// ============================================================================
// 状态类型
// ============================================================================

/**
 * 仿真状态
 */
export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  elapsedTime: number;
  criticalTime: number;
  riskScore: number;
  damagePercent: number;
  bodyParts: Record<BodyPartType, BodyPart>;
  history: HistoryPoint[];
}

/**
 * 警报状态
 */
export interface AlertState {
  level: AlertLevel;
  message: string;
}

/**
 * 风险因素贡献
 */
export interface RiskFactors {
  bmi: number;
  temperature: number;
  humidity: number;
  pressure: number;
}

// ============================================================================
// 记录与持久化类型
// ============================================================================

/**
 * 仿真记录
 */
export interface SimulationRecord {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  finalDamage: number;
  maxDamage: number;
  finalRiskScore: number;
  params: SimulationParams;
  events: PressureUlcerEvent[];
  history: HistoryPoint[];
  notes?: string;
}

/**
 * 预设场景
 */
export interface PresetScenario {
  name: string;
  description: string;
  params: SimulationParams;
}