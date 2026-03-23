import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
} from "./types";

// Refresh token 存储 key
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * 存储 refresh token
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * 获取 refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 清除 refresh token
 */
export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * 认证 API 服务
 */
export const authApi = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post("/auth/login", data) as unknown as LoginResponse;
    // 保存 refresh token
    if (response.refresh_token) {
      setRefreshToken(response.refresh_token);
    }
    return response;
  },

  /**
   * 刷新令牌
   */
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post("/auth/refresh", data) as unknown as RefreshTokenResponse;
    // 更新 refresh token
    if (response.refresh_token) {
      setRefreshToken(response.refresh_token);
    }
    return response;
  },

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean }> {
    return apiClient.post("/auth/change-password", data) as unknown as Promise<{ success: boolean }>;
  },

  /**
   * 登出
   */
  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // 忽略登出错误
      }
    }
    clearRefreshToken();
  },
};