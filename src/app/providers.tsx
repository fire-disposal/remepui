import { type ReactNode, useEffect } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/query-client";
import { ErrorBoundary } from "../shared/components";
import { useShellStore } from "../shared/store/shell";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * 创建 Mantine 主题
 */
function createAppTheme(primaryColor: string) {
  return createTheme({
    primaryColor,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    headings: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    defaultRadius: "md",
  });
}

/**
 * 外壳主题提供者
 * 根据当前外壳配置动态更新主题
 */
function ShellThemeProvider({ children }: { children: ReactNode }) {
  const currentShell = useShellStore((state) => state.currentShell);
  const hydrate = useShellStore((state) => state.hydrate);

  // 应用启动时恢复外壳状态
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 根据外壳配置创建主题
  const theme = createAppTheme(currentShell.primaryColor);

  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}

/**
 * 应用全局 Provider 包装器
 * 统一管理所有全局能力：
 * - 错误边界
 * - 外壳主题（动态 Mantine 颜色）
 * - 通知系统
 * - 模态框
 * - TanStack Query 客户端
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ErrorBoundary>
      <ShellThemeProvider>
        <ModalsProvider>
          <Notifications position="top-right" />
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ModalsProvider>
      </ShellThemeProvider>
    </ErrorBoundary>
  );
};