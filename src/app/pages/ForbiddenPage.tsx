import { Container, Title, Text, Stack, Button, Group, Alert } from "@mantine/core";
import { IconLock, IconHome, IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { usePermission } from "../../shared/lib/permissions";

/**
 * 无权限页面
 * 当用户尝试访问没有权限的模块时显示
 */
export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user, getAccessibleModules } = usePermission();
  const accessibleModules = getAccessibleModules();

  const handleGoHome = () => {
    navigate({ to: "/" });
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg" align="center">
        <IconLock size={80} color="var(--mantine-color-gray-5)" />
        
        <Title order={1} ta="center">
          访问受限
        </Title>
        
        <Text size="lg" color="dimmed" ta="center">
          您没有权限访问此页面
        </Text>

        {user && (
          <Alert color="blue" variant="light" w="100%">
            <Stack gap="xs">
              <Text fw={500}>当前用户：{user.username}</Text>
              {accessibleModules.length > 0 ? (
                <Text size="sm">
                  可访问模块：{accessibleModules.join(", ")}
                </Text>
              ) : (
                <Text size="sm" color="red">
                  您当前没有任何模块访问权限，请联系管理员
                </Text>
              )}
            </Stack>
          </Alert>
        )}

        <Group gap="md">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleGoBack}
          >
            返回上一页
          </Button>
          <Button
            leftSection={<IconHome size={16} />}
            onClick={handleGoHome}
          >
            返回首页
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};