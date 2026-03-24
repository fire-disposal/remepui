/**
 * 风险计算器
 * 基于 NPUAP/EPUAP 国际压疮防治指南
 */

import { SIMULATION_CONFIG } from '../config/simulation.config';
import type { SimulationParams, RiskFactors } from '../types';

/**
 * 计算 BMI 风险贡献 (0-3 分)
 * 基于 WHO BMI 分类标准
 */
export const calculateBMIRisk = (bmi: number): number => {
  if (bmi < 18.5) return 3.0;  // 偏瘦：风险最高
  if (bmi < 25) return 0.5;    // 正常：风险最低
  if (bmi < 30) return 1.5;    // 超重：中等风险
  return 2.5;                   // 肥胖：高风险
};

/**
 * 计算环境温度风险贡献 (0-2.5 分)
 */
export const calculateTemperatureRisk = (temperature: number): number => {
  if (temperature < 18) return 1.0;   // 低温：血管收缩
  if (temperature <= 25) return 0.5;  // 适宜：风险最低
  if (temperature < 30) return 1.5;   // 偏高：出汗增加
  return 2.5;                          // 高温：高风险
};

/**
 * 计算环境湿度风险贡献 (0-2 分)
 */
export const calculateHumidityRisk = (humidity: number): number => {
  if (humidity < 30) return 1.0;   // 干燥：皮肤脆弱
  if (humidity <= 70) return 0.5;  // 适宜：风险最低
  if (humidity < 80) return 1.5;   // 偏高：皮肤浸渍
  return 2.0;                       // 高湿：高风险
};

/**
 * 计算压力风险贡献 (0-6 分)
 * 基于界面压力值 (mmHg)
 */
export const calculatePressureRisk = (pressure: number): number => {
  if (pressure <= 32) return 0.5;   // 安全范围（毛细血管闭合压）
  if (pressure <= 70) return 1.5;   // 轻度风险
  if (pressure <= 100) return 2.5;  // 中度风险
  if (pressure <= 150) return 4.0;  // 高度风险
  return 6.0;                        // 极高风险
};

/**
 * 计算综合风险系数 (0-10)
 * 使用加权求和后归一化
 */
export const calculateRiskScore = (params: SimulationParams): number => {
  const factors: RiskFactors = {
    bmi: calculateBMIRisk(params.bmi),
    temperature: calculateTemperatureRisk(params.temperature),
    humidity: calculateHumidityRisk(params.humidity),
    pressure: calculatePressureRisk(params.pressure),
  };

  const { RISK_WEIGHTS } = SIMULATION_CONFIG;
  const weightedScore =
    factors.pressure * RISK_WEIGHTS.PRESSURE +
    factors.bmi * RISK_WEIGHTS.BMI +
    factors.temperature * RISK_WEIGHTS.TEMPERATURE +
    factors.humidity * RISK_WEIGHTS.HUMIDITY;

  // 归一化到 0-10 范围
  // 最大可能分数 = 6*0.4 + 3*0.3 + 2.5*0.15 + 2*0.15 = 3.975
  const maxPossibleScore = 3.975;
  const normalizedScore = (weightedScore / maxPossibleScore) * 10;

  return clamp(normalizedScore, SIMULATION_CONFIG.RISK_SCORE.MIN, SIMULATION_CONFIG.RISK_SCORE.MAX);
};

/**
 * 获取风险因素详情
 */
export const getRiskFactors = (params: SimulationParams): RiskFactors => ({
  bmi: calculateBMIRisk(params.bmi),
  temperature: calculateTemperatureRisk(params.temperature),
  humidity: calculateHumidityRisk(params.humidity),
  pressure: calculatePressureRisk(params.pressure),
});

/**
 * 辅助函数：限制数值范围
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};