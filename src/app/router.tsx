import { RootRoute, Route, Router } from "@tanstack/react-router";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { RootComponent } from "./layout/RootComponent";
import { IndexComponent } from "./routes-components/IndexComponent";

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
  component: IndexComponent,
});

/**
 * 登录页路由 - 公开
 */
const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

/**
 * 创建路由树
 */
const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

/**
 * 创建路由器实例
 */
export const router = new Router({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
