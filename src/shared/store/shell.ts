import { create } from 'zustand';
import { logger } from '../logger';
import { type ShellConfig, getShellConfig, DEFAULT_SHELL_ID } from '../config/shells';

const SHELL_STORAGE_KEY = 'app_shell_id';

export interface ShellState {
  currentShellId: string;
  currentShell: ShellConfig;

  // Actions
  setShell: (shellId: string) => void;
  hydrate: () => void;
}

/**
 * 外壳管理 Store（Zustand）
 * 负责：
 * 1. 管理当前选择的外壳 ID
 * 2. 持久化到 localStorage
 * 3. 提供外壳配置获取
 */
export const useShellStore = create<ShellState>((set) => ({
  currentShellId: DEFAULT_SHELL_ID,
  currentShell: getShellConfig(DEFAULT_SHELL_ID),

  setShell: (shellId: string) => {
    const config = getShellConfig(shellId);
    set({
      currentShellId: shellId,
      currentShell: config,
    });
    localStorage.setItem(SHELL_STORAGE_KEY, shellId);
    logger.info('Shell changed', { shellId, name: config.name });
  },

  hydrate: () => {
    const savedShellId = localStorage.getItem(SHELL_STORAGE_KEY);
    if (savedShellId) {
      const config = getShellConfig(savedShellId);
      set({
        currentShellId: savedShellId,
        currentShell: config,
      });
      logger.info('Shell hydrated from storage', { shellId: savedShellId });
    }
  },
}));
