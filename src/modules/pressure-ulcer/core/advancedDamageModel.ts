/**
 * 高级伤害累积模型
 * 使用非线性动力学模型模拟压疮形成过程
 * 基于组织缺血-再灌注损伤理论
 */

import { SIMULATION_CONFIG, BODY_PART_PRESSURE_MULTIPLIERS } from '../config/simulation.config';
import type { BodyPart, BodyPartType } from '../types';

/**
 * 伤害累积状态
 */
export interface DamageState {
  /** 当前伤害值 (0-100) */
  damage: number;
  /** 累积缺血时间 (秒) */
  ischemiaTime: number;
  /** 再灌注次数 */
  reperfusionCount: number;
  /** 组织弹性系数 (0-1) */
  tissueResilience: number;
  /** 炎症因子水平 (0-10) */
  inflammationLevel: number;
}

/**
 * 计算非线性伤害累积速率
 * 使用指数增长模型模拟组织损伤的级联反应
 * 
 * 公式: dD/dt = k * (1 + α*P) * (1 + β*R) * e^(γ*D)
 * 
 * @param riskScore - 风险系数 (0-10)
 * @param pressure - 界面压力 (mmHg)
 * @param elapsedTime - 已累积时间 (秒)
 * @param criticalTime - 临界时间 (秒)
 * @param currentDamage - 当前伤害值 (0-100)
 * @param ischemiaTime - 缺血时间 (秒)
 */
export const calculateAdvancedDamageRate = (
  riskScore: number,
  pressure: number,
  elapsedTime: number,
  criticalTime: number,
  currentDamage: number,
  ischemiaTime: number
): number => {
  const { DAMAGE } = SIMULATION_CONFIG;
  
  // 基础速率
  const baseRate = DAMAGE.BASE_RATE;
  
  // 压力因子 (非线性，超过32mmHg后急剧上升)
  const pressureFactor = pressure <= 32 
    ? 1 
    : Math.pow(1.05, pressure - 32);
  
  // 风险因子
  const riskFactor = 1 + (riskScore / 10) * 2;
  
  // 时间因子 (超过临界时间后加速)
  const timeFactor = elapsedTime > criticalTime 
    ? 1 + Math.log10(1 + (elapsedTime - criticalTime) / 600)
    : 1;
  
  // 伤害级联因子 (当前伤害越高，新伤害累积越快)
  const cascadeFactor = Math.exp(currentDamage / 200);
  
  // 缺血损伤因子
  const ischemiaFactor = 1 + (ischemiaTime / criticalTime) * 0.5;
  
  return baseRate * pressureFactor * riskFactor * timeFactor * cascadeFactor * ischemiaFactor;
};

/**
 * 计算伤害恢复速率（翻身后的恢复）
 * 基于组织再灌注和修复理论
 * 
 * @param currentDamage - 当前伤害值
 * @param reperfusionTime - 再灌注时间（翻身后的时间）
 * @param tissueResilience - 组织弹性系数
 */
export const calculateRecoveryRate = (
  currentDamage: number,
  reperfusionTime: number,
  tissueResilience: number
): number => {
  if (currentDamage <= 0) return 0;
  
  // 早期恢复快，后期慢
  const recoveryPhase = Math.exp(-reperfusionTime / 300);
  
  // 可逆伤害阈值
  const reversibleThreshold = 30;
  
  if (currentDamage <= reversibleThreshold) {
    // 完全可逆
    return currentDamage * 0.02 * tissueResilience * (1 + recoveryPhase);
  } else {
    // 部分可逆，只能恢复到阈值
    const excessDamage = currentDamage - reversibleThreshold;
    return excessDamage * 0.005 * tissueResilience;
  }
};

/**
 * 计算动态临界时间
 * 考虑累积损伤对组织耐受性的影响
 * 
 * @param riskScore - 风险系数
 * @param pressure - 界面压力
 * @param cumulativeDamage - 累积伤害
 * @param reperfusionCount - 再灌注次数（翻身次数）
 */
export const calculateDynamicCriticalTime = (
  riskScore: number,
  pressure: number,
  cumulativeDamage: number,
  reperfusionCount: number
): number => {
  const { CRITICAL_TIME } = SIMULATION_CONFIG;
  const baseTime = CRITICAL_TIME.BASE;
  
  // 风险调整
  let riskMultiplier = 1.0;
  if (riskScore <= 2) riskMultiplier = 1.5;
  else if (riskScore <= 4) riskMultiplier = 1.25;
  else if (riskScore <= 6) riskMultiplier = 1.0;
  else if (riskScore <= 8) riskMultiplier = 0.75;
  else riskMultiplier = 0.5;
  
  // 压力调整
  const pressureFactor = pressure > 32 
    ? Math.max(0.3, 1 - (pressure - 32) / 100)
    : 1;
  
  // 累积损伤降低耐受性
  const damageFactor = Math.max(0.3, 1 - cumulativeDamage / 200);
  
  // 反复缺血-再灌注降低耐受性
  const reperfusionPenalty = Math.max(0.7, 1 - reperfusionCount * 0.05);
  
  const adjustedTime = baseTime * riskMultiplier * pressureFactor * damageFactor * reperfusionPenalty;
  return Math.max(CRITICAL_TIME.MIN, adjustedTime);
};

/**
 * 计算组织弹性系数
 * 基于患者特征
 */
export const calculateTissueResilience = (
  bmi: number,
  age: number = 50,
  nutritionStatus: 'good' | 'fair' | 'poor' = 'good'
): number => {
  let resilience = 1.0;
  
  // BMI影响
  if (bmi < 18.5) resilience *= 0.7;
  else if (bmi < 25) resilience *= 1.0;
  else if (bmi < 30) resilience *= 0.85;
  else resilience *= 0.75;
  
  // 年龄影响
  if (age > 65) resilience *= 0.8;
  else if (age > 80) resilience *= 0.6;
  
  // 营养状态
  const nutritionFactor = { good: 1.0, fair: 0.8, poor: 0.6 };
  resilience *= nutritionFactor[nutritionStatus];
  
  return Math.max(0.3, Math.min(1.0, resilience));
};

/**
 * 更新身体部位伤害值（高级模型）
 */
export const updateBodyPartsAdvanced = (
  bodyParts: Record<BodyPartType, BodyPart>,
  damageIncrement: number,
  basePressure: number,
  isRepositioning: boolean,
  timeSinceReposition: number
): Record<BodyPartType, BodyPart> => {
  const updated: Record<BodyPartType, BodyPart> = {} as Record<BodyPartType, BodyPart>;

  (Object.keys(bodyParts) as BodyPartType[]).forEach(partId => {
    const part = bodyParts[partId];
    const pressureMultiplier = getBodyPartPressureMultiplier(partId);
    
    let newDamage = part.damage;
    
    if (isRepositioning) {
      // 翻身后的恢复期
      const recovery = calculateRecoveryRate(
        part.damage,
        timeSinceReposition,
        0.8 // 默认组织弹性
      );
      newDamage = Math.max(0, part.damage - recovery);
    } else {
      // 正常压力下的伤害累积
      const localDamage = damageIncrement * pressureMultiplier;
      newDamage = clamp(
        part.damage + localDamage,
        SIMULATION_CONFIG.DAMAGE.MIN,
        SIMULATION_CONFIG.DAMAGE.MAX
      );
    }

    updated[partId] = {
      ...part,
      damage: newDamage,
      pressure: isRepositioning ? 0 : basePressure * pressureMultiplier,
    };
  });

  return updated;
};

/**
 * 获取身体部位的压力乘数
 */
export const getBodyPartPressureMultiplier = (partId: BodyPartType): number => {
  return BODY_PART_PRESSURE_MULTIPLIERS[partId] ?? 1.0;
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
 * 预测压疮形成时间
 * @returns 预计形成压疮的时间（秒），null表示不会形成
 */
export const predictPressureUlcerTime = (
  riskScore: number,
  pressure: number,
  targetDamage: number = 70
): number | null => {
  if (pressure <= 32 && riskScore < 3) return null;
  
  let damage = 0;
  let time = 0;
  const dt = 60; // 1分钟步长
  
  while (damage < targetDamage && time < 86400) { // 最大24小时
    const criticalTime = calculateDynamicCriticalTime(riskScore, pressure, damage, 0);
    const rate = calculateAdvancedDamageRate(riskScore, pressure, time, criticalTime, damage, time);
    damage += rate * dt;
    time += dt;
  }
  
  return damage >= targetDamage ? time : null;
};

/**
 * 辅助函数：限制数值范围
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

/**
 * 计算翻身建议时间
 * 基于当前状态给出最佳翻身间隔
 */
export const calculateRepositionInterval = (
  riskScore: number,
  pressure: number,
  currentDamage: number
): number => {
  const criticalTime = calculateDynamicCriticalTime(riskScore, pressure, currentDamage, 0);
  
  // 建议在当前伤害的30%时翻身
  const safetyFactor = 0.3;
  const recommendedInterval = criticalTime * safetyFactor;
  
  // 根据风险调整
  if (riskScore > 7) return Math.max(1800, recommendedInterval * 0.7);
  if (riskScore > 5) return Math.max(3600, recommendedInterval * 0.85);
  return Math.max(5400, recommendedInterval);
};

/**
 * 生成伤害趋势预测
 * 用于可视化预测曲线
 */
export const generateDamagePrediction = (
  riskScore: number,
  pressure: number,
  currentDamage: number,
  duration: number = 7200,
  interval: number = 300
): Array<{ time: number; damage: number }> => {
  const predictions: Array<{ time: number; damage: number }> = [];
  let damage = currentDamage;
  
  for (let t = 0; t <= duration; t += interval) {
    const criticalTime = calculateDynamicCriticalTime(riskScore, pressure, damage, 0);
    const rate = calculateAdvancedDamageRate(riskScore, pressure, t, criticalTime, damage, t);
    damage = Math.min(100, damage + rate * interval);
    predictions.push({ time: t, damage });
  }
  
  return predictions;
};