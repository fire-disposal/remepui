import { type ReactNode, useEffect } from "react";
import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/query-client";
import { ErrorBoundary } from "../shared/components";
import { useShellStore } from "../shared/store/shell";

interface AppProvidersProps {
  children: ReactNode;
}

// 自定义灰色色阶，让 dimmed 颜色在浅色模式下更清晰
const customGray: MantineColorsTuple = [
  "#f8f9fa", // 0 - 最浅
  "#f1f3f5", // 1
  "#e9ecef", // 2
  "#dee2e6", // 3
  "#ced4da", // 4
  "#adb5bd", // 5
  "#6c757d", // 6 - dimmed 使用这个，比默认更深
  "#495057", // 7
  "#343a40", // 8
  "#212529", // 9 - 最深
];

// 自定义暗色色阶，提升 dark 模式下 dimmed 文本可读性
const customDark: MantineColorsTuple = [
  "#d5dae3",
  "#c2c9d6",
  "#adb7c8",
  "#8f9ab0",
  "#727f97",
  "#5b677d",
  "#444f63",
  "#313a4d",
  "#242c3d",
  "#171d2a",
];

/**
 * 创建 Mantine 主题
 */
function createAppTheme(primaryColor: string) {
  return createTheme({
    primaryColor,
    autoContrast: true,
    luminanceThreshold: 0.25,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    headings: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    defaultRadius: "md",
    colors: {
      gray: customGray,
      dark: customDark,
    },
  });
}

/**
 * 外壳主题提供者
 * 根据当前外壳配置动态更新主题
 * 
 * 注意：hydration 移至 RootComponent 统一处理
 */
function ShellThemeProvider({ children }: { children: ReactNode }) {
  const currentShell = useShellStore((state) => state.currentShell);

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
