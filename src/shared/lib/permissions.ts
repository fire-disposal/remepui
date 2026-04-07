/**
 * 权限管理工具模块
 * 基于模块级别的权限控制
 */

import { useAuthStore } from "../store/auth";
import type { User } from "../store/auth";
import type { ModuleCode } from "../api/types";

/**
 * 检查用户是否为系统角色（拥有通配权限）
 */
export function isSystemRole(user: User | null): boolean {
  if (!user) return false;
  return user.is_system_role;
}

/**
 * 检查用户是否有权限访问指定模块
 */
export function canAccessModule(user: User | null, module: ModuleCode | string): boolean {
  if (!user) return false;
  
  // 系统角色拥有通配权限
  if (user.is_system_role) {
    return true;
  }
  
  // 检查模块是否在可访问列表中
  return user.accessible_modules.includes(module) || 
         user.accessible_modules.includes("*");
}

/**
 * 获取用户可访问的模块列表
 */
export function getAccessibleModules(user: User | null): string[] {
  if (!user) return [];
  
  // 系统角色或通配权限返回全部模块
  if (user.is_system_role || user.accessible_modules.includes("*")) {
    return [
      "dashboard",
      "patients",
      "devices",
      "bindings",
      "data",
      "users",
      "roles",
      "audit_logs",
      "settings",
      "pressure_ulcer",
    ];
  }
  
  return user.accessible_modules;
}

/**
 * 检查用户是否通过认证
 */
export function isAuthenticated(): boolean {
  const state = useAuthStore.getState();
  return !!state.token && !!state.user;
}

/**
 * 获取当前用户
 */
export function getCurrentUser(): User | null {
  return useAuthStore.getState().user;
}

/**
 * React Hook：使用权限检查
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isSystemRole: () => isSystemRole(user),
    canAccessModule: (module: ModuleCode | string) => canAccessModule(user, module),
    getAccessibleModules: () => getAccessibleModules(user),
    accessibleModules: user?.accessible_modules ?? [],
    isAuthenticated: !!user,
  };
}

// ==================== 路由守卫 ====================

/**
 * 路由守卫：检查认证
 * 用于 beforeLoad，确保用户已登录
 */
export function requireAuth(): { authenticated: boolean; user: User | null } {
  const user = getCurrentUser();
  const token = useAuthStore.getState().token;
  
  return {
    authenticated: !!token && !!user,
    user,
  };
}

/**
 * 路由守卫：检查模块权限
 * 用于 beforeLoad，确保用户有权限访问模块
 */
export function requireModule(module: ModuleCode | string): {
  permitted: boolean;
  user: User | null;
} {
  const user = getCurrentUser();
  const permitted = canAccessModule(user, module);
  
  return {
    permitted,
    user,
  };
}
