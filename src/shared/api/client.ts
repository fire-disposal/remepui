import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
} from "axios";
import { logger } from "../logger";
import { useAuthStore } from "../store/auth";
import { getRefreshToken, setRefreshToken, clearRefreshToken } from "./auth";

// 后端 API 地址 - remipedia 服务运行在 18000 端口
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:18000/api";

// 标记是否正在刷新 token
let isRefreshing = false;
// 等待刷新的请求队列
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// 处理队列中的请求
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * 创建 Axios 实例
 * - 统一 baseURL
 * - 请求/响应拦截器
 * - 自动注入 JWT token
 * - Token 自动刷新
 * - 统一错误处理
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  /**
   * Request interceptor: Inject JWT token
   */
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      logger.debug(
        `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        },
      );

      return config;
    },
    (error) => {
      logger.error("Request interceptor error", error);
      return Promise.reject(error);
    },
  );

  /**
   * Response interceptor: Handle responses and errors
   */
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      logger.debug(`API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });

      // Return data directly (unwrap if ApiResponse format)
      return response.data;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized - token expired or invalid
      if (error.response?.status === 401 && !originalRequest._retry) {
        // 如果是登录或刷新 token 的请求，不尝试刷新
        if (originalRequest.url?.includes("/auth/login") || 
            originalRequest.url?.includes("/auth/refresh")) {
          clearRefreshToken();
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // 如果正在刷新，将请求加入队列
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          // 没有 refresh token，直接登出
          isRefreshing = false;
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        try {
          // 尝试刷新 token
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const { access_token, refresh_token } = response.data;
          
          // 更新 token
          useAuthStore.getState().setToken(access_token);
          setRefreshToken(refresh_token);
          
          // 处理队列中的请求
          processQueue(null, access_token);

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return client(originalRequest);
        } catch (refreshError) {
          // 刷新失败，登出
          processQueue(refreshError, null);
          clearRefreshToken();
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Log error details
      logger.error(
        `API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        },
      );

      return Promise.reject(error);
    },
  );

  return client;
}

// 类型重写，因为拦截器返回的是 response.data 而不是 response
export type ApiClient = {
  get<T = unknown>(url: string, config?: object): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>;
  delete<T = unknown>(url: string, config?: object): Promise<T>;
};

export const apiClient = createApiClient() as AxiosInstance & ApiClient;