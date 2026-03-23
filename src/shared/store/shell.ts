import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getShellConfig, type ShellConfig } from '../config/shells';
import { logger } from '../logger';

export interface ShellState {
  currentShellId: string;
  currentShell: ShellConfig;

  // Actions
  setShell: (id: string) => void;
  hydrate: () => void;
}

/**
 * 更新页面标题
 */
function updateDocumentTitle(shell: ShellConfig): void {
  document.title = shell.title;
}

/**
 * 更新 Favicon
 */
function updateFavicon(shell: ShellConfig): void {
  // 查找或创建 favicon link 元素
  let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  // 如果配置了 favicon URL，使用 URL
  if (shell.favicon) {
    favicon.href = shell.favicon;
    return;
  }

  // 否则，如果 logo 是 emoji，生成 SVG favicon
  if (shell.logo && shell.logo.length <= 2) {
    // 使用 emoji 生成 SVG favicon
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text y=".9em" font-size="90">${shell.logo}</text>
      </svg>
    `;
    favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}

/**
 * 外壳状态管理
 */
export const useShellStore = create<ShellState>()(
  persist(
    (set, get) => ({
      currentShellId: 'default',
      currentShell: getShellConfig('default'),

      setShell: (id: string) => {
        const shell = getShellConfig(id);
        logger.info('Shell changed', { from: get().currentShellId, to: id });
        
        // 更新 DOM
        updateDocumentTitle(shell);
        updateFavicon(shell);
        
        set({
          currentShellId: id,
          currentShell: shell,
        });
      },

      hydrate: () => {
        const state = get();
        const shell = state.currentShell;
        
        // 恢复 DOM 状态
        updateDocumentTitle(shell);
        updateFavicon(shell);
        
        logger.info('Shell state hydrated', { shellId: state.currentShellId });
      },
    }),
    {
      name: 'shell-storage',
      partialize: (state) => ({
        currentShellId: state.currentShellId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 重新获取完整的 shell 配置
          state.currentShell = getShellConfig(state.currentShellId);
          // 更新 DOM
          updateDocumentTitle(state.currentShell);
          updateFavicon(state.currentShell);
        }
      },
    }
  )
);