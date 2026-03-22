import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";
import { logger } from "../logger";
import { useAuthStore } from "../store/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * 创建 Axios 实例
 * - 统一 baseURL
 * - 请求/响应拦截器
 * - 自动注入 JWT token
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
    (response) => {
      logger.debug(`API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });

      // Return data directly (unwrap if ApiResponse format)
      return response.data;
    },
    (error: AxiosError) => {
      const { response, config, message } = error;

      // Handle 401 Unauthorized - token expired or invalid
      if (response?.status === 401) {
        logger.warn("Unauthorized - clearing auth state");
        useAuthStore.getState().logout();
        // Redirect to login will be handled by route guard
      }

      // Log error details
      logger.error(
        `API Error: ${config?.method?.toUpperCase()} ${config?.url}`,
        {
          status: response?.status,
          statusText: response?.statusText,
          data: response?.data,
          message,
        },
      );

      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createApiClient();
