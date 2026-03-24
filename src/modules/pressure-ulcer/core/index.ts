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