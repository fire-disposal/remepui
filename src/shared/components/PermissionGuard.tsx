import { type ReactNode } from "react";
import { useAuthStore } from "../store/auth";
import { isAdmin, hasRoleName, hasRoleId } from "../api/role";

interface PermissionGuardProps {
  /** 允许的角色名称列表（如 ["admin", "manager"]） */
  roles?: string[];
  /** 允许的角色 ID 列表 */
  roleIds?: string[];
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
 * 
 * 适配新版 RBAC（基于 role_id 和 role_name）
 */
export function PermissionGuard({ 
  roles, 
  roleIds,
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
  if (admin && !isAdmin(user)) {
    return <>{fallback}</>;
  }

  // 检查角色名称权限
  if (roles && !roles.some(role => hasRoleName(user, role))) {
    return <>{fallback}</>;
  }

  // 检查角色 ID 权限
  if (roleIds && !roleIds.some(roleId => hasRoleId(user, roleId))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 检查用户是否有指定权限
 * 适配新版 RBAC 结构
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const userIsAdmin = isAdmin(user);
  const isAuthenticated = !!user;

  /**
   * 检查是否具有指定角色名称
   */
  const hasRole = (role: string): boolean => {
    return hasRoleName(user, role);
  };

  /**
   * 检查是否具有任意指定角色名称
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRoleName(user, role));
  };

  /**
   * 检查是否具有指定角色 ID
   */
  const hasRoleById = (roleId: string): boolean => {
    return hasRoleId(user, roleId);
  };

  /**
   * 检查是否具有任意指定角色 ID
   */
  const hasAnyRoleById = (roleIds: string[]): boolean => {
    return roleIds.some(roleId => hasRoleId(user, roleId));
  };

  /**
   * 获取用户角色信息
   */
  const getRoleInfo = () => {
    if (!user) return null;
    return {
      id: user.role_id,
      name: user.role_name,
    };
  };

  return {
    isAdmin: userIsAdmin,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasRoleById,
    hasAnyRoleById,
    getRoleInfo,
    user,
  };
}
