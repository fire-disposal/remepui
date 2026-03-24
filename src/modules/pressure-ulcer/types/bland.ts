/**
 * Bland 评分系统类型定义
 * 用于压疮风险评估的专业评分工具
 */

// ============================================================================
// Bland 评分基础类型
// ============================================================================

/**
 * Bland 评分维度
 */
export type BlandDimension = 
  | 'mobility'      // 活动能力
  | 'activity'      // 活动程度
  | 'nutrition'     // 营养状况
  | 'friction'      // 摩擦力和剪切力
  | 'moisture'      // 潮湿程度
  | 'sensation';    // 感觉知觉

/**
 * Bland 评分等级
 */
export type BlandScoreLevel = 'low' | 'moderate' | 'high' | 'very_high';

/**
 * Bland 评分项
 */
export interface BlandScoreItem {
  /** 维度 ID */
  id: BlandDimension;
  /** 维度名称 */
  name: string;
  /** 维度名称 (英文) */
  nameEn: string;
  /** 描述 */
  description: string;
  /** 分值 */
  score: number;
  /** 最大分值 */
  maxScore: number;
  /** 等级 */
  level: 1 | 2 | 3 | 4;
  /** 详细说明 */
  details: string;
}

// ============================================================================
// Bland 评分数据接口
// ============================================================================

/**
 * Bland 评分数据
 */
export interface BlandScoreData {
  /** 活动能力评分 */
  mobility: number;
  /** 活动程度评分 */
  activity: number;
  /** 营养状况评分 */
  nutrition: number;
  /** 摩擦力和剪切力评分 */
  friction: number;
  /** 潮湿程度评分 */
  moisture: number;
  /** 感觉知觉评分 */
  sensation: number;
}

/**
 * Bland 评分结果
 */
export interface BlandScoreResult {
  /** 总分 */
  totalScore: number;
  /** 最大可能分数 */
  maxScore: number;
  /** 风险等级 */
  riskLevel: BlandScoreLevel;
  /** 风险描述 */
  riskDescription: string;
  /** 各维度评分 */
  dimensions: Record<BlandDimension, BlandScoreItem>;
  /** 建议措施 */
  recommendations: string[];
  /** 评估时间 */
  assessmentTime: string;
  /** 评估者 */
  assessor?: string;
}

/**
 * Bland 评分历史记录
 */
export interface BlandScoreHistory {
  /** 记录 ID */
  id: string;
  /** 评分结果 */
  result: BlandScoreResult;
  /** 患者 ID */
  patientId?: string;
  /** 备注 */
  notes?: string;
}

// ============================================================================
// Bland 评分配置
// ============================================================================

/**
 * Bland 评分等级配置
 */
export interface BlandLevelConfig {
  /** 等级 */
  level: BlandScoreLevel;
  /** 最小分数 */
  minScore: number;
  /** 最大分数 */
  maxScore: number;
  /** 标签 */
  label: string;
  /** 颜色 */
  color: string;
  /** 描述 */
  description: string;
  /** 建议翻身间隔 (分钟) */
  repositionInterval: number;
  /** 预防措施 */
  preventiveMeasures: string[];
}

/**
 * Bland 评分选项
 */
export interface BlandScoreOption {
  /** 分值 */
  value: number;
  /** 标签 */
  label: string;
  /** 描述 */
  description: string;
  /** 图标 */
  icon?: string;
}

/**
 * Bland 评分维度配置
 */
export interface BlandDimensionConfig {
  /** 维度 ID */
  id: BlandDimension;
  /** 维度名称 */
  name: string;
  /** 维度名称 (英文) */
  nameEn: string;
  /** 权重 */
  weight: number;
  /** 评分选项 */
  options: BlandScoreOption[];
}

// ============================================================================
// Bland 评分组件属性
// ============================================================================

/**
 * Bland 评分面板属性
 */
export interface BlandScorePanelProps {
  /** 初始评分数据 */
  initialData?: Partial<BlandScoreData>;
  /** 评分变化回调 */
  onScoreChange?: (data: BlandScoreData) => void;
  /** 评分完成回调 */
  onComplete?: (result: BlandScoreResult) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否显示历史 */
  showHistory?: boolean;
  /** 历史记录 */
  history?: BlandScoreHistory[];
  /** 患者 ID */
  patientId?: string;
  /** 评估者 */
  assessor?: string;
}

/**
 * Bland 评分维度选择器属性
 */
export interface BlandDimensionSelectorProps {
  /** 维度配置 */
  dimension: BlandDimensionConfig;
  /** 当前分值 */
  value: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 分值变化回调 */
  onChange: (value: number) => void;
}

/**
 * Bland 评分结果展示属性
 */
export interface BlandScoreResultProps {
  /** 评分结果 */
  result: BlandScoreResult;
  /** 是否显示详情 */
  showDetails?: boolean;
  /** 是否显示建议 */
  showRecommendations?: boolean;
  /** 是否显示历史对比 */
  showComparison?: boolean;
  /** 历史记录 */
  history?: BlandScoreHistory[];
}

/**
 * Bland 评分历史列表属性
 */
export interface BlandScoreHistoryProps {
  /** 历史记录 */
  history: BlandScoreHistory[];
  /** 选中记录回调 */
  onSelect?: (record: BlandScoreHistory) => void;
  /** 删除记录回调 */
  onDelete?: (id: string) => void;
  /** 导出记录回调 */
  onExport?: () => void;
  /** 最大显示条数 */
  maxItems?: number;
}
