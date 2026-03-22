import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Grid,
  Card,
  Group,
  Button,
} from "@mantine/core";
import { useAuthStore } from "../../../shared/store/auth";
import { logger } from "../../../shared/logger";

/**
 * 仪表板页面
 * - 显示欢迎信息
 * - 用户信息
 * - 导航到其他功能
 */
export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  logger.info("Dashboard page rendered", { username: user?.username });

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* 欢迎部分 */}
        <div>
          <Title order={1}>Dashboard</Title>
          <Text color="dimmed" mt={8}>
            Welcome back, <strong>{user?.username}</strong>!
          </Text>
        </div>

        {/* 用户信息卡片 */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md">
              <Stack gap="sm">
                <Text fw={600} size="sm" color="dimmed" tt="uppercase">
                  Username
                </Text>
                <Text fw={700} size="lg">
                  {user?.username}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md">
              <Stack gap="sm">
                <Text fw={600} size="sm" color="dimmed" tt="uppercase">
                  User ID
                </Text>
                <Text fw={700} size="lg">
                  {user?.id}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md">
              <Stack gap="sm">
                <Text fw={600} size="sm" color="dimmed" tt="uppercase">
                  Status
                </Text>
                <Text fw={700} size="lg" c="green">
                  Authenticated
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md">
              <Stack gap="sm">
                <Text fw={600} size="sm" color="dimmed" tt="uppercase">
                  Roles
                </Text>
                <Text fw={700} size="lg">
                  {user?.roles?.length ? user.roles.join(", ") : "User"}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* 功能卡片 */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3}>Getting Started</Title>
              <Text color="dimmed" size="sm" mt={4}>
                Your application is fully set up with authentication, routing,
                and state management.
              </Text>
            </div>

            <Stack gap="sm">
              <Text size="sm">✅ TanStack Router with type-safe routes</Text>
              <Text size="sm">✅ JWT authentication with Zustand store</Text>
              <Text size="sm">✅ Axios with request/response interceptors</Text>
              <Text size="sm">✅ Mantine UI components and theme</Text>
              <Text size="sm">
                ✅ TanStack Query for server state management
              </Text>
              <Text size="sm">✅ Logger and Toast notification system</Text>
              <Text size="sm">✅ Dynamic system shell configuration</Text>
            </Stack>

            <Group mt="md">
              <Button variant="light" size="sm" disabled>
                Documentation
              </Button>
              <Button variant="light" size="sm" disabled>
                Examples
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* 下一步 */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{ backgroundColor: "#e7f5ff", borderColor: "#a5d8ff" }}
        >
          <Stack gap="md">
            <Title order={4}>Next Steps</Title>
            <Stack gap="sm">
              <Text size="sm">
                1. <strong>Connect Backend:</strong> Update API_BASE_URL in
                shared/api/client.ts
              </Text>
              <Text size="sm">
                2. <strong>Create API Services:</strong> Add services in
                shared/api/ directory
              </Text>
              <Text size="sm">
                3. <strong>Build Pages:</strong> Create pages in modules/ with
                business logic
              </Text>
              <Text size="sm">
                4. <strong>Add Routes:</strong> Create route files in
                app/routes/
              </Text>
              <Text size="sm">
                5. <strong>Configure Shells:</strong> Customize shells in
                shared/config/shells.ts
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
