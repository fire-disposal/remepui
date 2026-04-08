import { type ReactNode } from "react";
import { useAuthStore } from "../store/auth";
import { canAccessModule } from "../lib/permissions";
import type { ModuleCode } from "../api/types";

interface ModuleGuardProps {
  module: ModuleCode | string;
  children: ReactNode;
  fallback?: ReactNode;
  disabled?: boolean;
}

/**
 * 模块权限守卫组件
 * 根据用户模块权限控制内容显示
 * 
 * 使用示例：
 * ```tsx
 * <ModuleGuard module="patients">
 *   <PatientPanel />
 * </ModuleGuard>
 * ```
 */
export function ModuleGuard({ 
  module,
  children, 
  fallback = null,
  disabled = false,
}: ModuleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <>{fallback}</>;
  }

  const hasAccess = canAccessModule(user, module);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 通配权限守卫组件
 * 仅拥有 "*" 通配权限的用户可见
 */
interface WildcardGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WildcardGuard({ 
  children, 
  fallback = null 
}: WildcardGuardProps) {
  const user = useAuthStore((state) => state.user);

  const hasWildcard = user?.accessible_modules?.includes("*" as ModuleCode);

  if (!hasWildcard) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 检查用户是否有指定模块权限
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = !!user;
  const hasWildcard = user?.accessible_modules?.includes("*" as ModuleCode);

  const canAccess = (module: ModuleCode | string): boolean => {
    return canAccessModule(user, module);
  };

  const getRoleInfo = () => {
    if (!user) return null;
    return {
      id: user.role_id,
      name: user.role_name,
      hasWildcard,
      accessibleModules: user.accessible_modules,
    };
  };

  return {
    hasWildcard,
    isAuthenticated,
    canAccess,
    getRoleInfo,
    user,
    accessibleModules: user?.accessible_modules ?? [],
  };
}