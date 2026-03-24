/**
 * Core 模块导出
 */

export * from './riskCalculator';
export * from './damageModel';
export {
  calculateAdvancedDamageRate,
  calculateRecoveryRate,
  calculateDynamicCriticalTime,
  calculateTissueResilience,
  updateBodyPartsAdvanced,
  predictPressureUlcerTime,
  calculateRepositionInterval,
  generateDamagePrediction,
  type DamageState,
} from './advancedDamageModel';
export * from './utils';

// Bland 评分系统
export * from './blandScore';

// DERI 渲染器
export * from './deriRenderer';