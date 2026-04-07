import { create } from 'zustand';

/**
 * JWT 过期/格式变更提示状态
 */
export interface TokenExpiredState {
  isOpen: boolean;
  title: string;
  message: string;
  
  // Actions
  show: (title?: string, message?: string) => void;
  hide: () => void;
}

export const useTokenExpiredStore = create<TokenExpiredState>((set) => ({
  isOpen: false,
  title: '会话已过期',
  message: '您的登录状态已过期，请重新登录。',
  
  show: (title, message) => set({ 
    isOpen: true, 
    title: title || '会话已过期',
    message: message || '您的登录状态已过期，请重新登录。'
  }),
  hide: () => set({ isOpen: false }),
}));

/**
 * 触发 JWT 过期提示
 * 用于 API client 在检测到格式变更或 401 错误时调用
 */
export function showTokenExpiredDialog(
  title = '会话已过期',
  message = '系统权限架构已更新，请重新登录以继续使用。'
) {
  useTokenExpiredStore.getState().show(title, message);
}
