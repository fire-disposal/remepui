import { apiClient } from "./client";
import type {
  Device,
  PaginatedResponse,
  RegisterDeviceRequest,
  UpdateDeviceRequest,
  DeviceQuery,
} from "./types";

/**
 * 设备管理 API 服务
 */
export const deviceApi = {
  /**
   * 注册设备
   */
  async register(data: RegisterDeviceRequest): Promise<Device> {
    return apiClient.post("/devices", data) as unknown as Promise<Device>;
  },

  /**
   * 获取设备列表
   */
  async list(params?: DeviceQuery): Promise<PaginatedResponse<Device>> {
    return apiClient.get("/devices", { params }) as unknown as Promise<PaginatedResponse<Device>>;
  },

  /**
   * 获取单个设备
   */
  async get(id: string): Promise<Device> {
    return apiClient.get(`/devices/${id}`) as unknown as Promise<Device>;
  },

  /**
   * 更新设备
   */
  async update(id: string, data: UpdateDeviceRequest): Promise<Device> {
    return apiClient.put(`/devices/${id}`, data) as unknown as Promise<Device>;
  },

  /**
   * 删除设备
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/devices/${id}`) as unknown as Promise<{ success: boolean }>;
  },
};