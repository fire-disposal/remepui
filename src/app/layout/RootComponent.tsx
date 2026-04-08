import { useEffect, useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { AppLayout } from './AppLayout';
import { useAuthStore } from '../../shared/store/auth';
import { useShellStore } from '../../shared/store/shell';
import { TokenExpiredModal } from '../../shared/components/TokenExpiredModal';
import { Center, Loader, Text, Stack } from '@mantine/core';

/**
 * 根路由组件
 * 初始化认证和外壳状态
 */
export function RootComponent() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateShell = useShellStore((s) => s.hydrate);
  const authLoading = useAuthStore((s) => s.loading);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 统一在这里处理 hydration
    hydrateAuth();
    hydrateShell();
    
    // 标记 hydration 完成
    setIsHydrated(true);
  }, [hydrateAuth, hydrateShell]);

  // 等待 hydration 完成
  if (!isHydrated || authLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">正在加载...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <AppLayout>
      <Outlet />
      <TokenExpiredModal />
    </AppLayout>
  );
}