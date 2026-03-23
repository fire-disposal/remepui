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
} from "@mantine/core";
import { IconAlertCircle, IconLock, IconUser, IconHeartbeat } from "@tabler/icons-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { logger } from "../../../shared/logger";

/**
 * 登录页面
 * - 简洁的设计
 * - 用户名/密码输入
 * - 错误处理
 * - 加载状态
 */
export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container size={420}>
        <Stack gap="xl">
          {/* Logo and Title */}
          <Box style={{ textAlign: "center" }}>
            <ThemeIcon
              size={80}
              radius="xl"
              variant="white"
              style={{ marginBottom: rem(16) }}
            >
              <IconHeartbeat size={48} color="#667eea" />
            </ThemeIcon>
            <Title order={1} style={{ fontSize: rem(32), fontWeight: 700, color: "white" }}>
              Remipedia
            </Title>
            <Text color="white" size="sm" mt={8} opacity={0.9}>
              IoT 健康数据平台
            </Text>
          </Box>

          {/* Login Card */}
          <Paper p={30} radius="lg" withBorder shadow="lg">
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
                >
                  {isLoading ? "登录中..." : "登 录"}
                </Button>
              </Stack>
            </form>
          </Paper>

          <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }} />

          {/* Demo Info */}
          <Paper
            p="md"
            radius="md"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "none" }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="sm" fw={600} color="white">
                  默认管理员账户
                </Text>
                <Text size="sm" color="white" opacity={0.9}>
                  用户名: admin
                </Text>
                <Text size="sm" color="white" opacity={0.9}>
                  密码: admin123
                </Text>
              </Stack>
              <Box
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "4px",
                }}
              >
                <Text size="xs" fw={600}>
                  DEV
                </Text>
              </Box>
            </Group>
          </Paper>

          {/* Footer */}
          <Group justify="center">
            <Text size="xs" color="white" opacity={0.7}>
              © 2024 Remipedia IoT Health Platform
            </Text>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};