import { RootRoute, Route, Router, redirect } from "@tanstack/react-router";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { PatientListPage } from "../modules/patients/pages/PatientListPage";
import { DeviceListPage } from "../modules/devices/pages/DeviceListPage";
import { BindingListPage } from "../modules/bindings/pages/BindingListPage";
import { DataPage } from "../modules/data/pages/DataPage";
import { UserListPage } from "../modules/users/pages/UserListPage";
import { ShellSettingsPage } from "../modules/settings/pages/ShellSettingsPage";
import { PressureUlcerPage } from "../modules/pressure-ulcer";
import { RolesPage } from "../modules/roles";
import { AuditLogsPage } from "../modules/audit-logs";
import { ModulesPage } from "../modules/modules";
import { BindingVisualPage } from "../modules/bindings-visual";
import { HealthTimelinePage } from "../modules/health-timeline";
import { RawDataPage } from "../modules/raw-data";
import { RootComponent } from "./layout/RootComponent";
import { useAuthStore } from "../shared/store/auth";
import { canAccessModule } from "../shared/lib/permissions";
import type { ModuleCode } from "../shared/api/types";

import { onAuthHydrationComplete } from "../shared/store/auth";

/**
 * 等待认证状态恢复（hydrate）
 * 使用事件订阅机制，避免轮询
 */
const waitForAuthHydration = async (): Promise<void> => {
  const state = useAuthStore.getState();
  
  if (!state.loading) {
    return;
  }
  
  return new Promise((resolve) => {
    // 增加超时保护，防止认证状态恢复永久挂起导致白屏
    const timeout = setTimeout(() => {
      console.warn("[ROUTER] Auth hydration timeout - resolving to prevent deadlock");
      resolve();
    }, 3000);

    onAuthHydrationComplete(() => {
      clearTimeout(timeout);
      resolve();
    });
  });
};

/**
 * 已登录检查函数（登录页使用）
 * 已登录用户访问登录页时重定向到有权限的模块
 */
const checkAlreadyLoggedIn = async () => {
  await waitForAuthHydration();
  
  const state = useAuthStore.getState();
  const token = state.token;
  const user = state.user;
  
  if (token && user) {
    const accessibleModules = user.accessible_modules || [];
    const fallbackPath = getFallbackPath(accessibleModules);
    throw redirect({ to: fallbackPath });
  }
};

/**
 * 模块权限检查函数
 * 确保用户有权限访问指定模块
 */
const checkModuleAccess = (module: ModuleCode) => async () => {
  await waitForAuthHydration();
  
  const state = useAuthStore.getState();
  const token = state.token;
  const user = state.user;
  
  if (!token) {
    throw redirect({ to: "/login" });
  }
  
  if (!canAccessModule(user, module)) {
    const accessibleModules = user?.accessible_modules || [];
    
    if (accessibleModules.length === 0 && !user?.is_system_role) {
      state.logout();
      throw redirect({ to: "/login" });
    }
    
    const fallbackPath = getFallbackPath(accessibleModules, user?.is_system_role);
    throw redirect({ to: fallbackPath });
  }
};

/**
 * 获取fallback路径
 * 当用户无权限访问当前模块时，重定向到有权限的模块
 * 
 * 如果用户没有任何权限：
 * - 系统角色：跳转到首页
 * - 普通用户：跳转到登录页并提示
 */
const getFallbackPath = (accessibleModules: string[], isSystemRole?: boolean): string => {
  // 系统角色或通配权限默认跳转到首页
  if (isSystemRole || accessibleModules.includes("*")) {
    return "/";
  }
  
  // 模块路径映射
  const modulePaths: Record<string, string> = {
    dashboard: "/",
    patients: "/patients",
    devices: "/devices",
    bindings: "/bindings",
    data: "/data",
    users: "/users",
    roles: "/roles",
    audit_logs: "/audit-logs",
    settings: "/settings/shell",
    pressure_ulcer: "/pressure-ulcer",
  };
  
  // 优先跳转到第一个有权限的模块
  for (const module of accessibleModules) {
    const path = modulePaths[module];
    if (path) {
      return path;
    }
  }
  
  // 没有任何权限，返回登录页（会提示联系管理员）
  return "/login";
};

// 导出供其他模块使用
export { getFallbackPath };

/**
 * 系统角色检查函数（已废弃，统一使用模块权限）
 * 仅检查用户是否拥有通配权限 "*"
 */
const checkSystemRole = async () => {
  await waitForAuthHydration();
  
  const state = useAuthStore.getState();
  const token = state.token;
  const user = state.user;
  
  if (!token) {
    throw redirect({ to: "/login" });
  }
  
  const hasWildcard = user?.accessible_modules?.includes("*" as ModuleCode);
  if (!hasWildcard) {
    throw redirect({ to: "/" });
  }
};

/**
 * 404 页面组件
 */
const NotFoundComponent = () => (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "60vh",
      gap: "16px"
    }}>
      <h1 style={{ fontSize: "72px", margin: 0, color: "#868e96" }}>404</h1>
      <p style={{ color: "#868e96", margin: 0 }}>页面不存在</p>
      <a 
        href="/" 
        style={{ 
          color: "#228be6", 
          textDecoration: "none",
          padding: "8px 16px",
          border: "1px solid #228be6",
          borderRadius: "4px"
        }}
      >
        返回首页
      </a>
    </div>
);

/**
 * 根路由
 */
const rootRoute = new RootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

/**
 * 用户管理路由 - 需要 users 模块权限
 */
const usersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UserListPage,
  beforeLoad: checkModuleAccess("users"),
});

/**
 * 角色管理路由 - 需要 roles 模块权限
 */
const rolesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/roles",
  component: RolesPage,
  beforeLoad: checkModuleAccess("roles"),
});

/**
 * 审计日志路由 - 需要 audit_logs 模块权限
 */
const auditLogsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/audit-logs",
  component: AuditLogsPage,
  beforeLoad: checkModuleAccess("audit_logs"),
});

/**
 * 模块权限路由 - 需要 roles 模块权限
 */
const modulesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/modules",
  component: ModulesPage,
  beforeLoad: checkModuleAccess("roles"),
});

/**
 * 可视化绑定路由 - 需要 bindings 模块权限
 */
const bindingVisualRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/bindings-visual",
  component: BindingVisualPage,
  beforeLoad: checkModuleAccess("bindings"),
});

/**
 * 健康时间轴路由 - 需要 data 模块权限
 */
const healthTimelineRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/health-timeline",
  component: HealthTimelinePage,
  beforeLoad: checkModuleAccess("data"),
});

/**
 * 原始数据路由 - 需要 data 模块权限
 */
const rawDataRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/raw-data",
  component: RawDataPage,
  beforeLoad: checkModuleAccess("data"),
});

/**
 * 患者管理路由 - 需要 patients 模块权限
 */
const patientsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/patients",
  component: PatientListPage,
  beforeLoad: checkModuleAccess("patients"),
});

/**
 * 设备管理路由 - 需要 devices 模块权限
 */
const devicesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/devices",
  component: DeviceListPage,
  beforeLoad: checkModuleAccess("devices"),
});

/**
 * 绑定关系路由 - 需要 bindings 模块权限
 */
const bindingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/bindings",
  component: BindingListPage,
  beforeLoad: checkModuleAccess("bindings"),
});

/**
 * 数据查询路由 - 需要 data 模块权限
 */
const dataRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/data",
  component: DataPage,
  beforeLoad: checkModuleAccess("data"),
});

/**
 * 外壳设置路由 - 需要 settings 模块权限
 */
const settingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/settings/shell",
  component: ShellSettingsPage,
  beforeLoad: checkModuleAccess("settings"),
});

/**
 * 登录页面路由
 */
const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: checkAlreadyLoggedIn,
});

/**
 * 首页路由（仪表板）
 */
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
  beforeLoad: checkModuleAccess("dashboard"),
});

/**
 * 压力性损伤仿真教学路由 - 需要 pressure_ulcer 模块权限
 */
const pressureUlcerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/pressure-ulcer",
  component: PressureUlcerPage,
  beforeLoad: checkModuleAccess("pressure_ulcer"),
});

/**
 * 创建路由树
 */
const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
  rolesRoute,
  auditLogsRoute,
  modulesRoute,
  bindingVisualRoute,
  healthTimelineRoute,
  rawDataRoute,
  patientsRoute,
  devicesRoute,
  bindingsRoute,
  dataRoute,
  settingsRoute,
  pressureUlcerRoute,
  loginRoute,
]);

/**
 * 创建路由器实例
 */
export const router = new Router({
  routeTree,
  defaultPreload: "intent",
  notFoundMode: "root",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}