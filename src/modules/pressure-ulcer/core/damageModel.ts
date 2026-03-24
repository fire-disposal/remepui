/**
 * 伤害累积模型
 * 计算压疮伤害的累积过程
 */

import { SIMULATION_CONFIG, BODY_PART_PRESSURE_MULTIPLIERS } from '../config/simulation.config';
import type { BodyPart, BodyPartType } from '../types';

/**
 * 计算伤害累积速率
 * @param riskScore - 风险系数 (0-10)
 * @param pressure - 界面压力 (mmHg)
 * @param elapsedTime - 已累积时间 (秒)
 * @param criticalTime - 临界时间 (秒)
 */
export const calculateDamageRate = (
  riskScore: number,
  pressure: number,
  elapsedTime: number,
  criticalTime: number
): number => {
  const { DAMAGE } = SIMULATION_CONFIG;
  const riskFactor = 1 + (riskScore / 10);
  const pressureFactor = Math.max(1, pressure / 32);
  const timeFactor = Math.max(1, elapsedTime / criticalTime);

  return DAMAGE.BASE_RATE * riskFactor * pressureFactor * timeFactor;
};

/**
 * 计算可逆转临界时间 (秒)
 * @param riskScore - 风险系数 (0-10)
 * @param pressure - 界面压力 (mmHg)
 */
export const calculateCriticalTime = (
  riskScore: number,
  pressure: number
): number => {
  const { CRITICAL_TIME } = SIMULATION_CONFIG;
  const baseTime = CRITICAL_TIME.BASE;

  // 风险系数调整
  let riskMultiplier = 1.0;
  if (riskScore <= 2) riskMultiplier = 1.5;
  else if (riskScore <= 4) riskMultiplier = 1.25;
  else if (riskScore <= 6) riskMultiplier = 1.0;
  else if (riskScore <= 8) riskMultiplier = 0.75;
  else riskMultiplier = 0.5;

  // 压力额外调整
  let pressureReduction = 0;
  if (pressure > 32) {
    pressureReduction = Math.floor((pressure - 32) / 10) * 0.05;
  }

  const adjustedTime = baseTime * riskMultiplier * (1 - pressureReduction);
  return Math.max(CRITICAL_TIME.MIN, adjustedTime);
};

/**
 * 获取身体部位的压力乘数
 */
export const getBodyPartPressureMultiplier = (partId: BodyPartType): number => {
  return BODY_PART_PRESSURE_MULTIPLIERS[partId] ?? 1.0;
};

/**
 * 更新身体部位伤害值
 * @param bodyParts - 当前身体部位状态
 * @param damageIncrement - 伤害增量
 * @param basePressure - 基础压力值
 */
export const updateBodyParts = (
  bodyParts: Record<BodyPartType, BodyPart>,
  damageIncrement: number,
  basePressure: number
): Record<BodyPartType, BodyPart> => {
  const updated: Record<BodyPartType, BodyPart> = {} as Record<BodyPartType, BodyPart>;

  (Object.keys(bodyParts) as BodyPartType[]).forEach(partId => {
    const part = bodyParts[partId];
    const pressureMultiplier = getBodyPartPressureMultiplier(partId);
    const localDamage = damageIncrement * pressureMultiplier;
    const newDamage = clamp(
      part.damage + localDamage,
      SIMULATION_CONFIG.DAMAGE.MIN,
      SIMULATION_CONFIG.DAMAGE.MAX
    );

    updated[partId] = {
      ...part,
      damage: newDamage,
      pressure: basePressure * pressureMultiplier,
    };
  });

  return updated;
};

/**
 * 创建初始身体部位状态
 */
export const createInitialBodyParts = (): Record<BodyPartType, BodyPart> => {
  return {
    sacrum: {
      id: 'sacrum',
      name: '骶尾部',
      nameEn: 'Sacrum',
      x: 50,
      y: 35,
      radius: 25,
      damage: 0,
      pressure: 32,
    },
    leftHeel: {
      id: 'leftHeel',
      name: '左足跟',
      nameEn: 'Left Heel',
      x: 35,
      y: 92,
      radius: 12,
      damage: 0,
      pressure: 28,
    },
    rightHeel: {
      id: 'rightHeel',
      name: '右足跟',
      nameEn: 'Right Heel',
      x: 65,
      y: 92,
      radius: 12,
      damage: 0,
      pressure: 28,
    },
    leftTrochanter: {
      id: 'leftTrochanter',
      name: '左股骨大转子',
      nameEn: 'Left Trochanter',
      x: 38,
      y: 55,
      radius: 15,
      damage: 0,
      pressure: 30,
    },
    rightTrochanter: {
      id: 'rightTrochanter',
      name: '右股骨大转子',
      nameEn: 'Right Trochanter',
      x: 62,
      y: 55,
      radius: 15,
      damage: 0,
      pressure: 30,
    },
  };
};

/**
 * 辅助函数：限制数值范围
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};