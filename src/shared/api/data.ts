import { apiClient } from "./client";
import type {
  DataRecord,
  DataReportRequest,
  DataReportResponse,
  PaginatedResponse,
  DataQuery,
} from "./types";

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
};