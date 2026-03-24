/**
 * 压疮仿真系统配置
 * 基于 NPUAP/EPUAP 国际压疮防治指南
 */

export const SIMULATION_CONFIG = {
  // 临界时间配置（秒）
  CRITICAL_TIME: {
    BASE: 7200,    // 2 小时基础时间
    MIN: 1800,     // 最少 30 分钟
  },

  // 伤害阈值配置（百分比）
  DAMAGE_THRESHOLD: {
    WARNING: 30,
    DANGER: 70,
  },

  // 风险权重配置（总和为 1）
  RISK_WEIGHTS: {
    PRESSURE: 0.4,
    BMI: 0.3,
    TEMPERATURE: 0.15,
    HUMIDITY: 0.15,
  } as const,

  // 风险分数最大值
  RISK_SCORE: {
    MAX: 10,
    MIN: 0,
  },

  // 伤害累积配置
  DAMAGE: {
    BASE_RATE: 0.01,    // 基础速率：每秒 0.01%
    MAX: 100,
    MIN: 0,
  },

  // 历史数据配置
  HISTORY: {
    MAX_POINTS: 360,    // 最多保留 360 个数据点
    SAMPLING_INTERVAL: 10, // 每 10 秒采样一次
  },

  // 本地存储配置
  STORAGE: {
    KEY: 'pressure_ulcer_simulation_records',
    MAX_RECORDS: 50,
  },

  // 时间格式化
  TIME: {
    MS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    SECONDS_PER_HOUR: 3600,
  },
} as const;

/**
 * 身体部位压力乘数配置
 * 基于各部位骨突程度和软组织厚度
 */
export const BODY_PART_PRESSURE_MULTIPLIERS = {
  sacrum: 1.2,           // 骶尾部：最高（主要承重部位）
  leftHeel: 0.8,         // 左足跟
  rightHeel: 0.8,        // 右足跟
  leftTrochanter: 1.0,   // 左股骨大转子
  rightTrochanter: 1.0,  // 右股骨大转子
} as const;

/**
 * 风险等级配置
 */
export const RISK_LEVELS = {
  LOW: { min: 0, max: 2, label: '低风险' },
  MEDIUM: { min: 2, max: 4, label: '中风险' },
  HIGH: { min: 4, max: 6, label: '高风险' },
  VERY_HIGH: { min: 6, max: 8, label: '极高风险' },
  CRITICAL: { min: 8, max: 10, label: '危急' },
} as const;