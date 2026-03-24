/**
 * 教学面板组件
 * 使用 Mantine UI
 */

import { Paper, Text, Group, Tabs, Stack, Badge, Accordion, ThemeIcon, Box } from '@mantine/core';
import {
  IconBook, IconShield, IconAlertTriangle, IconStethoscope,
  IconExternalLink
} from '@tabler/icons-react';

export const EducationPanel: React.FC = () => {
  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group gap="xs" mb="md">
        <ThemeIcon color="blue" variant="light" size="sm">
          <IconBook size={14} />
        </ThemeIcon>
        <Text fw={600} size="sm">教学说明</Text>
      </Group>

      <Tabs defaultValue="prevention">
        <Tabs.List>
          <Tabs.Tab value="prevention" leftSection={<IconShield size={14} />}>
            预防指南
          </Tabs.Tab>
          <Tabs.Tab value="factors" leftSection={<IconStethoscope size={14} />}>
            风险因素
          </Tabs.Tab>
          <Tabs.Tab value="guidelines" leftSection={<IconBook size={14} />}>
            临床指南
          </Tabs.Tab>
        </Tabs.List>

        {/* 预防指南 */}
        <Tabs.Panel value="prevention" pt="md">
          <Accordion variant="separated" radius="sm">
            <Accordion.Item value="repositioning">
              <Accordion.Control>
                <Group gap="xs">
                  <ThemeIcon color="blue" variant="light" size="xs">
                    <Text size="xs">1</Text>
                  </ThemeIcon>
                  <Text size="sm" fw={500}>定期翻身</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">• 每2小时翻身一次是预防压疮的标准护理措施</Text>
                  <Text size="xs" c="dimmed">• 高风险患者（风险系数≥7）应每1-1.5小时翻身</Text>
                  <Text size="xs" c="dimmed">• 使用30°侧卧位可有效减少骶尾部压力</Text>
                  <Text size="xs" c="dimmed">• 避免直接压迫骨突部位</Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="support">
              <Accordion.Control>
                <Group gap="xs">
                  <ThemeIcon color="blue" variant="light" size="xs">
                    <Text size="xs">2</Text>
                  </ThemeIcon>
                  <Text size="sm" fw={500}>减压装置</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">• 使用气垫床或泡沫床垫分散压力</Text>
                  <Text size="xs" c="dimmed">• 足跟保护器预防足跟压疮</Text>
                  <Text size="xs" c="dimmed">• 避免使用环形坐垫（会增加局部压力）</Text>
                  <Text size="xs" c="dimmed">• 保持床单平整无皱褶</Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="skin">
              <Accordion.Control>
                <Group gap="xs">
                  <ThemeIcon color="blue" variant="light" size="xs">
                    <Text size="xs">3</Text>
                  </ThemeIcon>
                  <Text size="sm" fw={500}>皮肤护理</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">• 保持皮肤清洁干燥，避免过度潮湿</Text>
                  <Text size="xs" c="dimmed">• 使用pH值平衡的清洁剂</Text>
                  <Text size="xs" c="dimmed">• 定期检查皮肤，特别是骨突部位</Text>
                  <Text size="xs" c="dimmed">• 使用皮肤保护剂预防摩擦损伤</Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="nutrition">
              <Accordion.Control>
                <Group gap="xs">
                  <ThemeIcon color="blue" variant="light" size="xs">
                    <Text size="xs">4</Text>
                  </ThemeIcon>
                  <Text size="sm" fw={500}>营养支持</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">• 保证充足的蛋白质摄入（1.2-1.5g/kg/天）</Text>
                  <Text size="xs" c="dimmed">• 维持适当的水分摄入</Text>
                  <Text size="xs" c="dimmed">• 补充维生素C和锌促进伤口愈合</Text>
                  <Text size="xs" c="dimmed">• 营养不良患者应进行营养评估</Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Tabs.Panel>

        {/* 风险因素 */}
        <Tabs.Panel value="factors" pt="md">
          <Stack gap="md">
            <Paper p="sm" radius="sm" bg="orange.0" withBorder>
              <Group gap="xs" mb="xs">
                <IconAlertTriangle size={14} color="var(--mantine-color-orange-6)" />
                <Text size="sm" fw={500} c="orange.8">主要风险因素</Text>
              </Group>
              <Stack gap="xs">
                <Text size="xs" c="orange.7">• 长期卧床或坐轮椅</Text>
                <Text size="xs" c="orange.7">• 感觉障碍（如脊髓损伤）</Text>
                <Text size="xs" c="orange.7">• 营养不良或肥胖</Text>
                <Text size="xs" c="orange.7">• 皮肤潮湿（出汗、失禁）</Text>
                <Text size="xs" c="orange.7">• 年龄 &gt; 65岁</Text>
              </Stack>
            </Paper>

            <Box>
              <Text size="sm" fw={500} mb="xs">风险系数计算说明</Text>
              <Stack gap="xs">
                <Group justify="space-between" p="xs" bg="gray.0">
                  <Text size="xs">BMI影响</Text>
                  <Text size="xs" ff="monospace">0.5-3.0</Text>
                </Group>
                <Group justify="space-between" p="xs" bg="gray.0">
                  <Text size="xs">环境温度影响</Text>
                  <Text size="xs" ff="monospace">0.5-2.5</Text>
                </Group>
                <Group justify="space-between" p="xs" bg="gray.0">
                  <Text size="xs">环境湿度影响</Text>
                  <Text size="xs" ff="monospace">0.5-2.0</Text>
                </Group>
                <Group justify="space-between" p="xs" bg="gray.0">
                  <Text size="xs">界面压力影响</Text>
                  <Text size="xs" ff="monospace">0.5-6.0</Text>
                </Group>
              </Stack>
              <Text size="xs" c="dimmed" mt="xs">
                综合风险系数 = 压力×40% + BMI×30% + 温度×15% + 湿度×15%
              </Text>
            </Box>
          </Stack>
        </Tabs.Panel>

        {/* 临床指南 */}
        <Tabs.Panel value="guidelines" pt="md">
          <Stack gap="md">
            <Paper p="sm" radius="sm" bg="blue.0" withBorder>
              <Text size="sm" fw={500} c="blue.8" mb="xs">国际压疮防治指南</Text>
              <Text size="xs" c="blue.7">
                基于NPUAP/EPUAP (美国国家压疮咨询委员会/欧洲压疮咨询委员会)
                2019年国际压疮/损伤预防与治疗临床实践指南
              </Text>
            </Paper>

            <Box>
              <Text size="sm" fw={500} mb="xs">压疮分期系统</Text>
              <Stack gap="xs">
                <Group gap="xs">
                  <Badge color="red" variant="light" size="xs">Ⅰ期</Badge>
                  <Text size="xs" c="dimmed">皮肤完整，局部红斑，按压不褪色</Text>
                </Group>
                <Group gap="xs">
                  <Badge color="red" variant="light" size="xs">Ⅱ期</Badge>
                  <Text size="xs" c="dimmed">部分皮层缺损，浅表溃疡或水疱</Text>
                </Group>
                <Group gap="xs">
                  <Badge color="red" variant="light" size="xs">Ⅲ期</Badge>
                  <Text size="xs" c="dimmed">全层皮肤缺损，可见皮下脂肪</Text>
                </Group>
                <Group gap="xs">
                  <Badge color="red" variant="light" size="xs">Ⅳ期</Badge>
                  <Text size="xs" c="dimmed">全层组织缺损，暴露骨骼、肌腱或肌肉</Text>
                </Group>
              </Stack>
            </Box>

            <Group gap="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }} pt="sm">
              <IconExternalLink size={12} />
              <a
                href="https://www.npuap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                访问NPUAP官网获取更多资源
              </a>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};