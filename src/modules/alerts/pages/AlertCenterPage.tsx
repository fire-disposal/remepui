import {
  Badge,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBellRinging,
  IconClock,
  IconDeviceDesktop,
  IconHeartbeat,
  IconUser,
} from "@tabler/icons-react";
import { useBindings, useData, useDevices, usePatients } from "../../../shared/api";

/**
 * 预警中心页面
 * 聚合展示关键风险与建议动作，作为独立模块入口。
 */
export const AlertCenterPage = () => {
  const { data: devicesData } = useDevices({ page: 1, page_size: 100 });
  const { data: bindingsData } = useBindings({ active_only: true, page: 1, page_size: 100 });
  const { data: patientsData } = usePatients({ page: 1, page_size: 100 });
  const { data: latestData } = useData({ page: 1, page_size: 20 });

  const devices = devicesData?.data || [];
  const activeDevices = devices.filter((item) => item.status === "active").length;
  const inactiveDevices = devices.filter((item) => item.status !== "active").length;
  const activeBindings = bindingsData?.pagination?.total || 0;
  const patients = patientsData?.pagination?.total || 0;
  const latestRecords = latestData?.data || [];

  const heartRateAlerts = latestRecords.filter((record) => record.data_type === "heart_rate").length;
  const fallEventAlerts = latestRecords.filter((record) => record.data_type === "fall_event").length;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconBellRinging size={28} />
                预警中心
              </Group>
            </Title>
            <Text size="sm" mt={4} c="dimmed">
              独立查看设备、绑定与数据风险，便于班次快速处置。
            </Text>
          </div>
          <Badge size="lg" color="orange" variant="light">
            实时巡检模块
          </Badge>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder p="md" radius="md">
              <Group mb="xs" justify="space-between">
                <Text fw={600}>设备状态风险</Text>
                <ThemeIcon color="orange" variant="light"><IconDeviceDesktop size={16} /></ThemeIcon>
              </Group>
              <Text fw={700} size="xl">{inactiveDevices}</Text>
              <Text size="xs" c="dimmed">异常/非活跃设备（共 {devices.length} 台）</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder p="md" radius="md">
              <Group mb="xs" justify="space-between">
                <Text fw={600}>绑定覆盖情况</Text>
                <ThemeIcon color="teal" variant="light"><IconUser size={16} /></ThemeIcon>
              </Group>
              <Text fw={700} size="xl">{activeBindings}/{patients}</Text>
              <Text size="xs" c="dimmed">有效绑定 / 患者总数</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder p="md" radius="md">
              <Group mb="xs" justify="space-between">
                <Text fw={600}>近期高关注数据</Text>
                <ThemeIcon color="red" variant="light"><IconHeartbeat size={16} /></ThemeIcon>
              </Group>
              <Text fw={700} size="xl">{heartRateAlerts + fallEventAlerts}</Text>
              <Text size="xs" c="dimmed">近 20 条记录中的心率/跌倒事件</Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Paper withBorder p="md" radius="md">
          <Group mb="sm">
            <IconAlertTriangle size={18} />
            <Text fw={600}>建议处置流程</Text>
          </Group>
          <Divider mb="sm" />
          <List spacing="sm" size="sm">
            <List.Item>优先处理离线设备（建议 30 分钟内确认是否掉线）。</List.Item>
            <List.Item>检查未绑定患者，避免新增患者无法持续采集数据。</List.Item>
            <List.Item>关注跌倒事件与异常心率，必要时通知护理人员复核。</List.Item>
            <List.Item>每班次至少复盘一次风险统计并备注处理结果。</List.Item>
          </List>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group mb="xs">
            <IconClock size={16} />
            <Text fw={600}>本班次快照</Text>
          </Group>
          <Text size="sm" c="dimmed">
            当前活跃设备 {activeDevices} 台，离线/维护设备 {inactiveDevices} 台；建议按“设备 → 绑定 → 数据事件”顺序处理。
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
};
