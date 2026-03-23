import { useState } from "react";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Box,
  Alert,
  Group,
  Divider,
  rem,
  ThemeIcon,
  useMantineTheme,
  useMantineColorScheme,
  Badge,
} from "@mantine/core";
import { IconAlertCircle, IconLock, IconUser } from "@tabler/icons-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useShellStore } from "../../../shared/store/shell";
import { logger } from "../../../shared/logger";

/**
 * 登录页面
 * - 响应外壳配置变化
 * - 简洁现代的设计
 * - 用户名/密码输入
 * - 错误处理
 * - 加载状态
 */
export const LoginPage = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const { login, isLoading } = useAuth();
  const currentShell = useShellStore((state) => state.currentShell);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const primaryColor = theme.colors[currentShell.primaryColor]?.[6] || theme.colors[theme.primaryColor][6];
  const isDark = colorScheme === "dark";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }

    try {
      logger.info("Login attempt", { username });
      await login(username, password);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "登录失败，请检查用户名和密码";
      setError(errorMsg);
      logger.error("Login failed", err);
    }
  };

  const iconSize = rem(20);

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: isDark
          ? `linear-gradient(180deg, ${theme.colors.dark[9]} 0%, ${theme.colors.dark[8]} 50%, ${theme.colors.dark[7]} 100%)`
          : `linear-gradient(180deg, ${theme.colors.gray[0]} 0%, ${theme.white} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 装饰性背景元素 */}
      <Box
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "50%",
          height: "50%",
          background: `radial-gradient(circle, ${primaryColor}20 0%, transparent 70%)`,
          borderRadius: "50%",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "40%",
          height: "40%",
          background: `radial-gradient(circle, ${theme.colors.teal[6]}15 0%, transparent 70%)`,
          borderRadius: "50%",
        }}
      />

      <Container size={420} style={{ position: "relative", zIndex: 1 }}>
        <Stack gap="xl">
          {/* Logo and Title */}
          <Box style={{ textAlign: "center" }}>
            <ThemeIcon
              size={80}
              radius="xl"
              variant="light"
              color={currentShell.primaryColor}
              style={{ marginBottom: rem(16) }}
            >
              <Text style={{ fontSize: rem(36) }}>{currentShell.logo}</Text>
            </ThemeIcon>
            <Title order={1} style={{ fontSize: rem(32), fontWeight: 700 }}>
              {currentShell.title}
            </Title>
            <Text c="dimmed" size="sm" mt={8}>
              {currentShell.description || currentShell.name}
            </Text>
          </Box>

          {/* Login Card */}
          <Paper
            p={30}
            radius="lg"
            style={{
              backgroundColor: isDark
                ? "rgba(38, 38, 38, 0.8)"
                : theme.white,
              backdropFilter: "blur(10px)",
              border: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
            }}
            shadow="md"
          >
            <form onSubmit={handleLogin}>
              <Stack gap="md">
                {/* Username Input */}
                <TextInput
                  label="用户名"
                  placeholder="请输入用户名"
                  leftSection={<IconUser size={iconSize} />}
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                  size="md"
                />

                {/* Password Input */}
                <PasswordInput
                  label="密码"
                  placeholder="请输入密码"
                  leftSection={<IconLock size={iconSize} />}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  disabled={isLoading}
                  required
                  size="md"
                />

                {/* Error Alert */}
                {error && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="登录失败"
                    color="red"
                    variant="light"
                    onClose={() => setError("")}
                  >
                    {error}
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  fullWidth
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || !username.trim() || !password.trim()}
                  size="md"
                  mt="md"
                  variant="gradient"
                  gradient={{ from: currentShell.primaryColor, to: currentShell.primaryColor, deg: 135 }}
                >
                  {isLoading ? "登录中..." : "登 录"}
                </Button>
              </Stack>
            </form>
          </Paper>

          <Divider />

          {/* Demo Info */}
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: isDark
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="sm" fw={600}>
                  默认管理员账户
                </Text>
                <Text size="sm" c="dimmed">
                  用户名: admin
                </Text>
                <Text size="sm" c="dimmed">
                  密码: admin123
                </Text>
              </Stack>
              <Badge color={currentShell.primaryColor} variant="light">
                DEV
              </Badge>
            </Group>
          </Paper>

          {/* Footer */}
          <Group justify="center">
            <Text size="xs" c="dimmed">
              © 2024 {currentShell.title}
            </Text>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};