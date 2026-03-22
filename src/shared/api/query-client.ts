import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query 客户端配置
 * 统一管理服务端状态、缓存和请求生命周期
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据新鲜度时间（5分钟内认为数据是新鲜的）
      staleTime: 1000 * 60 * 5,
      // 缓存保留时间（10分钟）
      gcTime: 1000 * 60 * 10,
      // 请求重试次数
      retry: 1,
      // 窗口获焦时不自动重新获取
      refetchOnWindowFocus: false,
      // 组件挂载时不自动重新获取
      refetchOnMount: false,
      // 网络重新连接时不自动重新获取
      refetchOnReconnect: false,
    },
    mutations: {
      // mutation 重试次数
      retry: 1,
    },
  },
});
