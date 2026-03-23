import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  ThemeIcon,
  Badge,
  Card,
  SimpleGrid,
  Button,
  Textarea,
  Divider,
  Code,
  Box,
} from "@mantine/core";
import {
  IconPalette,
  IconCheck,
  IconColorSwatch,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useShellStore } from "../../../shared/store/shell";
import { SHELL_CONFIGS, getShellOptions, ICON_MAP } from "../../../shared/config/shells";
import { useMantineTheme } from "@mantine/core";

/**
 * 外壳设置页面
 * 展示所有可用的外壳配置，允许用户切换
 */
export const ShellSettingsPage = () => {
  const theme = useMantineTheme();
  const currentShellId = useShellStore((state) => state.currentShellId);
  const setShell = useShellStore((state) => state.setShell);

  const shells = Object.values(SHELL_CONFIGS);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* 标题 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconPalette size={28} />
                外壳设置
              </Group>
            </Title>
            <Text color="dimmed" size="sm" mt={4}>
              选择不同的外壳来改变应用的外观和功能
            </Text>
          </div>
        </Group>

        {/* 当前外壳信息 */}
        <Paper p="md" radius="md" withBorder>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light">
              <Text style={{ fontSize: "28px" }}>
                {SHELL_CONFIGS[currentShellId]?.logo}
              </Text>
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Group gap="xs">
                <Text fw={600}>{SHELL_CONFIGS[currentShellId]?.title}</Text>
                <Badge variant="light" color={theme.primaryColor}>
                  当前外壳
                </Badge>
              </Group>
              <Text size="sm" color="dimmed">
                {SHELL_CONFIGS[currentShellId]?.description}
              </Text>
            </div>
            <Badge color={SHELL_CONFIGS[currentShellId]?.primaryColor}>
              {SHELL_CONFIGS[currentShellId]?.primaryColor}
            </Badge>
          </Group>
        </Paper>

        {/* 外壳列表 */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {shells.map((shell) => {
            const isActive = shell.id === currentShellId;
            return (
              <Card
                key={shell.id}
                shadow={isActive ? "sm" : "xs"}
                padding="lg"
                radius="md"
                withBorder
                style={{
                  borderColor: isActive
                    ? theme.colors[theme.primaryColor][5]
                    : undefined,
                  borderWidth: isActive ? 2 : 1,
                }}
              >
                <Group justify="space-between" mb="md">
                  <Group>
                    <ThemeIcon
                      size="lg"
                      radius="md"
                      variant="light"
                      color={shell.primaryColor}
                    >
                      <Text style={{ fontSize: "20px" }}>{shell.logo}</Text>
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{shell.name}</Text>
                      <Text size="xs" color="dimmed">
                        {shell.title}
                      </Text>
                    </div>
                  </Group>
                  {isActive && (
                    <IconCheck
                      size={20}
                      color={theme.colors[theme.primaryColor][6]}
                    />
                  )}
                </Group>

                <Text size="sm" color="dimmed" mb="md">
                  {shell.description}
                </Text>

                <Group gap="xs" mb="md">
                  <Badge size="sm" variant="light" color={shell.primaryColor}>
                    {shell.primaryColor}
                  </Badge>
                  <Badge size="sm" variant="outline">
                    {shell.menuItems.length} 菜单项
                  </Badge>
                </Group>

                <Divider mb="md" />

                <Text size="xs" c="dimmed" mb="xs">
                  菜单项:
                </Text>
                <Group gap={4}>
                  {shell.menuItems.slice(0, 4).map((item) => {
                    const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
                    return (
                      <Badge
                        key={item.id}
                        size="sm"
                        variant="light"
                        leftSection={IconComponent ? <IconComponent size={12} /> : null}
                      >
                        {item.label}
                      </Badge>
                    );
                  })}
                  {shell.menuItems.length > 4 && (
                    <Badge size="sm" variant="outline">
                      +{shell.menuItems.length - 4}
                    </Badge>
                  )}
                </Group>

                {!isActive && (
                  <Button
                    fullWidth
                    mt="md"
                    variant="light"
                    color={shell.primaryColor}
                    onClick={() => setShell(shell.id)}
                  >
                    应用此外壳
                  </Button>
                )}
              </Card>
            );
          })}
        </SimpleGrid>

        {/* 配置说明 */}
        <Paper p="md" radius="md" withBorder mt="xl">
          <Group mb="md">
            <IconInfoCircle size={20} />
            <Text fw={500}>如何添加新外壳</Text>
          </Group>
          <Text size="sm" color="dimmed" mb="md">
            在 <Code>src/shared/config/shells.ts</Code> 中添加新的外壳配置：
          </Text>
          <Textarea
            readOnly
            value={`// 在 SHELL_CONFIGS 中添加新配置
myCustom: {
  id: 'myCustom',
  name: '自定义外壳',
  logo: '🎨',                    // Logo (emoji 或图片 URL)
  favicon: '/custom-favicon.ico', // 可选，自定义 favicon
  title: 'My Custom App',         // 页面标题
  description: '自定义外壳描述',
  primaryColor: 'violet',         // Mantine 颜色名
  menuItems: [
    { id: 'home', label: '首页', path: '/', icon: 'home' },
    { id: 'data', label: '数据', path: '/data', icon: 'chart' },
  ],
},`}
            rows={14}
            styles={{
              input: {
                fontFamily: "monospace",
                fontSize: "12px",
              },
            }}
          />
        </Paper>

        {/* 支持的颜色 */}
        <Paper p="md" radius="md" withBorder>
          <Group mb="md">
            <IconColorSwatch size={20} />
            <Text fw={500}>支持的 Mantine 颜色</Text>
          </Group>
          <Group gap="xs">
            {[
              "dark",
              "gray",
              "red",
              "pink",
              "grape",
              "violet",
              "indigo",
              "blue",
              "cyan",
              "teal",
              "green",
              "lime",
              "yellow",
              "orange",
            ].map((color) => (
              <Badge
                key={color}
                color={color}
                variant={
                  color === SHELL_CONFIGS[currentShellId]?.primaryColor
                    ? "filled"
                    : "light"
                }
              >
                {color}
              </Badge>
            ))}
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
};