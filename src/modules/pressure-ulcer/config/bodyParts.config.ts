/**
 * 身体部位配置
 * 定义 5 个压疮最高发部位的详细信息（仰卧位）
 */

import type { BodyPartType } from '../types';

export interface BodyPartConfig {
  id: BodyPartType;
  name: string;
  nameEn: string;
  description: string;
  incidence: string;
  // SVG 坐标配置
  svg: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
  };
  // 初始状态配置
  initial: {
    x: number;
    y: number;
    radius: number;
    pressure: number;
  };
}

export const BODY_PARTS_CONFIG: Record<BodyPartType, BodyPartConfig> = {
  sacrum: {
    id: 'sacrum',
    name: '骶尾部',
    nameEn: 'Sacrum/Coccyx',
    description: '最常见的压疮发生部位，位于脊柱末端、臀部中央',
    incidence: '发生率：35-40%',
    svg: {
      cx: 100,
      cy: 200,
      rx: 20,
      ry: 16,
    },
    initial: {
      x: 50,
      y: 35,
      radius: 25,
      pressure: 32,
    },
  },
  leftHeel: {
    id: 'leftHeel',
    name: '左足跟',
    nameEn: 'Left Heel',
    description: '足跟部位皮肤薄，骨突明显，易受压力损伤',
    incidence: '发生率：15-20%',
    svg: {
      cx: 65,
      cy: 360,
      rx: 12,
      ry: 10,
    },
    initial: {
      x: 35,
      y: 92,
      radius: 12,
      pressure: 28,
    },
  },
  rightHeel: {
    id: 'rightHeel',
    name: '右足跟',
    nameEn: 'Right Heel',
    description: '足跟部位皮肤薄，骨突明显，易受压力损伤',
    incidence: '发生率：15-20%',
    svg: {
      cx: 135,
      cy: 360,
      rx: 12,
      ry: 10,
    },
    initial: {
      x: 65,
      y: 92,
      radius: 12,
      pressure: 28,
    },
  },
  leftTrochanter: {
    id: 'leftTrochanter',
    name: '左股骨大转子',
    nameEn: 'Left Greater Trochanter',
    description: '髋关节外侧最突出的骨性标志',
    incidence: '发生率：10-15%',
    svg: {
      cx: 58,
      cy: 225,
      rx: 12,
      ry: 14,
    },
    initial: {
      x: 38,
      y: 55,
      radius: 15,
      pressure: 30,
    },
  },
  rightTrochanter: {
    id: 'rightTrochanter',
    name: '右股骨大转子',
    nameEn: 'Right Greater Trochanter',
    description: '髋关节外侧最突出的骨性标志',
    incidence: '发生率：10-15%',
    svg: {
      cx: 142,
      cy: 225,
      rx: 12,
      ry: 14,
    },
    initial: {
      x: 62,
      y: 55,
      radius: 15,
      pressure: 30,
    },
  },
} as const;

/**
 * 获取身体部位的标签和编号
 */
export const BODY_PART_LABELS: Record<BodyPartType, string> = {
  sacrum: '1',
  leftHeel: '2',
  rightHeel: '3',
  leftTrochanter: '4',
  rightTrochanter: '5',
} as const;