import { type ReactNode } from "react";
import { useAuthStore } from "../store/auth";
import { canAccessModule, isSystemRole } from "../lib/permissions";
import type { ModuleCode } from "../api/types";

interface ModuleGuardProps {
  /** 模块代码 */
  module: ModuleCode | string;
  /** 有权限时显示的内容 */
  children: ReactNode;
  /** 无权限时显示的内容（可选） */
  fallback?: ReactNode;
  /** 是否以禁用状态显示（而非隐藏） */
  disabled?: boolean;
}

/**
 * 模块权限守卫组件
 * 根据用户模块权限控制内容显示
 * 
 * 使用示例：
 * ```tsx
 * // 仅对 patients 模块有权限的用户可见
 * <ModuleGuard module="patients">
 *   <PatientPanel />
 * </ModuleGuard>
 * 
 * // 无权限时显示占位符
 * <ModuleGuard module="users" fallback={<Locked />}>
 *   <UserPanel />
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

  // 未登录
  if (!user) {
    return <>{fallback}</>;
  }

  // 检查模块权限
  const hasAccess = canAccessModule(user, module);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 系统角色守卫组件
 * 仅系统角色（拥有通配权限）可见
 */
interface SystemRoleGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SystemRoleGuard({ 
  children, 
  fallback = null 
}: SystemRoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !isSystemRole(user)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 检查用户是否有指定模块权限
 * 
 * 返回包含各种权限检查方法的 hooks
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const userIsSystemRole = isSystemRole(user);
  const isAuthenticated = !!user;

  /**
   * 检查是否具有指定模块权限
   */
  const canAccess = (module: ModuleCode | string): boolean => {
    return canAccessModule(user, module);
  };

  /**
   * 获取用户角色信息
   */
  const getRoleInfo = () => {
    if (!user) return null;
    return {
      id: user.role_id,
      name: user.role_name,
      isSystemRole: user.is_system_role,
      accessibleModules: user.accessible_modules,
    };
  };

  return {
    isSystemRole: userIsSystemRole,
    isAuthenticated,
    canAccess,
    getRoleInfo,
    user,
    accessibleModules: user?.accessible_modules ?? [],
  };
}
