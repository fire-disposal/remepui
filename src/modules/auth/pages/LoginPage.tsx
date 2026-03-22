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
} from "@mantine/core";
import { IconAlertCircle, IconLock, IconUser } from "@tabler/icons-react";
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
      setError("Please enter both username and password");
      return;
    }

    try {
      logger.info("Login attempt", { username });
      await login(username, password);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
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
            <Box style={{ fontSize: rem(48), marginBottom: rem(16) }}>🎯</Box>
            <Title order={1} style={{ fontSize: rem(32), fontWeight: 700 }}>
              RemepUI
            </Title>
            <Text color="dimmed" size="sm" mt={8}>
              Sign in to your account
            </Text>
          </Box>

          {/* Login Card */}
          <Paper p={30} radius="lg" withBorder shadow="lg">
            <form onSubmit={handleLogin}>
              <Stack gap="md">
                {/* Username Input */}
                <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  leftSection={<IconUser size={iconSize} />}
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                />

                {/* Password Input */}
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  leftSection={<IconLock size={iconSize} />}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  disabled={isLoading}
                  required
                />

                {/* Error Alert */}
                {error && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Login Failed"
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
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </Stack>
            </form>
          </Paper>

          <Divider />

          {/* Demo Info */}
          <Paper
            p="md"
            radius="md"
            style={{ backgroundColor: "#e7f5ff", border: "1px solid #a5d8ff" }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="sm" fw={600}>
                  Demo Mode
                </Text>
                <Text size="sm" color="dimmed">
                  Use any credentials to test
                </Text>
              </Stack>
              <Box
                style={{
                  backgroundColor: "#0066cc",
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
            <Text size="xs" color="dimmed">
              © 2024 RemepUI. All rights reserved.
            </Text>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};
