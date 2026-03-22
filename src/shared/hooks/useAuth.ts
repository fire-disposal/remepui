import { useCallback, useState } from "react";
import { useAuthStore } from "../store/auth";
import { authApi } from "../api/auth";
import { toast } from "../ui/toast";
import { logger } from "../logger";

/**
 * useAuth - 认证操作 Hook
 * 提供登录、登出、加载状态管理
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        setIsLoading(true);
        logger.info("Attempting login", { username });

        const response = await authApi.login({ username, password });
        const { token, user } = response;

        authStore.setToken(token);
        authStore.setUser(user);

        toast.success(`Welcome back, ${user.username}!`);
        logger.info("Login successful", { username: user.username });

        // 重定向到首页
        window.location.href = "/";
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Login failed";
        toast.error(errorMsg);
        logger.error("Login failed", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authStore],
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      logger.info("Attempting logout");

      // 通知后端
      try {
        await authApi.logout();
      } catch (e) {
        // 即使后端请求失败，也继续本地登出
        logger.warn("Logout API call failed, proceeding with local logout", e);
      }

      authStore.logout();
      toast.success("Logged out successfully");

      // 重定向到登录页
      window.location.href = "/login";
    } catch (error) {
      logger.error("Logout error", error);
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, [authStore]);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        setIsLoading(true);
        logger.info("Attempting register", { username, email });

        const response = await authApi.register({ username, email, password });
        const { token, user } = response;

        authStore.setToken(token);
        authStore.setUser(user);

        toast.success("Account created successfully!");
        logger.info("Registration successful", { username });

        window.location.href = "/";
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Registration failed";
        toast.error(errorMsg);
        logger.error("Registration failed", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authStore],
  );

  return {
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.token !== null,
    isLoading,
    login,
    logout,
    register,
  };
};
