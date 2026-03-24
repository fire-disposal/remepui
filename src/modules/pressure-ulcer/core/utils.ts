/**
 * 工具函数
 */

import { SIMULATION_CONFIG } from '../config/simulation.config';

/**
 * 格式化时间为 HH:MM:SS
 */
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / SIMULATION_CONFIG.TIME.SECONDS_PER_HOUR);
  const mins = Math.floor((seconds % SIMULATION_CONFIG.TIME.SECONDS_PER_HOUR) / SIMULATION_CONFIG.TIME.SECONDS_PER_MINUTE);
  const secs = Math.floor(seconds % SIMULATION_CONFIG.TIME.SECONDS_PER_MINUTE);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 生成唯一 ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * 从本地存储加载仿真记录
 */
export const loadRecords = <T>(): T[] => {
  try {
    const stored = localStorage.getItem(SIMULATION_CONFIG.STORAGE.KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * 保存仿真记录到本地存储
 */
export const saveRecords = <T>(records: T[]): void => {
  try {
    localStorage.setItem(SIMULATION_CONFIG.STORAGE.KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records:', e);
  }
};

/**
 * 限制数组最大长度
 */
export const limitArrayLength = <T>(array: T[], maxLength: number): T[] => {
  if (array.length > maxLength) {
    return array.slice(0, maxLength);
  }
  return array;
};