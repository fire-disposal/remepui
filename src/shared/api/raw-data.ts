import { apiClient } from "./client";
import type { RawDataQuery, RawDataQueryResponse, RawDataDetail } from "./types";

export type ExportFormat = 'json' | 'csv';

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
   * 获取单条原始数据详情（包含完整原始字节）
   * GET /ingest/raw/{id}
   */
  async getDetail(id: string): Promise<RawDataDetail> {
    return apiClient.get(`/ingest/raw/${id}`) as unknown as Promise<RawDataDetail>;
  },

  /**
   * 导出原始数据
   * GET /ingest/raw/export
   * @param params - 查询参数
   * @param format - 导出格式 (json 或 csv)
   */
  async export(params?: RawDataQuery, format: ExportFormat = 'json'): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    const searchParams = new URLSearchParams();
    
    if (params?.source) searchParams.append('source', params.source);
    if (params?.serial_number) searchParams.append('serial_number', params.serial_number);
    if (params?.device_type) searchParams.append('device_type', params.device_type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.start_time) searchParams.append('start_time', params.start_time);
    if (params?.end_time) searchParams.append('end_time', params.end_time);
    searchParams.append('format', format);
    
    const response = await fetch('/api/v1/ingest/raw/export?' + searchParams.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  },
};