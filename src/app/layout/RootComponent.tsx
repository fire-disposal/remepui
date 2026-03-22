import { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { AppLayout } from './AppLayout';
import { useAuthStore } from '../../shared/store/auth';
import { useShellStore } from '../../shared/store/shell';

/**
 * 根路由组件
 * 初始化认证和外壳状态
 */
export function RootComponent() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateShell = useShellStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateShell();
  }, [hydrateAuth, hydrateShell]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
