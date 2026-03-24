/**
 * 预设场景 Hook
 */

import { PRESET_SCENARIOS, getPresetParams } from "../config/presets.config";
import type { PresetScenario, SimulationParams } from "../types";

export const usePresets = () => {
  const getPreset = (name: string): Partial<SimulationParams> | undefined => {
    return getPresetParams(name);
  };

  return {
    presets: PRESET_SCENARIOS,
    getPreset,
  };
};