import { type ReactNode, useState } from "react";
import {
  AppShell,
  Group,
  Text,
  Container,
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
} from "@mantine/core";
import { IconLogout, IconSwitch, IconSettings, IconUser, IconCheck } from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../shared/store/auth";
import { useShellStore } from "../../shared/store/shell";
import { useAuth } from "../../shared/hooks/useAuth";
import { getShellOptions, SHELL_CONFIGS, ICON_MAP } from "../../shared/config/shells";
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
  const { logout } = useAuth();

  // 外壳管理
  const currentShellId = useShellStore((state) => state.currentShellId);
  const currentShell = useShellStore((state) => state.currentShell);
  const setShell = useShellStore((state) => state.setShell);

  // 切换动画状态
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 只在登录页不显示布局
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage || !token || !user) {
    return <>{children}</>;
  }

  // 处理外壳切换（无刷新）
  const handleShellChange = (newShellId: string | null) => {
    if (newShellId && newShellId !== currentShellId) {
      setIsTransitioning(true);
      
      // 使用 setTimeout 让动画有时间执行
      setTimeout(() => {
        setShell(newShellId);
        setIsTransitioning(false);
        
        // 如果当前路径在新外壳的菜单中不存在，导航到首页
        const paths = SHELL_CONFIGS[newShellId].menuItems.map(m => m.path);
        if (!paths.includes(location.pathname)) {
          navigate({ to: "/" });
        }
      }, 150);
    }
  };

  // 处理导航
  const handleNavigate = (path: string) => {
    navigate({ to: path });
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
              onClick={() => handleNavigate("/")}
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
                        <Text size="xs" c="dimmed">
                          {currentShell.name}
                        </Text>
                      </div>
                    )}
                  </Transition>
                </Box>
              </Group>
            </UnstyledButton>
          </Group>

          {/* 右侧：外壳切换 + 用户菜单 */}
          <Group gap="md" wrap="nowrap">
            {/* 外壳选择下拉 */}
            <Box visibleFrom="sm">
              <Select
                placeholder="切换视图"
                searchable
                clearable={false}
                data={getShellOptions()}
                value={currentShellId}
                onChange={handleShellChange}
                leftSection={<IconSwitch size={18} />}
                style={{ minWidth: 180 }}
                size="sm"
                renderOption={({ option, checked }) => (
                  <Group justify="space-between" flex={1}>
                    <Group gap="xs">
                      <Text>
                        {SHELL_CONFIGS[option.value]?.logo || "📄"}
                      </Text>
                      <Text size="sm">{option.label}</Text>
                    </Group>
                    {checked && (
                      <IconCheck size={16} color={theme.colors[theme.primaryColor][6]} />
                    )}
                  </Group>
                )}
              />
            </Box>

            {/* 用户菜单 */}
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <UnstyledButton
                  style={{ padding: "4px 8px", borderRadius: "4px" }}
                >
                  <Group gap="xs" wrap="nowrap">
                    <Avatar name={user.username} radius="xl" size="sm" color={theme.primaryColor} />
                    <Box visibleFrom="sm" flex={1}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {user.username}
                      </Text>
                    </Box>
                    {user.role === "admin" && (
                      <Box visibleFrom="sm">
                        <Badge size="xs" color="red" variant="light">
                          管理员
                        </Badge>
                      </Box>
                    )}
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={14} />} disabled>
                  个人信息
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />} disabled>
                  设置
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                  color="red"
                >
                  退出登录
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* 侧栏 */}
      <AppShell.Navbar p="md">
        <Transition
          mounted={!isTransitioning}
          transition="slide-right"
          duration={150}
        >
          {(styles) => (
            <Stack gap="xs" style={styles}>
              {currentShell.menuItems.map((item) => {
                const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
                return (
                  <NavLink
                    key={item.id}
                    label={item.label}
                    leftSection={IconComponent ? <IconComponent size={20} /> : null}
                    onClick={() => handleNavigate(item.path)}
                    active={location.pathname === item.path}
                    style={{ cursor: "pointer", borderRadius: "6px" }}
                    variant="light"
                    color={theme.primaryColor}
                  />
                );
              })}
            </Stack>
          )}
        </Transition>
      </AppShell.Navbar>

      {/* 主区域 */}
      <AppShell.Main>
        <Container size="lg">{children}</Container>
      </AppShell.Main>
    </AppShell>
  );
};