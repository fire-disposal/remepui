import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { dataApi, type AcknowledgeRequest, type ResolveRequest } from './data';
import type { DataQuery, DataRecord } from './types';

const WS_RECONNECT_DELAY = 3000;

interface UseDataSubscriptionOptions {
  query?: DataQuery;
  enabled?: boolean;
  wsUrl?: string;
  staleTime?: number;
}

interface UseDataSubscriptionResult {
  data: DataRecord[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isWsConnected: boolean;
  refetch: () => void;
}

/**
 * 实时数据订阅 Hook
 * 
 * 使用 TanStack Query 特性无感合并：
 * 1. 历史数据查询（HTTP）
 * 2. 实时数据推送（WebSocket）
 * 
 * 数据流：
 * HTTP历史数据 → 渲染 → WS推送新数据 → 合并到缓存 → 自动重新渲染
 */
export function useDataSubscription(options: UseDataSubscriptionOptions = {}): UseDataSubscriptionResult {
  const { query, enabled = true, wsUrl, staleTime = 30000 } = options;
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWsConnectedRef = useRef(false);

  const queryKey = ['data', query];

  const {
    data: queryData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await dataApi.query(query);
      return result.data;
    },
    enabled,
    staleTime,
  });

  const connectWebSocket = useCallback(() => {
    if (!wsUrl || !enabled) return;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to data stream');
        isWsConnectedRef.current = true;
      };

      ws.onmessage = (event) => {
        try {
          const newData: DataRecord = JSON.parse(event.data);
          
          queryClient.setQueryData<DataRecord[]>(queryKey, (oldData) => {
            if (!oldData) return [newData];
            
            const exists = oldData.some(
              (item) => 
                item.time === newData.time && 
                item.device_id === newData.device_id
            );
            
            if (exists) return oldData;
            
            return [newData, ...oldData].slice(0, 1000);
          });
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        isWsConnectedRef.current = false;
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected');
        isWsConnectedRef.current = false;
        wsRef.current = null;
        
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WS] Attempting to reconnect...');
            connectWebSocket();
          }, WS_RECONNECT_DELAY);
        }
      };
    } catch (error) {
      console.error('[WS] Failed to connect:', error);
    }
  }, [wsUrl, enabled, queryClient, queryKey]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    isWsConnectedRef.current = false;
  }, []);

  useEffect(() => {
    if (wsUrl && enabled) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [wsUrl, enabled, connectWebSocket, disconnectWebSocket]);

  return {
    data: queryData,
    isLoading,
    isFetching,
    error: error as Error | null,
    isWsConnected: isWsConnectedRef.current,
    refetch,
  };
}

export function useAlerts(params?: {
  patient_id?: string;
  data_type?: string;
  severity?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => dataApi.queryAlerts(params),
    staleTime: 10000,
  });
}

export function useAcknowledgeEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AcknowledgeRequest) => dataApi.acknowledgeEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useResolveEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ResolveRequest) => dataApi.resolveEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}