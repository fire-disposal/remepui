/**
 * 预设场景配置
 * 基于典型临床场景的参数预设
 */

import type { SimulationParams, PresetScenario } from "../types";

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    name: "正常成人",
    description: "健康成年人的典型参数设置",
    params: {
      height: 170,
      weight: 70,
      bmi: 24.2,
      temperature: 22,
      humidity: 50,
      pressure: 32,
      timeSpeed: 1.0,
    },
  },
  {
    name: "高风险老年患者",
    description: "营养不良、皮肤脆弱的老年患者",
    params: {
      height: 165,
      weight: 50,
      bmi: 18.4,
      temperature: 24,
      humidity: 65,
      pressure: 80,
      timeSpeed: 1.5,
    },
  },
  {
    name: "ICU 重症患者",
    description: "ICU 中长期卧床的重症患者",
    params: {
      height: 175,
      weight: 85,
      bmi: 27.8,
      temperature: 28,
      humidity: 75,
      pressure: 120,
      timeSpeed: 2.0,
    },
  },
  {
    name: "肥胖患者",
    description: "BMI>30 的肥胖患者，压疮风险较高",
    params: {
      height: 170,
      weight: 95,
      bmi: 32.9,
      temperature: 25,
      humidity: 60,
      pressure: 100,
      timeSpeed: 1.5,
    },
  },
  {
    name: "术后低体温",
    description: "手术后体温偏低的患者",
    params: {
      height: 168,
      weight: 65,
      bmi: 23.0,
      temperature: 16,
      humidity: 40,
      pressure: 60,
      timeSpeed: 1.0,
    },
  },
  {
    name: "高温高湿环境",
    description: "夏季无空调环境，出汗多",
    params: {
      height: 172,
      weight: 68,
      bmi: 23.0,
      temperature: 32,
      humidity: 85,
      pressure: 45,
      timeSpeed: 1.5,
    },
  },
];

/**
 * 获取预设场景参数
 */
export const getPresetParams = (name: string): SimulationParams | undefined => {
  const preset = PRESET_SCENARIOS.find((p) => p.name === name);
  return preset?.params;
};

/**
 * 默认参数配置
 */
export const DEFAULT_PARAMS: SimulationParams = PRESET_SCENARIOS[0].params;