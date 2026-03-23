import { apiClient } from "./client";
import type {
  Patient,
  PatientDetail,
  PatientProfile,
  PaginatedResponse,
  CreatePatientRequest,
  UpdatePatientRequest,
  UpdatePatientProfileRequest,
  PatientQuery,
} from "./types";

/**
 * 患者管理 API 服务
 */
export const patientApi = {
  /**
   * 创建患者
   */
  async create(data: CreatePatientRequest): Promise<Patient> {
    return apiClient.post("/patients", data) as unknown as Promise<Patient>;
  },

  /**
   * 获取患者列表
   */
  async list(params?: PatientQuery): Promise<PaginatedResponse<Patient>> {
    return apiClient.get("/patients", { params }) as unknown as Promise<PaginatedResponse<Patient>>;
  },

  /**
   * 获取单个患者
   */
  async get(id: string): Promise<Patient> {
    return apiClient.get(`/patients/${id}`) as unknown as Promise<Patient>;
  },

  /**
   * 获取患者详情
   */
  async getDetail(id: string): Promise<PatientDetail> {
    return apiClient.get(`/patients/${id}/detail`) as unknown as Promise<PatientDetail>;
  },

  /**
   * 更新患者
   */
  async update(id: string, data: UpdatePatientRequest): Promise<Patient> {
    return apiClient.put(`/patients/${id}`, data) as unknown as Promise<Patient>;
  },

  /**
   * 删除患者
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/patients/${id}`) as unknown as Promise<{ success: boolean }>;
  },

  /**
   * 获取患者档案
   */
  async getProfile(id: string): Promise<PatientProfile> {
    return apiClient.get(`/patients/${id}/profile`) as unknown as Promise<PatientProfile>;
  },

  /**
   * 更新患者档案
   */
  async updateProfile(id: string, data: UpdatePatientProfileRequest): Promise<PatientProfile> {
    return apiClient.put(`/patients/${id}/profile`, data) as unknown as Promise<PatientProfile>;
  },
};