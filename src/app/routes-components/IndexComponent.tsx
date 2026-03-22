import { useEffect } from "react";
import { DashboardPage } from "../../modules/dashboard/pages/DashboardPage";
import { useAuthStore } from "../../shared/store/auth";

/**
 * 首页路由组件
 * 检查认证状态，未认证时重定向到登录页
 */
export function IndexComponent() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
  }, [token]);

  if (!token) {
    return null;
  }

  return <DashboardPage />;
}
