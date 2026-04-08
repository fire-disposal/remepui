import { useState, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Table,
  Button,
  Group,
  Modal,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  ScrollArea,
  Checkbox,
  Chip,
  Divider,
  Alert,
} from "@mantine/core";
import {
  IconShield,
  IconRefresh,
  IconLock,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import {
  useModules,
  useRoles,
  useRoleModules,
  useSetRoleModules,
} from "../../../shared/api";
import { notifications } from "@mantine/notifications";

const CATEGORY_LABELS: Record<string, string> = {
  core: "核心功能",
  admin: "管理功能",
  feature: "特色功能",
};

const CATEGORY_COLORS: Record<string, string> = {
  core: "blue",
  admin: "grape",
  feature: "teal",
};

const CATEGORY_ORDER = ["core", "admin", "feature"];

export const ModulesPage = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { data: modulesData, isLoading: modulesLoading } = useModules();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: roleModules, isLoading: roleModulesLoading, refetch } =
    useRoleModules(selectedRoleId || "");

  const setModulesMutation = useSetRoleModules();

  const modules = modulesData?.modules || [];
  const roles = rolesData?.roles || [];
  const selectedModules = roleModules?.modules || [];

  const isLoading = modulesLoading || rolesLoading || roleModulesLoading;

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  const handleToggleModule = async (moduleId: string, checked: boolean) => {
    if (!selectedRoleId) return;

    const currentIds = selectedModules.map((m) => m.id);
    const newIds = checked
      ? [...currentIds, moduleId]
      : currentIds.filter((id) => id !== moduleId);

    try {
      await setModulesMutation.mutateAsync({
        id: selectedRoleId,
        data: { module_ids: newIds },
      });
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "操作失败",
        color: "red",
      });
    }
  };

  const handleSelectAll = async (category: string) => {
    if (!selectedRoleId) return;

    const categoryModuleIds = modules
      .filter((m) => m.category === category)
      .map((m) => m.id);
    const currentIds = selectedModules.map((m) => m.id);
    const allSelected = categoryModuleIds.every((id) =>
      currentIds.includes(id)
    );

    let newIds: string[];
    if (allSelected) {
      newIds = currentIds.filter((id) => !categoryModuleIds.includes(id));
    } else {
      newIds = [...new Set([...currentIds, ...categoryModuleIds])];
    }

    try {
      await setModulesMutation.mutateAsync({
        id: selectedRoleId,
        data: { module_ids: newIds },
      });
      notifications.show({
        title: "成功",
        message: allSelected ? "已取消选择" : "已全选",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "错误",
        message: error instanceof Error ? error.message : "操作失败",
        color: "red",
      });
    }
  };

  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, typeof modules> = {};
    for (const category of CATEGORY_ORDER) {
      grouped[category] = modules.filter((m) => m.category === category);
    }
    return grouped;
  }, [modules]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconShield size={28} />
                模块权限管理
              </Group>
            </Title>
            <Text size="sm" mt={4}>
              配置角色的模块访问权限
            </Text>
          </div>
          <Tooltip label="刷新">
            <ActionIcon
              variant="light"
              onClick={() => refetch()}
              disabled={!selectedRoleId}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={500}>选择角色</Text>
            <Chip.Group
              value={selectedRoleId || ""}
              onChange={(value) => handleRoleChange(value as string)}
              multiple={false}
            >
              <Group gap="xs">
                {roles.map((role) => (
                  <Chip
                    key={role.id}
                    value={role.id}
                    variant="light"
                    color={role.is_system ? "red" : "blue"}
                  >
                    <Group gap={4}>
                      <Text size="sm">{role.name}</Text>
                      {role.is_system && (
                        <Badge size="xs" color="red" variant="light">
                          系统
                        </Badge>
                      )}
                    </Group>
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </Stack>
        </Paper>

        {selectedRole?.is_system && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="系统角色"
            color="blue"
            variant="light"
          >
            系统角色拥有所有模块的访问权限，无需手动配置
          </Alert>
        )}

        {selectedRoleId && !selectedRole?.is_system && (
          <Paper radius="md" withBorder>
            {isLoading ? (
              <Center p="xl">
                <Loader size="lg" />
              </Center>
            ) : (
              <ScrollArea h={500}>
                <Stack gap="md" p="md">
                  {CATEGORY_ORDER.map((category) => {
                    const categoryModules = modulesByCategory[category];
                    if (categoryModules.length === 0) return null;

                    const allSelected = categoryModules.every((m) =>
                      selectedModules.some((sm) => sm.id === m.id)
                    );

return (
                      <div key={category}>
                        <Group justify="space-between" mb="sm">
                          <Badge
                            size="lg"
                            color={CATEGORY_COLORS[category] || "gray"}
                          >
                            {CATEGORY_LABELS[category] || category}
                          </Badge>
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => handleSelectAll(category)}
                          >
                            {allSelected ? "取消全选" : "全选"}
                          </Button>
                        </Group>

                        <Stack gap="xs">
                          {categoryModules.map((mod) => {
                            const isChecked = selectedModules.some(
                              (sm) => sm.id === mod.id
                            );

                            return (
                              <Paper
                                key={mod.id}
                                p="sm"
                                withBorder
                                style={{
                                  cursor: "pointer",
                                  backgroundColor: isChecked
                                    ? "var(--mantine-color-blue-0)"
                                    : undefined,
                                }}
                                onClick={() => handleToggleModule(mod.id, !isChecked)}
                              >
                                <Group justify="space-between">
                                  <Group gap="xs">
                                    <Checkbox
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleToggleModule(
                                          mod.id,
                                          e.currentTarget.checked
                                        )
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div>
                                      <Text fw={500}>{mod.name}</Text>
                                      {mod.description && (
                                        <Text size="xs" color="dimmed">
                                          {mod.description}
                                        </Text>
                                      )}
                                    </div>
                                  </Group>
                                  <Group gap="xs">
                                    <Badge
                                      size="xs"
                                      variant="light"
                                      color="gray"
                                    >
                                      {mod.code}
                                    </Badge>
                                    {isChecked && (
                                      <IconCheck
                                        size={16}
                                        color="var(--mantine-color-blue-6)"
                                      />
                                    )}
                                  </Group>
                                </Group>
                              </Paper>
                            );
                          })}
                        </Stack>
                        <Divider my="md" />
                      </div>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </Paper>
        )}

        {!selectedRoleId && (
          <Paper p="xl" radius="md" withBorder>
            <Center>
              <Stack align="center" gap="md">
                <IconLock size={48} opacity={0.3} />
                <Text color="dimmed">请选择一个角色开始配置权限</Text>
              </Stack>
            </Center>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};