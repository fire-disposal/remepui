/**
 * Bland 评分系统配置
 * 基于 Braden Scale 压疮风险评估量表
 */

import type {
  BlandDimensionConfig,
  BlandLevelConfig,
  BlandScoreData,
} from '../types';

/**
 * Bland 评分维度配置
 */
export const BLAND_DIMENSIONS_CONFIG: BlandDimensionConfig[] = [
  {
    id: 'mobility',
    name: '活动能力',
    nameEn: 'Mobility',
    weight: 1.0,
    options: [
      {
        value: 1,
        label: '完全受限',
        description: '卧床不起，无法自主改变体位',
        icon: 'bed',
      },
      {
        value: 2,
        label: '严重受限',
        description: '偶尔能轻微改变身体或肢体位置',
        icon: 'stretcher',
      },
      {
        value: 3,
        label: '轻度受限',
        description: '能经常但无法完全自主改变体位',
        icon: 'walk',
      },
      {
        value: 4,
        label: '完全自主',
        description: '能完全自主改变体位，无限制',
        icon: 'run',
      },
    ],
  },
  {
    id: 'activity',
    name: '活动程度',
    nameEn: 'Activity',
    weight: 1.0,
    options: [
      {
        value: 1,
        label: '卧床不起',
        description: '全天卧床，无法下床活动',
        icon: 'bed',
      },
      {
        value: 2,
        label: '坐椅为主',
        description: '主要活动限于坐椅，偶尔站立',
        icon: 'armchair',
      },
      {
        value: 3,
        label: '偶尔行走',
        description: '能短距离行走，大部分时间卧床或坐椅',
        icon: 'walk',
      },
      {
        value: 4,
        label: '经常行走',
        description: '能经常行走，每天多次下床活动',
        icon: 'run',
      },
    ],
  },
  {
    id: 'nutrition',
    name: '营养状况',
    nameEn: 'Nutrition',
    weight: 1.0,
    options: [
      {
        value: 1,
        label: '非常差',
        description: '几乎不进食，或禁食/静脉营养',
        icon: 'ban',
      },
      {
        value: 2,
        label: '可能不足',
        description: '进食量少于推荐量的一半',
        icon: 'alert-circle',
      },
      {
        value: 3,
        label: '基本充足',
        description: '进食量达到推荐量的一半以上',
        icon: 'check',
      },
      {
        value: 4,
        label: '良好',
        description: '进食均衡，营养状况良好',
        icon: 'star',
      },
    ],
  },
  {
    id: 'friction',
    name: '摩擦力和剪切力',
    nameEn: 'Friction & Shear',
    weight: 1.0,
    options: [
      {
        value: 1,
        label: '严重问题',
        description: '频繁发生滑动，需要最大帮助移动',
        icon: 'alert-triangle',
      },
      {
        value: 2,
        label: '潜在问题',
        description: '移动时需要一定帮助，偶有滑动',
        icon: 'alert-circle',
      },
      {
        value: 3,
        label: '无明显问题',
        description: '移动自如，无滑动风险',
        icon: 'shield-check',
      },
    ],
  },
  {
    id: 'moisture',
    name: '潮湿程度',
    nameEn: 'Moisture',
    weight: 1.0,
    options: [
      {
        value: 1,
        label: '持续潮湿',
        description: '皮肤持续潮湿，每次翻身都发现潮湿',
        icon: 'droplet',
      },
      {
        value: 2,
        label: '经常潮湿',
        description: '皮肤经常潮湿，每天需要更换床单',
        icon: 'droplet-half',
      },
      {
        value: 3,
        label: '偶尔潮湿',
        description: '皮肤偶尔潮湿，需要额外护理',
        icon: 'droplet-off',
      },
      {
        value: 4,
        label: '很少潮湿',
        description: '皮肤通常干燥，常规护理即可',
        icon: 'sun',
      },
    ],
  },
  {
    id: 'sensation',
    name: '感觉知觉',
    nameEn: 'Sensation',
    weight: 1.0,
    options: [
      {
        value: 1,
        label: '完全丧失',
        description: '对疼痛刺激无反应',
        icon: 'eye-off',
      },
      {
        value: 2,
        label: '严重受限',
        description: '对疼痛刺激反应迟钝，仅能表达不适',
        icon: 'eye',
      },
      {
        value: 3,
        label: '轻度受限',
        description: '对语言指令有反应，但感觉迟钝',
        icon: 'eye-check',
      },
      {
        value: 4,
        label: '完全正常',
        description: '感觉正常，能自主表达不适',
        icon: 'eye-star',
      },
    ],
  },
];

/**
 * Bland 评分等级配置
 */
export const BLAND_LEVELS_CONFIG: BlandLevelConfig[] = [
  {
    level: 'low',
    minScore: 15,
    maxScore: 24,
    label: '低风险',
    color: '#22c55e', // green-500
    description: '患者压疮风险较低，采取标准预防措施',
    repositionInterval: 240, // 4小时
    preventiveMeasures: [
      '每 4 小时翻身一次',
      '保持皮肤清洁干燥',
      '使用标准床垫',
      '定期评估皮肤状况',
    ],
  },
  {
    level: 'moderate',
    minScore: 13,
    maxScore: 14,
    label: '中等风险',
    color: '#eab308', // yellow-500
    description: '患者存在压疮风险，需要加强预防措施',
    repositionInterval: 180, // 3小时
    preventiveMeasures: [
      '每 3 小时翻身一次',
      '使用减压床垫',
      '加强皮肤护理',
      '营养支持',
      '每日评估皮肤',
    ],
  },
  {
    level: 'high',
    minScore: 10,
    maxScore: 12,
    label: '高风险',
    color: '#f97316', // orange-500
    description: '患者压疮风险较高，需要积极预防措施',
    repositionInterval: 120, // 2小时
    preventiveMeasures: [
      '每 2 小时翻身一次',
      '使用气垫床或减压垫',
      '密切监测皮肤变化',
      '加强营养支持',
      '每班评估皮肤',
      '使用皮肤保护剂',
    ],
  },
  {
    level: 'very_high',
    minScore: 6,
    maxScore: 9,
    label: '极高风险',
    color: '#ef4444', // red-500
    description: '患者压疮风险极高，需要最高级别的预防措施',
    repositionInterval: 60, // 1小时
    preventiveMeasures: [
      '每 1-2 小时翻身一次',
      '使用高级减压气垫床',
      '持续监测皮肤状况',
      '专业营养评估与干预',
      '每小时评估皮肤',
      '使用多种皮肤保护产品',
      '多学科团队协作',
    ],
  },
];

/**
 * 默认 Bland 评分数据
 */
export const DEFAULT_BLAND_SCORE_DATA: BlandScoreData = {
  mobility: 4,
  activity: 4,
  nutrition: 4,
  friction: 3,
  moisture: 4,
  sensation: 4,
};

/**
 * Bland 评分存储键
 */
export const BLAND_STORAGE_KEY = 'pressure_ulcer_bland_scores';

/**
 * 最大历史记录数
 */
export const BLAND_MAX_HISTORY = 50;

/**
 * 获取维度配置
 */
export const getBlandDimensionConfig = (id: string): BlandDimensionConfig | undefined => {
  return BLAND_DIMENSIONS_CONFIG.find(d => d.id === id);
};

/**
 * 获取等级配置
 */
export const getBlandLevelConfig = (score: number): BlandLevelConfig => {
  const level = BLAND_LEVELS_CONFIG.find(
    l => score >= l.minScore && score <= l.maxScore
  );
  return level || BLAND_LEVELS_CONFIG[0];
};

/**
 * 计算 Bland 总分
 */
export const calculateBlandTotalScore = (data: BlandScoreData): number => {
  return (
    data.mobility +
    data.activity +
    data.nutrition +
    data.friction +
    data.moisture +
    data.sensation
  );
};

/**
 * 获取风险等级描述
 */
export const getBlandRiskDescription = (level: string): string => {
  const descriptions: Record<string, string> = {
    low: '患者压疮风险较低，采取标准预防措施即可',
    moderate: '患者存在压疮风险，需要加强预防措施',
    high: '患者压疮风险较高，需要积极预防措施',
    very_high: '患者压疮风险极高，需要最高级别的预防措施',
  };
  return descriptions[level] || '未知风险等级';
};
