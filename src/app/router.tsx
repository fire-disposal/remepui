import { RootRoute, Route, Router, redirect, NotFoundRoute } from "@tanstack/react-router";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { PatientListPage } from "../modules/patients/pages/PatientListPage";
import { DeviceListPage } from "../modules/devices/pages/DeviceListPage";
import { BindingListPage } from "../modules/bindings/pages/BindingListPage";
import { DataPage } from "../modules/data/pages/DataPage";
import { UserListPage } from "../modules/users/pages/UserListPage";
import { ShellSettingsPage } from "../modules/settings/pages/ShellSettingsPage";
import { PressureUlcerPage } from "../modules/pressure-ulcer";
import { RootComponent } from "./layout/RootComponent";
import { useAuthStore } from "../shared/store/auth";

/**
 * 认证检查函数
 */
const checkAuth = () => {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw redirect({ to: "/login" });
  }
};

/**
 * 管理员权限检查函数
 */
const checkAdmin = () => {
  const token = useAuthStore.getState().token;
  const user = useAuthStore.getState().user;
  
  if (!token) {
    throw redirect({ to: "/login" });
  }
  
  if (user?.role !== "admin") {
    throw redirect({ to: "/" });
  }
};

/**
 * 已登录检查函数（登录页使用）
 */
const checkAlreadyLoggedIn = () => {
  const token = useAuthStore.getState().token;
  if (token) {
    throw redirect({ to: "/" });
  }
};

/**
 * 根路由
 */
const rootRoute = new RootRoute({
  component: RootComponent,
});

/**
 * 首页路由 - 需要认证
 */
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
  beforeLoad: checkAuth,
});

/**
 * 用户管理路由 - 需要管理员权限
 */
const usersRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UserListPage,
  beforeLoad: checkAdmin,
});

/**
 * 患者管理路由 - 需要认证
 */
const patientsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/patients",
  component: PatientListPage,
  beforeLoad: checkAuth,
});

/**
 * 设备管理路由 - 需要认证
 */
const devicesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/devices",
  component: DeviceListPage,
  beforeLoad: checkAuth,
});

/**
 * 绑定关系路由 - 需要认证
 */
const bindingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/bindings",
  component: BindingListPage,
  beforeLoad: checkAuth,
});

/**
 * 数据查询路由 - 需要认证
 */
const dataRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/data",
  component: DataPage,
  beforeLoad: checkAuth,
});

/**
 * 外壳设置路由 - 需要认证
 */
const settingsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/settings/shell",
  component: ShellSettingsPage,
  beforeLoad: checkAuth,
});

/**
 * 登录页路由 - 公开
 */
const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: checkAlreadyLoggedIn,
});

/**
 * 压力性损伤仿真教学路由 - 需要认证
 */
const pressureUlcerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/pressure-ulcer",
  component: PressureUlcerPage,
  beforeLoad: checkAuth,
});

/**
 * 404 路由
 */
const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: () => (
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
  ),
});

/**
 * 创建路由树
 */
const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
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
  notFoundRoute,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}