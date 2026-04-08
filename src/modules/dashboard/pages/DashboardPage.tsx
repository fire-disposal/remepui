import { useEffect, useState } from "react";
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
  Badge,
  ThemeIcon,
  Skeleton,
  ActionIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import {
  IconUsers,
  IconDeviceDesktop,
  IconLink,
  IconChartLine,
  IconRefresh,
  IconArrowRight,
  IconHeartbeat,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconShield,
} from "@tabler/icons-react";
import { useAuthStore } from "../../../shared/store/auth";
import { usePatients, useDevices, useBindings, useData } from "../../../shared/api";
import { logger } from "../../../shared/logger";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, loading, subtitle }: StatCardProps) {
  return (
    <Card withBorder p="lg" radius="md" style={{ overflow: "hidden" }}>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        <ThemeIcon variant="light" color={color} size="lg" radius="md">
          {icon}
        </ThemeIcon>
      </Group>
      {loading ? (
        <Skeleton height={32} mt="sm" />
      ) : (
        <>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={4}>
              {subtitle}
            </Text>
          )}
        </>
      )}
    </Card>
  );
}

/**
 * 仪表板页面
 * - 显示欢迎信息
 * - 统计数据
 * - 快捷操作
 */
export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取统计数据
  const { data: patientsData, isLoading: patientsLoading, refetch: refetchPatients } = usePatients();
  const { data: devicesData, isLoading: devicesLoading, refetch: refetchDevices } = useDevices();
  const { data: bindingsData, isLoading: bindingsLoading, refetch: refetchBindings } = useBindings({ active_only: true });
  const { data: recentData, isLoading: dataLoading, refetch: refetchData } = useData({ page: 1, page_size: 5 });

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    refetchPatients();
    refetchDevices();
    refetchBindings();
    refetchData();
  };

  useEffect(() => {
    logger.info("Dashboard page rendered", { username: user?.username });
  }, [user?.username]);

  const stats = {
    patients: patientsData?.total || 0,
    devices: devicesData?.total || 0,
    activeDevices: devicesData?.data?.filter((d) => d.status === "active").length || 0,
    bindings: bindingsData?.total || 0,
  };

  const recentRecords = recentData?.data || [];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* 欢迎部分 */}
        <Group justify="space-between">
          <div>
            <Group gap="sm">
              <Title order={2}>仪表板</Title>
              {user?.role_name?.toLowerCase() === "admin" && (
                <Badge
                  variant="light"
                  color="red"
                  leftSection={<IconShield size={12} />}
                >
                  管理员
                </Badge>
              )}
            </Group>
            <Text mt={4}>
              欢迎回来，<strong>{user?.username}</strong>！
            </Text>
          </div>
          <Tooltip label="刷新数据">
            <ActionIcon variant="light" size="lg" onClick={handleRefresh}>
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* 统计卡片 */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="患者总数"
              value={stats.patients}
              icon={<IconUsers size={20} />}
              color="blue"
              loading={patientsLoading}
              subtitle="已注册患者"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="设备总数"
              value={stats.devices}
              icon={<IconDeviceDesktop size={20} />}
              color="violet"
              loading={devicesLoading}
              subtitle={`${stats.activeDevices} 台活跃`}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="有效绑定"
              value={stats.bindings}
              icon={<IconLink size={20} />}
              color="teal"
              loading={bindingsLoading}
              subtitle="设备-患者绑定"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              title="数据记录"
              value={recentData?.pagination?.total || 0}
              icon={<IconChartLine size={20} />}
              color="orange"
              loading={dataLoading}
              subtitle="健康数据条数"
            />
          </Grid.Col>
        </Grid>

        {/* 设备状态概览 */}
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>设备状态概览</Title>
            <Button
              variant="subtle"
              size="xs"
              rightSection={<IconArrowRight size={14} />}
              component="a"
              href="/devices"
            >
              查看全部
            </Button>
          </Group>
          {devicesLoading ? (
            <Skeleton height={100} />
          ) : (
            <Grid>
              <Grid.Col span={4}>
                <Card
                  padding="sm"
                  radius="md"
                  style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <Group gap="xs">
                    <ThemeIcon color="teal" variant="light" size="sm">
                      <IconCheck size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">活跃设备</Text>
                      <Text fw={700} size="lg" c="teal.6">
                        {devicesData?.data?.filter((d) => d.status === "active").length || 0}
                      </Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={4}>
                <Card
                  padding="sm"
                  radius="md"
                  style={{
                    background: "linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)",
                    border: "1px solid rgba(107, 114, 128, 0.2)",
                  }}
                >
                  <Group gap="xs">
                    <ThemeIcon color="gray" variant="light" size="sm">
                      <IconClock size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">未激活</Text>
                      <Text fw={700} size="lg" c="gray.6">
                        {devicesData?.data?.filter((d) => d.status === "inactive").length || 0}
                      </Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>
              <Grid.Col span={4}>
                <Card
                  padding="sm"
                  radius="md"
                  style={{
                    background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)",
                    border: "1px solid rgba(249, 115, 22, 0.2)",
                  }}
                >
                  <Group gap="xs">
                    <ThemeIcon color="orange" variant="light" size="sm">
                      <IconAlertTriangle size={14} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">维护中</Text>
                      <Text fw={700} size="lg" c="orange.6">
                        {devicesData?.data?.filter((d) => d.status === "maintenance").length || 0}
                      </Text>
                    </div>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          )}
        </Paper>

        {/* 最近数据记录 */}
        <Paper p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>最近数据记录</Title>
            <Button
              variant="subtle"
              size="xs"
              rightSection={<IconArrowRight size={14} />}
              component="a"
              href="/data"
            >
              查看全部
            </Button>
          </Group>
          {dataLoading ? (
            <Stack gap="sm">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={40} />
              ))}
            </Stack>
          ) : recentRecords.length === 0 ? (
            <Text color="dimmed" ta="center" py="xl">
              暂无数据记录
            </Text>
          ) : (
            <Stack gap="sm">
              {recentRecords.map((record, index) => (
                <Card key={`${record.time}-${index}`} padding="sm" radius="md" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <ThemeIcon variant="light" color="blue" size="sm">
                        <IconHeartbeat size={14} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>
                          {record.data_type}
                        </Text>
                        <Text size="xs" color="dimmed">
                          设备: {record.device_id.slice(0, 8)}...
                        </Text>
                      </div>
                    </Group>
                    <Text size="xs" color="dimmed">
                      {new Date(record.time).toLocaleString("zh-CN")}
                    </Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>

        {/* 快捷操作 */}
        <Paper p="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            快捷操作
          </Title>
          <Group gap="md">
            <Button
              variant="light"
              leftSection={<IconUsers size={16} />}
              component="a"
              href="/patients"
            >
              添加患者
            </Button>
            <Button
              variant="light"
              leftSection={<IconDeviceDesktop size={16} />}
              component="a"
              href="/devices"
            >
              注册设备
            </Button>
            <Button
              variant="light"
              leftSection={<IconLink size={16} />}
              component="a"
              href="/bindings"
            >
              创建绑定
            </Button>
            <Button
              variant="light"
              leftSection={<IconChartLine size={16} />}
              component="a"
              href="/data"
            >
              查看数据
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
};