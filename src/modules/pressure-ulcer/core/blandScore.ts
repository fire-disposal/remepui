/**
 * Bland 评分系统核心逻辑
 * 基于 Braden Scale 压疮风险评估量表
 */

import {
  BLAND_DIMENSIONS_CONFIG,
  BLAND_LEVELS_CONFIG,
  DEFAULT_BLAND_SCORE_DATA,
  BLAND_STORAGE_KEY,
  BLAND_MAX_HISTORY,
  getBlandDimensionConfig,
  getBlandLevelConfig,
  calculateBlandTotalScore,
} from '../config/bland.config';
import { generateId } from './utils';
import type {
  BlandScoreData,
  BlandScoreResult,
  BlandScoreHistory,
  BlandDimension,
  BlandScoreItem,
  BlandScoreLevel,
} from '../types';

/**
 * 创建初始 Bland 评分数据
 */
export const createInitialBlandScore = (): BlandScoreData => {
  return { ...DEFAULT_BLAND_SCORE_DATA };
};

/**
 * 计算 Bland 评分结果
 */
export const calculateBlandScoreResult = (
  data: BlandScoreData,
  assessor?: string
): BlandScoreResult => {
  const totalScore = calculateBlandTotalScore(data);
  const maxScore = 24; // 6个维度，每个最高4分
  const levelConfig = getBlandLevelConfig(totalScore);

  // 构建各维度评分项
  const dimensions: Record<BlandDimension, BlandScoreItem> = {
    mobility: createScoreItem('mobility', data.mobility),
    activity: createScoreItem('activity', data.activity),
    nutrition: createScoreItem('nutrition', data.nutrition),
    friction: createScoreItem('friction', data.friction),
    moisture: createScoreItem('moisture', data.moisture),
    sensation: createScoreItem('sensation', data.sensation),
  };

  return {
    totalScore,
    maxScore,
    riskLevel: levelConfig.level,
    riskDescription: levelConfig.description,
    dimensions,
    recommendations: levelConfig.preventiveMeasures,
    assessmentTime: new Date().toISOString(),
    assessor,
  };
};

/**
 * 创建评分项
 */
const createScoreItem = (
  dimensionId: BlandDimension,
  score: number
): BlandScoreItem => {
  const config = getBlandDimensionConfig(dimensionId);
  if (!config) {
    throw new Error(`Unknown dimension: ${dimensionId}`);
  }

  const option = config.options.find(o => o.value === score);
  const maxScore = config.options.length;

  return {
    id: dimensionId,
    name: config.name,
    nameEn: config.nameEn,
    description: config.name,
    score,
    maxScore,
    level: score as 1 | 2 | 3 | 4,
    details: option?.description || '',
  };
};

/**
 * 更新 Bland 评分数据
 */
export const updateBlandScore = (
  current: BlandScoreData,
  updates: Partial<BlandScoreData>
): BlandScoreData => {
  return {
    ...current,
    ...updates,
  };
};

/**
 * 获取风险等级颜色
 */
export const getBlandRiskColor = (level: BlandScoreLevel): string => {
  const config = BLAND_LEVELS_CONFIG.find(l => l.level === level);
  return config?.color || '#6b7280';
};

/**
 * 获取风险等级标签
 */
export const getBlandRiskLabel = (level: BlandScoreLevel): string => {
  const config = BLAND_LEVELS_CONFIG.find(l => l.level === level);
  return config?.label || '未知';
};

/**
 * 获取建议翻身间隔 (分钟)
 */
export const getBlandRepositionInterval = (score: number): number => {
  const config = getBlandLevelConfig(score);
  return config.repositionInterval;
};

/**
 * 获取预防措施列表
 */
export const getBlandPreventiveMeasures = (score: number): string[] => {
  const config = getBlandLevelConfig(score);
  return config.preventiveMeasures;
};

/**
 * 验证 Bland 评分数据
 */
export const validateBlandScore = (data: BlandScoreData): boolean => {
  const dimensions: BlandDimension[] = [
    'mobility',
    'activity',
    'nutrition',
    'friction',
    'moisture',
    'sensation',
  ];

  return dimensions.every(dim => {
    const config = getBlandDimensionConfig(dim);
    if (!config) return false;
    const value = data[dim];
    const validValues = config.options.map(o => o.value);
    return validValues.includes(value);
  });
};

/**
 * 获取维度评分说明
 */
export const getDimensionDescription = (
  dimensionId: BlandDimension,
  score: number
): string => {
  const config = getBlandDimensionConfig(dimensionId);
  if (!config) return '';
  const option = config.options.find(o => o.value === score);
  return option?.description || '';
};

/**
 * 保存 Bland 评分历史
 */
export const saveBlandScoreHistory = (
  result: BlandScoreResult,
  patientId?: string,
  notes?: string
): BlandScoreHistory => {
  const history: BlandScoreHistory = {
    id: generateId(),
    result,
    patientId,
    notes,
  };

  try {
    const existing = loadBlandScoreHistory();
    const updated = [history, ...existing].slice(0, BLAND_MAX_HISTORY);
    localStorage.setItem(BLAND_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save Bland score history:', error);
  }

  return history;
};

/**
 * 加载 Bland 评分历史
 */
export const loadBlandScoreHistory = (): BlandScoreHistory[] => {
  try {
    const stored = localStorage.getItem(BLAND_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load Bland score history:', error);
  }
  return [];
};

/**
 * 删除 Bland 评分历史
 */
export const deleteBlandScoreHistory = (id: string): BlandScoreHistory[] => {
  try {
    const existing = loadBlandScoreHistory();
    const updated = existing.filter(h => h.id !== id);
    localStorage.setItem(BLAND_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to delete Bland score history:', error);
    return loadBlandScoreHistory();
  }
};

/**
 * 清空 Bland 评分历史
 */
export const clearBlandScoreHistory = (): void => {
  try {
    localStorage.removeItem(BLAND_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear Bland score history:', error);
  }
};

/**
 * 导出 Bland 评分历史为 CSV
 */
export const exportBlandScoreHistoryToCSV = (history: BlandScoreHistory[]): string => {
  const headers = [
    '评估时间',
    '总分',
    '风险等级',
    '活动能力',
    '活动程度',
    '营养状况',
    '摩擦力',
    '潮湿程度',
    '感觉知觉',
    '评估者',
    '备注',
  ].join(',');

  const rows = history.map(h => {
    const date = new Date(h.result.assessmentTime).toLocaleString('zh-CN');
    return [
      date,
      h.result.totalScore,
      getBlandRiskLabel(h.result.riskLevel),
      h.result.dimensions.mobility.score,
      h.result.dimensions.activity.score,
      h.result.dimensions.nutrition.score,
      h.result.dimensions.friction.score,
      h.result.dimensions.moisture.score,
      h.result.dimensions.sensation.score,
      h.result.assessor || '',
      h.notes || '',
    ].join(',');
  });

  return [headers, ...rows].join('\n');
};

/**
 * 获取 Bland 评分趋势
 */
export const getBlandScoreTrend = (
  history: BlandScoreHistory[],
  count: number = 5
): Array<{ date: string; score: number; level: string }> => {
  return history
    .slice(0, count)
    .map(h => ({
      date: new Date(h.result.assessmentTime).toLocaleDateString('zh-CN'),
      score: h.result.totalScore,
      level: getBlandRiskLabel(h.result.riskLevel),
    }))
    .reverse();
};

/**
 * 比较两次评分
 */
export const compareBlandScores = (
  current: BlandScoreResult,
  previous: BlandScoreResult
): {
  scoreChange: number;
  levelChanged: boolean;
  improved: boolean;
  dimensionChanges: Array<{
    dimension: BlandDimension;
    current: number;
    previous: number;
    change: number;
  }>;
} => {
  const scoreChange = current.totalScore - previous.totalScore;
  const levelChanged = current.riskLevel !== previous.riskLevel;
  const improved = scoreChange > 0;

  const dimensionChanges: Array<{
    dimension: BlandDimension;
    current: number;
    previous: number;
    change: number;
  }> = [];

  const dimensions: BlandDimension[] = [
    'mobility',
    'activity',
    'nutrition',
    'friction',
    'moisture',
    'sensation',
  ];

  dimensions.forEach(dim => {
    const currentScore = current.dimensions[dim].score;
    const previousScore = previous.dimensions[dim].score;
    if (currentScore !== previousScore) {
      dimensionChanges.push({
        dimension: dim,
        current: currentScore,
        previous: previousScore,
        change: currentScore - previousScore,
      });
    }
  });

  return {
    scoreChange,
    levelChanged,
    improved,
    dimensionChanges,
  };
};
