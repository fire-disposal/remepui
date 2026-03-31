import { apiClient } from "./client";
import type { AuditLog, AuditLogListResponse, AuditLogQuery } from "./types";

/**
 * 审计日志 API 服务
 * 仅管理员可用
 */
export const auditApi = {
  /**
   * 查询审计日志列表
   * GET /admin/audit-logs
   */
  async list(params?: AuditLogQuery): Promise<AuditLogListResponse> {
    return apiClient.get("/admin/audit-logs", { params }) as unknown as Promise<AuditLogListResponse>;
  },

  /**
   * 获取审计日志详情
   * GET /admin/audit-logs/:id
   */
  async get(id: string): Promise<AuditLog> {
    return apiClient.get(`/admin/audit-logs/${id}`) as unknown as Promise<AuditLog>;
  },
};
