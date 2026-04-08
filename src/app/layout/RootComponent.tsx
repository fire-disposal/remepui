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
  const authUser = useAuthStore((s) => s.user);
  const authToken = useAuthStore((s) => s.token);
  const [isHydrated, setIsHydrated] = useState(false);

  console.log('[RootComponent] State:', {
    isHydrated,
    authLoading,
    hasToken: !!authToken,
    hasUser: !!authUser,
    userModules: authUser?.accessible_modules
  });

  useEffect(() => {
    const doHydration = async () => {
      console.log('[RootComponent] Starting hydration...');
      try {
        hydrateAuth();
        hydrateShell();
        
        await new Promise(resolve => setTimeout(resolve, 0));
        
        console.log('[RootComponent] Hydration complete');
        setIsHydrated(true);
      } catch (error) {
        console.error('[RootComponent] Hydration failed:', error);
        setIsHydrated(true);
      }
    };
    
    doHydration();
  }, [hydrateAuth, hydrateShell]);

  if (!isHydrated) {
    console.log('[RootComponent] Showing: initializing');
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
    console.log('[RootComponent] Showing: restoring auth');
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">恢复登录状态...</Text>
        </Stack>
      </Center>
    );
  }

  console.log('[RootComponent] Rendering AppLayout');
  return (
    <AppLayout>
      <Outlet />
      <TokenExpiredModal />
    </AppLayout>
  );
}