import { create } from 'zustand';
import { logger } from '../logger';

export interface User {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
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
      try {
        const user = JSON.parse(userStr);
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
