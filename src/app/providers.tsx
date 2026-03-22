import { type ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/query-client";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 应用全局 Provider 包装器
 * 统一管理所有全局能力：
 * - Mantine UI 主题
 * - 通知系统
 * - 模态框
 * - TanStack Query 客户端
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};
