import { create } from 'zustand';
import { logger } from '../logger';
import { showTokenExpiredDialog } from './tokenExpired';
import type { UserInfo } from '../api/types';

export interface User extends UserInfo {
  // 用户接口继承 UserInfo，与后端对齐
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

/**
 * 解析 JWT token 获取过期时间
 */
function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.exp ? decoded.exp * 1000 : null; // 转换为毫秒
  } catch {
    return null;
  }
}

/**
 * 检查 token 是否过期
 */
function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  // 提前 5 分钟判断为过期，给刷新留出时间
  return Date.now() >= expiration - 5 * 60 * 1000;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  login: (user, token) => {
    logger.info('User logged in', { username: user.username });
    set({
      user,
      token,
      isAuthenticated: true,
    });
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  logout: () => {
    logger.info('User logged out');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  hydrate: () => {
    // 从本地存储恢复认证状态
    const token = localStorage.getItem(STORAGE_KEY);
    const userStr = localStorage.getItem(USER_STORAGE_KEY);

    if (token && userStr) {
      // 检查 token 是否过期
      if (isTokenExpired(token)) {
        logger.info('Token expired, clearing auth state');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        set({ loading: false });
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        // 检查是否包含 accessible_modules 字段
        if (!Array.isArray(user.accessible_modules)) {
          logger.info('Old user data format detected, clearing auth state');
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          set({ loading: false });
          
          setTimeout(() => {
            showTokenExpiredDialog(
              '系统权限架构已更新',
              '检测到旧版本登录状态，请重新登录以使用新功能。'
            );
          }, 500);
          return;
        }
        
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
        });
        logger.info('Auth state hydrated from storage');
      } catch (e) {
        logger.error('Failed to hydrate auth state', e);
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },
}));