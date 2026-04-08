import { type ReactNode, useEffect, useMemo, useState, useCallback } from "react";
import {
  AppShell,
  Group,
  Text,
  Avatar,
  Menu,
  Stack,
  NavLink,
  Select,
  UnstyledButton,
  ThemeIcon,
  Badge,
  useMantineTheme,
  Box,
  Transition,
  Burger,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLogout, IconSwitch, IconSettings, IconUser, IconCheck, IconLock } from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../shared/store/auth";
import { useShellStore } from "../../shared/store/shell";
import { useAuth } from "../../shared/hooks/useAuth";
import { getShellOptions, SHELL_CONFIGS, ICON_MAP } from "../../shared/config/shells";
import { canAccessModule } from "../../shared/lib/permissions";
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
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const loading = useAuthStore((state) => state.loading);
  const { logout } = useAuth();

  // 外壳管理
  const currentShellId = useShellStore((state) => state.currentShellId);
  const currentShell = useShellStore((state) => state.currentShell);
  const setShell = useShellStore((state) => state.setShell);
  const isMobile = useMediaQuery("(max-width: 48em)");

  // 切换动画状态
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navbarOpened, { toggle: toggleNavbar, close: closeNavbar }] = useDisclosure(false);

  // 判断是否显示布局 - 所有 hooks 必须在条件渲染之前
  const isLoginPage = location.pathname === "/login";
  const isAuthenticated = !loading && !!token && !!user;
  const shouldShowLayout = !isLoginPage && isAuthenticated;

  const availablePaths = useMemo(
    () => currentShell.menuItems.map((item) => item.path),
    [currentShell.menuItems],
  );
  
  const getFallbackPath = useCallback(() => {
    if (!user) return "/login";
    for (const item of currentShell.menuItems) {
      if (canAccessModule(user, item.module)) {
        return item.path;
      }
    }
    // 没有任何权限，返回登录页
    return "/login";
  }, [currentShell.menuItems, user]);

  const fallbackPath = getFallbackPath();
  const isPathAllowed = availablePaths.includes(location.pathname);
  const shellTitleColor = currentShell.primaryColor === "gray" ? "dark.7" : `${currentShell.primaryColor}.7`;

  // 刷新或手动输入 URL 时，确保页面路径属于当前外壳且有权限
  useEffect(() => {
    if (shouldShowLayout && !isTransitioning) {
      if (!isPathAllowed) {
        navigate({ to: fallbackPath, replace: true });
        return;
      }
      
      const currentItem = currentShell.menuItems.find(item => item.path === location.pathname);
      if (currentItem && !canAccessModule(user, currentItem.module)) {
        navigate({ to: fallbackPath, replace: true });
      }
    }
  }, [shouldShowLayout, fallbackPath, isPathAllowed, isTransitioning, navigate, user, location.pathname, currentShell.menuItems]);

  // 切换外壳后，移动端自动收起导航
  useEffect(() => {
    closeNavbar();
  }, [currentShellId, closeNavbar]);

  // 未认证或登录页，直接渲染 children（不显示布局）
  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  // 处理外壳切换（无刷新）
  const handleShellChange = (newShellId: string | null) => {
    if (newShellId && newShellId !== currentShellId) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setShell(newShellId);
        setIsTransitioning(false);
        
        const paths = SHELL_CONFIGS[newShellId].menuItems.map(m => m.path);
        if (!paths.includes(location.pathname)) {
          navigate({ to: paths[0] || "/", replace: true });
        }
      }, 150);
    }
  };

  // 处理导航
  const handleNavigate = (path: string) => {
    navigate({ to: path });
    if (isMobile) {
      closeNavbar();
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
        collapsed: { mobile: !navbarOpened },
      }}
      padding="md"
    >
      {/* 顶栏 */}
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          {/* 左侧：LOGO + 标题 */}
          <Group gap="sm" wrap="nowrap">
            <Burger
              hiddenFrom="sm"
              opened={navbarOpened}
              onClick={toggleNavbar}
              size="sm"
              aria-label="切换导航菜单"
            />
            <UnstyledButton
              onClick={() => handleNavigate(fallbackPath)}
              style={{ padding: 0 }}
            >
              <Group gap="sm" wrap="nowrap">
                <Transition
                  mounted={!isTransitioning}
                  transition="scale"
                  duration={150}
                >
                  {(styles) => (
                    <ThemeIcon 
                      size="lg" 
                      radius="md" 
                      variant="light"
                      style={styles}
                    >
                      <Text style={{ fontSize: "20px" }}>{currentShell.logo}</Text>
                    </ThemeIcon>
                  )}
                </Transition>
                <Box visibleFrom="sm">
                  <Transition
                    mounted={!isTransitioning}
                    transition="fade"
                    duration={150}
                  >
                    {(styles) => (
                      <div style={styles}>
                        <Text size="sm" fw={600}>
                          {currentShell.title}
                        </Text>
                        <Text size="xs" c={shellTitleColor}>
                          {currentShell.description}
                        </Text>
                      </div>
                    )}
                  </Transition>
                </Box>
              </Group>
            </UnstyledButton>
          </Group>

          {/* 右侧：外壳选择 + 用户菜单 */}
          <Group gap="sm">
            <Select
              placeholder="切换视图"
              searchable
              clearable={false}
              data={getShellOptions()}
              value={currentShellId}
              onChange={handleShellChange}
              leftSection={<IconSwitch size={14} />}
              size="xs"
              visibleFrom="sm"
            />
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar color={currentShell.primaryColor} radius="xl" size="sm">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                    <Box visibleFrom="sm">
                      <Text size="sm" fw={500}>
                        {user?.username}
                      </Text>
                      <Badge size="xs" variant="light" color={user?.accessible_modules?.includes("*" as any) ? "red" : "gray"}>
                        {user?.accessible_modules?.includes("*" as any) ? "通配权限" : "普通用户"}
                      </Badge>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>账户</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>
                  {user?.username}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>操作</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                >
                  登出
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* 侧栏 */}
      <AppShell.Navbar 
        p="md" 
        style={{
          height: isMobile && navbarOpened ? '100vh' : undefined,
          maxHeight: isMobile && navbarOpened ? '100vh' : undefined,
          position: isMobile && navbarOpened ? 'fixed' : undefined,
          top: isMobile && navbarOpened ? 60 : undefined,
          zIndex: isMobile && navbarOpened ? 200 : undefined,
        }}
      >
        <Stack gap="md" style={{ height: '100%', overflow: 'hidden' }}>
          {/* 移动端外壳选择 */}
          <Box hiddenFrom="sm">
            <Select
              placeholder="切换视图"
              searchable
              clearable={false}
              data={getShellOptions()}
              value={currentShellId}
              onChange={handleShellChange}
              leftSection={<IconSwitch size={14} />}
              size="xs"
            />
          </Box>

          {/* 菜单滚动区域 */}
          <ScrollArea
            style={{ 
              flex: 1, 
              minHeight: 0,
              height: isMobile && navbarOpened ? 'calc(100vh - 180px)' : undefined,
            }}
            scrollbarSize={8}
            offsetScrollbars
            type="auto"
            styles={{
              viewport: {
                paddingBottom: '16px',
              },
            }}
          >
            <Transition
              mounted={!isTransitioning}
              transition="slide-right"
              duration={150}
            >
              {(styles) => (
                <Stack gap="xs" style={styles} pb="md">
                  {currentShell.menuItems.map((item) => {
                    const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
                    const hasAccess = canAccessModule(user, item.module);
                    
                    return (
                      <NavLink
                        key={item.id}
                        label={item.label}
                        leftSection={IconComponent ? <IconComponent size={isMobile ? 16 : 20} /> : null}
                        rightSection={!hasAccess ? <IconLock size={14} color="gray" /> : null}
                        onClick={() => hasAccess && handleNavigate(item.path)}
                        active={location.pathname === item.path}
                        disabled={!hasAccess}
                        style={{ 
                          cursor: hasAccess ? "pointer" : "not-allowed", 
                          borderRadius: "6px",
                          opacity: hasAccess ? 1 : 0.5,
                        }}
                        variant="light"
                        color={hasAccess ? theme.primaryColor : "gray"}
                      />
                    );
                  })}
                </Stack>
              )}
            </Transition>
          </ScrollArea>
        </Stack>
      </AppShell.Navbar>

      {/* 主内容区 */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};