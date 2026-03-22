import { apiClient } from "./client";
import type { User } from "../store/auth";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Auth API Service
 * 处理所有认证相关的 API 调用
 */
export const authApi = {
  /**
   * 用户登录
   */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post("/auth/login", data);
  },

  /**
   * 用户注册
   */
  register: (data: RegisterRequest): Promise<LoginResponse> => {
    return apiClient.post("/auth/register", data);
  },

  /**
   * 刷新 Token
   */
  refreshToken: (): Promise<{ token: string }> => {
    return apiClient.post("/auth/refresh");
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: (): Promise<User> => {
    return apiClient.get("/auth/me");
  },

  /**
   * 用户登出（通知后端）
   */
  logout: (): Promise<void> => {
    return apiClient.post("/auth/logout");
  },
};
