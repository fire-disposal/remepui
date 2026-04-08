import { apiClient } from "./client";
import type { RawDataQuery, RawDataQueryResponse } from "./types";

/**
 * 原始数据 API 服务
 */
export const rawDataApi = {
  /**
   * 查询原始数据
   * GET /ingest/raw
   */
  async query(params?: RawDataQuery): Promise<RawDataQueryResponse> {
    return apiClient.get("/ingest/raw", { params }) as unknown as Promise<RawDataQueryResponse>;
  },

  /**
   * 导出原始数据（批量下载）
   * GET /ingest/raw/export
   */
  async export(params?: RawDataQuery): Promise<Blob> {
    const response = await fetch('/api/v1/ingest/raw?' + new URLSearchParams(params as any), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },
};