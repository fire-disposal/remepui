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
      try {
        console.log('[useDataSubscription] Fetching data with query:', query);
        const result = await dataApi.query(query);
        console.log('[useDataSubscription] API response:', result);
        
        if (!result) {
          console.warn('[useDataSubscription] Empty result');
          return [];
        }
        
        if (Array.isArray(result)) {
          console.log('[useDataSubscription] Result is array, length:', result.length);
          return result;
        }
        
        if (result.data && Array.isArray(result.data)) {
          console.log('[useDataSubscription] Result has data field, length:', result.data.length);
          return result.data;
        }
        
        console.warn('[useDataSubscription] Unexpected result format:', typeof result);
        return [];
      } catch (err) {
        console.error('[useDataSubscription] Query error:', err);
        throw err;
      }
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