import { useEffect, useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { AppLayout } from './AppLayout';
import { useAuthStore } from '../../shared/store/auth';
import { useShellStore } from '../../shared/store/shell';
import { TokenExpiredModal } from '../../shared/components/TokenExpiredModal';
import { Center, Loader, Text, Stack, Button } from '@mantine/core';

const HYDRATION_TIMEOUT_MS = 8000;

/**
 * 根路由组件
 * 初始化认证和外壳状态
 */
export function RootComponent() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateShell = useShellStore((s) => s.hydrate);
  const authLoading = useAuthStore((s) => s.loading);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false);

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

  useEffect(() => {
    if (isHydrated && !authLoading) {
      setHydrationTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (!isHydrated || authLoading) {
        console.error('[LIFECYCLE] Hydration/auth loading timeout', {
          isHydrated,
          authLoading,
          timeoutMs: HYDRATION_TIMEOUT_MS,
        });
        setHydrationTimedOut(true);
      }
    }, HYDRATION_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [isHydrated, authLoading]);

  if (hydrationTimedOut) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Text fw={600}>应用初始化超时</Text>
          <Text c="dimmed" ta="center">
            可能是本地缓存、鉴权恢复或静态资源版本不一致导致。请先尝试硬刷新。
          </Text>
          <Button onClick={() => window.location.reload()}>重新加载</Button>
        </Stack>
      </Center>
    );
  }

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
