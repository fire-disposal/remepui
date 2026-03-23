import { type ReactNode } from "react";
import { useAuthStore } from "../store/auth";

interface PermissionGuardProps {
  /** 允许的角色列表 */
  roles?: string[];
  /** 是否需要管理员权限 */
  admin?: boolean;
  /** 有权限时显示的内容 */
  children: ReactNode;
  /** 无权限时显示的内容 */
  fallback?: ReactNode;
}

/**
 * 权限守卫组件
 * 根据用户角色控制内容显示
 */
export function PermissionGuard({ 
  roles, 
  admin = false, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const user = useAuthStore((state) => state.user);

  // 未登录
  if (!user) {
    return <>{fallback}</>;
  }

  // 检查管理员权限
  if (admin && user.role !== "admin") {
    return <>{fallback}</>;
  }

  // 检查角色权限
  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 检查用户是否有指定权限
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    isAdmin,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    user,
  };
}