/**
 * 环境配置
 * 统一管理应用环境变量
 */

interface EnvConfig {
  /** API 基础 URL */
  apiBaseUrl: string;
  /** 应用标题 */
  appTitle: string;
  /** 是否开发模式 */
  isDev: boolean;
  /** 是否生产模式 */
  isProd: boolean;
}

/**
 * 获取环境变量值
 */
function getEnvVar(key: string, defaultValue: string): string {
  return (import.meta as unknown as { env: Record<string, string> }).env[key] || defaultValue;
}

/**
 * 环境配置实例
 */
export const env: EnvConfig = {
  apiBaseUrl: getEnvVar("VITE_API_BASE_URL", "/api"),
  appTitle: getEnvVar("VITE_APP_TITLE", "Remipedia IoT Health Platform"),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  // 认证
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  CHANGE_PASSWORD: "/auth/change-password",

  // 用户
  USERS: "/users",
  USER: (id: string) => `/users/${id}`,

  // 患者
  PATIENTS: "/patients",
  PATIENT: (id: string) => `/patients/${id}`,
  PATIENT_DETAIL: (id: string) => `/patients/${id}/detail`,

  // 设备
  DEVICES: "/devices",
  DEVICE: (id: string) => `/devices/${id}`,

  // 绑定
  BINDINGS: "/bindings",
  BINDING: (id: string) => `/bindings/${id}`,

  // 数据
  DATA: "/data",
} as const;