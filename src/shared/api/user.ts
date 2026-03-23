import { apiClient } from "./client";
import type { User, PaginatedResponse, CreateUserRequest, UpdateUserRequest, UserQuery } from "./types";

/**
 * 用户管理 API 服务
 */
export const userApi = {
  /**
   * 创建用户
   */
  async create(data: CreateUserRequest): Promise<User> {
    return apiClient.post("/users", data) as unknown as Promise<User>;
  },

  /**
   * 获取用户列表
   */
  async list(params?: UserQuery): Promise<PaginatedResponse<User>> {
    return apiClient.get("/users", { params }) as unknown as Promise<PaginatedResponse<User>>;
  },

  /**
   * 获取单个用户
   */
  async get(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`) as unknown as Promise<User>;
  },

  /**
   * 更新用户
   */
  async update(id: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.put(`/users/${id}`, data) as unknown as Promise<User>;
  },

  /**
   * 删除用户
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/users/${id}`) as unknown as Promise<{ success: boolean }>;
  },
};