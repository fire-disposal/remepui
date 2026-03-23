import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth";
import { authApi, clearRefreshToken } from "../api/auth";
import { toast } from "../ui/toast";
import { logger } from "../logger";

/**
 * useAuth - 认证操作 Hook
 * 提供登录、登出、加载状态管理
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        setIsLoading(true);
        logger.info("Attempting login", { username });

        const response = await authApi.login({ username, password });
        const { access_token, user } = response;

        authStore.setToken(access_token);
        authStore.setUser(user);

        toast.success(`欢迎回来, ${user.username}!`);
        logger.info("Login successful", { username: user.username });

        // 使用 router 导航到首页
        navigate({ to: "/" });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "登录失败";
        toast.error(errorMsg);
        logger.error("Login failed", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authStore, navigate],
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

      // 清除 refresh token
      clearRefreshToken();
      
      authStore.logout();
      toast.success("已成功登出");

      // 使用 router 导航到登录页
      navigate({ to: "/login" });
    } catch (error) {
      logger.error("Logout error", error);
      toast.error("登出失败");
    } finally {
      setIsLoading(false);
    }
  }, [authStore, navigate]);

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      try {
        setIsLoading(true);
        logger.info("Attempting password change");

        await authApi.changePassword({
          old_password: oldPassword,
          new_password: newPassword,
        });

        toast.success("密码修改成功");
        logger.info("Password changed successfully");
        return true;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "密码修改失败";
        toast.error(errorMsg);
        logger.error("Password change failed", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.token !== null,
    isLoading,
    login,
    logout,
    changePassword,
  };
};