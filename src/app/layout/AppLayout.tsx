import { type ReactNode, useEffect } from "react";
import {
  AppShell,
  Group,
  Text,
  Container,
  Avatar,
  Menu,
  Stack,
  NavLink,
  Box,
  Select,
  UnstyledButton,
} from "@mantine/core";
import { IconLogout, IconSwitch } from "@tabler/icons-react";
import { useLocation } from "@tanstack/react-router";
import { useAuthStore } from "../../shared/store/auth";
import { useShellStore } from "../../shared/store/shell";
import { useAuth } from "../../shared/hooks/useAuth";
import { getShellOptions } from "../../shared/config/shells";
import { logger } from "../../shared/logger";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * 应用全局布局
 * - 顶栏：LOGO + 标题（左）| 外壳选择 + 用户菜单（右）
 * - 侧栏：动态菜单项（根据外壳配置）
 * - 主区域：内容区
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { logout } = useAuth();

  // 外壳管理
  const currentShellId = useShellStore((state) => state.currentShellId);
  const currentShell = useShellStore((state) => state.currentShell);
  const setShell = useShellStore((state) => state.setShell);
  const hydrate = useShellStore((state) => state.hydrate);

  // 应用启动时恢复外壳配置
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 只在登录页不显示布局
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage || !token || !user) {
    return <>{children}</>;
  }

  // 处理外壳切换
  const handleShellChange = (newShellId: string | null) => {
    if (newShellId && newShellId !== currentShellId) {
      setShell(newShellId);
      // 延迟刷新以确保状态更新
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      logger.error("Logout error", err);
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      {/* 顶栏 */}
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          {/* 左侧：LOGO + 标题 */}
          <Group gap="sm" wrap="nowrap">
            <UnstyledButton
              onClick={() => {
                window.location.href = "/";
              }}
              style={{ padding: 0 }}
            >
              <Group gap="sm" wrap="nowrap">
                <Box style={{ fontSize: "28px" }}>{currentShell.logo}</Box>
                <div>
                  <Text size="sm" fw={500}>
                    {currentShell.title}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {currentShell.name}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          </Group>

          {/* 右侧：外壳切换 + 用户菜单 */}
          <Group gap="md" wrap="nowrap">
            {/* 外壳选择下拉 */}
            <Select
              placeholder="Switch Shell"
              searchable
              clearable={false}
              data={getShellOptions()}
              value={currentShellId}
              onChange={handleShellChange}
              leftSection={<IconSwitch size={18} />}
              style={{ minWidth: 200 }}
              size="sm"
            />

            {/* 用户菜单 */}
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <UnstyledButton
                  style={{ padding: "4px 8px", borderRadius: "4px" }}
                >
                  <Group gap="xs" wrap="nowrap">
                    <Avatar name={user.username} radius="xl" size="sm" />
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {user.username}
                      </Text>
                    </div>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item disabled>Profile</Menu.Item>
                <Menu.Item disabled>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                  color="red"
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* 侧栏 */}
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {currentShell.menuItems.map((item) => (
            <NavLink
              key={item.id}
              label={
                <Group gap="sm" wrap="nowrap">
                  <Box style={{ fontSize: "18px" }}>{item.icon || "📄"}</Box>
                  <span>{item.label}</span>
                </Group>
              }
              onClick={() => {
                window.location.href = item.path;
              }}
              active={location.pathname === item.path}
              style={{ cursor: "pointer", borderRadius: "6px" }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* 主区域 */}
      <AppShell.Main>
        <Container size="lg">{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
};
