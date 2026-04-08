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
    const doHydration = async () => {
      try {
        hydrateAuth();
        hydrateShell();
        
        await new Promise(resolve => setTimeout(resolve, 0));
        
        setIsHydrated(true);
      } catch (error) {
        console.error('Hydration failed:', error);
        setIsHydrated(true);
      }
    };
    
    doHydration();
  }, [hydrateAuth, hydrateShell]);

  if (!isHydrated) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">初始化应用...</Text>
        </Stack>
      </Center>
    );
  }

  if (authLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">恢复登录状态...</Text>
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