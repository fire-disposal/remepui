import { apiClient } from "./client";
import type {
  DataRecord,
  DataReportRequest,
  DataReportResponse,
  PaginatedResponse,
  DataQuery,
} from "./types";

export interface AcknowledgeRequest {
  patient_id: string;
  time: string;
  device_id?: string;
}

export interface ResolveRequest {
  patient_id: string;
  time: string;
  device_id?: string;
}

/**
 * 数据 API 服务
 */
export const dataApi = {
  /**
   * 上报数据
   */
  async report(data: DataReportRequest): Promise<DataReportResponse> {
    return apiClient.post("/data", data) as unknown as Promise<DataReportResponse>;
  },

  /**
   * 查询数据
   */
  async query(params?: DataQuery): Promise<PaginatedResponse<DataRecord>> {
    return apiClient.get("/data", { params }) as unknown as Promise<PaginatedResponse<DataRecord>>;
  },

  /**
   * 查询活跃告警
   */
  async queryAlerts(params?: {
    patient_id?: string;
    data_type?: string;
    severity?: string;
    limit?: number;
  }): Promise<DataRecord[]> {
    return apiClient.get("/data/alerts", { params }) as unknown as Promise<DataRecord[]>;
  },

  /**
   * 确认事件
   */
  async acknowledgeEvent(data: AcknowledgeRequest): Promise<DataRecord> {
    return apiClient.post("/data/events/acknowledge", data) as unknown as Promise<DataRecord>;
  },

  /**
   * 解决事件
   */
  async resolveEvent(data: ResolveRequest): Promise<DataRecord> {
    return apiClient.post("/data/events/resolve", data) as unknown as Promise<DataRecord>;
  },
};