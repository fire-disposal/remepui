import {
  Badge,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconChartBar, IconFileAnalytics, IconStethoscope } from "@tabler/icons-react";
import { useBindings, useData, useDevices, usePatients, useUsers } from "../../../shared/api";

/**
 * 运营报表页面
 * 为管理者提供独立的运营概览与指标看板。
 */
export const OperationsReportPage = () => {
  const { data: patientsData } = usePatients({ page: 1, page_size: 100 });
  const { data: devicesData } = useDevices({ page: 1, page_size: 100 });
  const { data: bindingsData } = useBindings({ active_only: true, page: 1, page_size: 100 });
  const { data: usersData } = useUsers({ page: 1, page_size: 100 });
  const { data: reportData } = useData({ page: 1, page_size: 50 });

  const patients = patientsData?.pagination?.total || 0;
  const devices = devicesData?.data || [];
  const activeDevices = devices.filter((item) => item.status === "active").length;
  const bindings = bindingsData?.pagination?.total || 0;
  const users = usersData?.pagination?.total || 0;
  const records = reportData?.data || [];

  const bindingCoverage = patients > 0 ? Math.round((bindings / patients) * 100) : 0;
  const deviceAvailability = devices.length > 0 ? Math.round((activeDevices / devices.length) * 100) : 0;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconFileAnalytics size={28} />
                运营报表
              </Group>
            </Title>
            <Text size="sm" mt={4} c="dimmed">
              独立报表模块，用于跨患者、设备与用户维度的运营复盘。
            </Text>
          </div>
          <Badge size="lg" color="blue" variant="light">管理驾驶舱</Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 4 }}>
          <Card withBorder p="md" radius="md">
            <Text size="sm" c="dimmed">患者总数</Text>
            <Text fw={700} size="xl">{patients}</Text>
          </Card>
          <Card withBorder p="md" radius="md">
            <Text size="sm" c="dimmed">设备总数</Text>
            <Text fw={700} size="xl">{devices.length}</Text>
          </Card>
          <Card withBorder p="md" radius="md">
            <Text size="sm" c="dimmed">有效绑定</Text>
            <Text fw={700} size="xl">{bindings}</Text>
          </Card>
          <Card withBorder p="md" radius="md">
            <Text size="sm" c="dimmed">系统用户</Text>
            <Text fw={700} size="xl">{users}</Text>
          </Card>
        </SimpleGrid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" radius="md">
              <Group mb="xs">
                <IconChartBar size={18} />
                <Text fw={600}>关键运营指标</Text>
              </Group>
              <Stack gap="md">
                <div>
                  <Group justify="space-between">
                    <Text size="sm">绑定覆盖率</Text>
                    <Text size="sm" fw={600}>{bindingCoverage}%</Text>
                  </Group>
                  <Progress value={bindingCoverage} mt={6} />
                </div>
                <div>
                  <Group justify="space-between">
                    <Text size="sm">设备可用率</Text>
                    <Text size="sm" fw={600}>{deviceAvailability}%</Text>
                  </Group>
                  <Progress value={deviceAvailability} mt={6} color={deviceAvailability > 80 ? "teal" : "orange"} />
                </div>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper withBorder p="md" radius="md">
              <Group mb="xs">
                <IconStethoscope size={18} />
                <Text fw={600}>数据采集分布（近 50 条）</Text>
              </Group>
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>数据类型</Table.Th>
                    <Table.Th>数量</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {["heart_rate", "spo2", "fall_event", "mattress"].map((type) => {
                    const count = records.filter((item) => item.data_type === type).length;
                    return (
                      <Table.Tr key={type}>
                        <Table.Td>{type}</Table.Td>
                        <Table.Td>{count}</Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};
