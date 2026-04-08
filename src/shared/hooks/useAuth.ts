import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth";
import { authApi, clearRefreshToken } from "../api/auth";
import { toast } from "../ui/toast";
import { logger } from "../logger";
import { getFallbackPath } from "../../app/router";

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

        // 检查用户是否有任何权限
        const hasPermission = user.is_system_role || 
          (user.accessible_modules && user.accessible_modules.length > 0);
        
        if (!hasPermission) {
          // 无任何权限，提示用户
          toast.error("您的账户没有访问权限，请联系管理员");
          logger.warn("User has no permissions", { username: user.username });
          return;
        }

        authStore.setToken(access_token);
        authStore.setUser(user);

        toast.success(`欢迎回来, ${user.username}!`);
        logger.info("Login successful", { username: user.username });

        // 使用智能重定向到用户有权限的第一个模块
        const accessibleModules = user.accessible_modules || [];
        const fallbackPath = getFallbackPath(accessibleModules);
        navigate({ to: fallbackPath });
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