/**
 * Shared 模块统一导出
 */

// API
export * from "./api";

// 组件
export { ErrorBoundary } from "./components/ErrorBoundary";
export { ModuleGuard, WildcardGuard, usePermission } from "./components/PermissionGuard";

// 配置
export * from "./config";

// Hooks
export * from "./hooks";

// Store
export { useAuthStore } from "./store/auth";
export type { User as AuthUser, AuthState } from "./store/auth";
export { useShellStore } from "./store/shell";
export type { ShellState } from "./store/shell";

// Logger
export { logger } from "./logger";

// UI
export { toast } from "./ui/toast";