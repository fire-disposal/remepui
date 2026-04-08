import { apiClient } from "./client";
import type {
  Role,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleQuery,
  Module,
  ModuleListResponse,
  RoleModuleResponse,
  AssignModuleRequest,
  BatchAssignModulesRequest,
  SetRoleModulesRequest,
} from "./types";

/**
 * 角色管理 API 服务
 * 使用 /admin/roles 端点
 */
export const roleApi = {
  /**
   * 获取角色列表
   * GET /admin/roles
   */
  async list(params?: RoleQuery): Promise<RoleListResponse> {
    return apiClient.get("/admin/roles", { params }) as unknown as Promise<RoleListResponse>;
  },

  /**
   * 创建角色
   * POST /admin/roles
   * 仅管理员可用
   */
  async create(data: CreateRoleRequest): Promise<Role> {
    return apiClient.post("/admin/roles", data) as unknown as Promise<Role>;
  },

  /**
   * 获取单个角色
   * GET /admin/roles/:id
   */
  async get(id: string): Promise<Role> {
    return apiClient.get(`/admin/roles/${id}`) as unknown as Promise<Role>;
  },

  /**
   * 更新角色
   * PUT /admin/roles/:id
   * 仅管理员可用
   */
  async update(id: string, data: UpdateRoleRequest): Promise<Role> {
    return apiClient.put(`/admin/roles/${id}`, data) as unknown as Promise<Role>;
  },

  /**
   * 删除角色
   * DELETE /admin/roles/:id
   * 仅管理员可用，不能删除系统角色
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`/admin/roles/${id}`) as unknown as Promise<void>;
  },

  /**
   * 获取角色模块权限
   * GET /admin/roles/:id/modules
   */
  async getModules(id: string): Promise<RoleModuleResponse> {
    return apiClient.get(`/admin/roles/${id}/modules`) as unknown as Promise<RoleModuleResponse>;
  },

  /**
   * 为角色分配模块权限
   * POST /admin/roles/:id/modules
   * 仅管理员可用
   */
  async assignModule(id: string, data: AssignModuleRequest): Promise<void> {
    return apiClient.post(`/admin/roles/${id}/modules`, data) as unknown as Promise<void>;
  },

  /**
   * 批量分配模块权限
   * POST /admin/roles/:id/modules/batch
   * 仅管理员可用
   */
  async batchAssignModules(id: string, data: BatchAssignModulesRequest): Promise<void> {
    return apiClient.post(`/admin/roles/${id}/modules/batch`, data) as unknown as Promise<void>;
  },

  /**
   * 设置角色模块权限（替换）
   * PUT /admin/roles/:id/modules
   * 仅管理员可用
   */
  async setModules(id: string, data: SetRoleModulesRequest): Promise<void> {
    return apiClient.put(`/admin/roles/${id}/modules`, data) as unknown as Promise<void>;
  },

  /**
   * 移除角色模块权限
   * DELETE /admin/roles/:id/modules/:module_id
   * 仅管理员可用
   */
  async revokeModule(id: string, moduleId: string): Promise<void> {
    return apiClient.delete(`/admin/roles/${id}/modules/${moduleId}`) as unknown as Promise<void>;
  },
}

/**
 * 模块管理 API 服务
 */
export const moduleApi = {
  /**
   * 列出所有模块
   * GET /admin/modules
   */
  async list(): Promise<ModuleListResponse> {
    return apiClient.get("/admin/modules") as unknown as Promise<ModuleListResponse>;
  },
}

/**
 * 检查用户是否具有管理员角色
 * 支持新旧两种角色字段（兼容过渡期间）
 */
export function isAdmin(user: { role_id?: string; role_name?: string; role?: string } | null): boolean {
  if (!user) return false;
  
  // 优先检查 role_name
  if (user.role_name) {
    return user.role_name.toLowerCase() === "admin";
  }
  
  // 兼容旧格式 role
  if (user.role) {
    return user.role.toLowerCase() === "admin";
  }
  
  return false;
}

/**
 * 检查用户是否具有指定角色（通过名称）
 */
export function hasRoleName(
  user: { role_name?: string; role?: string } | null,
  roleName: string
): boolean {
  if (!user) return false;
  
  const userRole = user.role_name || user.role;
  return userRole?.toLowerCase() === roleName.toLowerCase();
}

/**
 * 检查用户角色 ID 是否匹配
 */
export function hasRoleId(user: { role_id?: string } | null, roleId: string): boolean {
  if (!user || !user.role_id) return false;
  return user.role_id === roleId;
}
