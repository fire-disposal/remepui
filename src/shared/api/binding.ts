import { apiClient } from "./client";
import type {
  Binding,
  BindingListResponse,
  CreateBindingRequest,
  BindingQuery,
} from "./types";

/**
 * 绑定关系 API 服务
 */
export const bindingApi = {
  /**
   * 创建绑定
   */
  async create(data: CreateBindingRequest): Promise<Binding> {
    return apiClient.post("/bindings", data) as unknown as Promise<Binding>;
  },

  /**
   * 获取绑定列表
   */
  async list(params?: BindingQuery): Promise<BindingListResponse> {
    return apiClient.get("/bindings", { params }) as unknown as Promise<BindingListResponse>;
  },

  /**
   * 删除绑定
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/bindings/${id}`) as unknown as Promise<{ success: boolean }>;
  },
};