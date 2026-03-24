/**
 * Bland 评分面板组件
 * 基于 Braden Scale 的压疮风险评估
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Text,
  Stack,
  Group,
  Button,
  Badge,
  Progress,
  Divider,
  Tooltip,
  ThemeIcon,
  Accordion,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import {
  IconClipboardCheck,
  IconHistory,
  IconRefresh,
  IconDownload,
  IconInfoCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { BLAND_DIMENSIONS_CONFIG, BLAND_LEVELS_CONFIG } from '../config/bland.config';
import {
  calculateBlandScoreResult,
  createInitialBlandScore,
  getBlandRiskColor,
  getBlandRiskLabel,
  saveBlandScoreHistory,
  loadBlandScoreHistory,
  deleteBlandScoreHistory,
  exportBlandScoreHistoryToCSV,
} from '../core/blandScore';
import type {
  BlandScoreData,
  BlandScoreResult,
  BlandScoreHistory,
  BlandDimension,
} from '../types';

interface BlandScorePanelProps {
  patientId?: string;
  assessor?: string;
  onScoreChange?: (result: BlandScoreResult) => void;
}

/**
 * Bland 评分面板
 */
export const BlandScorePanel = ({
  patientId,
  assessor,
  onScoreChange,
}: BlandScorePanelProps) => {
  const [scores, setScores] = useState<BlandScoreData>(createInitialBlandScore());
  const [result, setResult] = useState<BlandScoreResult | null>(null);
  const [history, setHistory] = useState<BlandScoreHistory[]>(loadBlandScoreHistory());
  const [showHistory, setShowHistory] = useState(false);

  // 计算评分结果
  const calculateResult = useCallback(() => {
    const newResult = calculateBlandScoreResult(scores, assessor);
    setResult(newResult);
    onScoreChange?.(newResult);
    return newResult;
  }, [scores, assessor, onScoreChange]);

  // 更新单个维度评分
  const updateScore = useCallback((dimension: BlandDimension, value: number) => {
    setScores(prev => ({
      ...prev,
      [dimension]: value,
    }));
    // 自动重新计算
    setTimeout(() => {
      const newResult = calculateBlandScoreResult(
        { ...scores, [dimension]: value },
        assessor
      );
      setResult(newResult);
      onScoreChange?.(newResult);
    }, 0);
  }, [scores, assessor, onScoreChange]);

  // 保存评分
  const handleSave = useCallback(() => {
    const currentResult = result || calculateResult();
    const newHistory = saveBlandScoreHistory(currentResult, patientId);
    setHistory(prev => [newHistory, ...prev]);
  }, [result, calculateResult, patientId]);

  // 重置评分
  const handleReset = useCallback(() => {
    setScores(createInitialBlandScore());
    setResult(null);
  }, []);

  // 删除历史记录
  const handleDeleteHistory = useCallback((id: string) => {
    const updated = deleteBlandScoreHistory(id);
    setHistory(updated);
  }, []);

  // 导出历史
  const handleExport = useCallback(() => {
    const csv = exportBlandScoreHistoryToCSV(history);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bland_scores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [history]);

  // 加载历史评分
  const loadHistoryScore = useCallback((record: BlandScoreHistory) => {
    const data: BlandScoreData = {
      mobility: record.result.dimensions.mobility.score,
      activity: record.result.dimensions.activity.score,
      nutrition: record.result.dimensions.nutrition.score,
      friction: record.result.dimensions.friction.score,
      moisture: record.result.dimensions.moisture.score,
      sensation: record.result.dimensions.sensation.score,
    };
    setScores(data);
    setResult(record.result);
    setShowHistory(false);
  }, []);

  const riskColor = result ? getBlandRiskColor(result.riskLevel) : '#6b7280';
  const riskLabel = result ? getBlandRiskLabel(result.riskLevel) : '未评估';

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md">
        {/* 标题 */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <ThemeIcon color="teal" variant="light" size="lg" radius="md">
              <IconClipboardCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">Bland 评分</Text>
              <Text size="xs" c="dimmed">Braden 压疮风险评估</Text>
            </Box>
          </Group>
          <Group gap="xs">
            <Tooltip label="查看历史">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => setShowHistory(!showHistory)}
              >
                <IconHistory size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="重置">
              <ActionIcon variant="light" color="gray" onClick={handleReset}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Divider />

        {showHistory ? (
          /* 历史记录视图 */
          <Box>
            <Group justify="space-between" mb="sm">
              <Text fw={600} size="sm">历史记录 ({history.length})</Text>
              <Button
                variant="light"
                size="xs"
                leftSection={<IconDownload size={14} />}
                onClick={handleExport}
                disabled={history.length === 0}
              >
                导出
              </Button>
            </Group>
            <ScrollArea h={300}>
              <Stack gap="xs">
                {history.map(record => (
                  <Paper
                    key={record.id}
                    p="xs"
                    radius="sm"
                    withBorder
                    style={{ cursor: 'pointer' }}
                    onClick={() => loadHistoryScore(record)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Box>
                        <Group gap="xs">
                          <Text size="xs" fw={500}>
                            {new Date(record.result.assessmentTime).toLocaleDateString('zh-CN')}
                          </Text>
                          <Badge
                            size="xs"
                            color={getBlandRiskColor(record.result.riskLevel)}
                            variant="light"
                          >
                            {getBlandRiskLabel(record.result.riskLevel)}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          总分: {record.result.totalScore}/24
                        </Text>
                      </Box>
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(record.id);
                        }}
                      >
                        <IconAlertTriangle size={14} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
                {history.length === 0 && (
                  <Text size="xs" c="dimmed" ta="center" py="xl">
                    暂无历史记录
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          </Box>
        ) : (
          /* 评分视图 */
          <>
            {/* 评分维度 */}
            <Accordion variant="separated" defaultValue="mobility">
              {BLAND_DIMENSIONS_CONFIG.map(dimension => (
                <Accordion.Item key={dimension.id} value={dimension.id}>
                  <Accordion.Control>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" fw={500}>{dimension.name}</Text>
                      <Badge size="sm" variant="light">
                        {scores[dimension.id]}分
                      </Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                      {dimension.options.map(option => (
                        <Paper
                          key={option.value}
                          p="xs"
                          radius="sm"
                          withBorder
                          style={{
                            cursor: 'pointer',
                            borderColor: scores[dimension.id] === option.value
                              ? riskColor
                              : undefined,
                            backgroundColor: scores[dimension.id] === option.value
                              ? `${riskColor}10`
                              : undefined,
                          }}
                          onClick={() => updateScore(dimension.id, option.value)}
                        >
                          <Group gap="sm">
                            <ThemeIcon
                              size="sm"
                              radius="xl"
                              color={scores[dimension.id] === option.value ? 'teal' : 'gray'}
                              variant={scores[dimension.id] === option.value ? 'filled' : 'light'}
                            >
                              {scores[dimension.id] === option.value ? (
                                <IconCheck size={12} />
                              ) : (
                                <Text size="xs">{option.value}</Text>
                              )}
                            </ThemeIcon>
                            <Box style={{ flex: 1 }}>
                              <Text size="xs" fw={500}>{option.label}</Text>
                              <Text size="xs" c="dimmed">{option.description}</Text>
                            </Box>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>

            {/* 评分结果 */}
            {result && (
              <>
                <Divider />
                <Paper p="sm" radius="sm" style={{ backgroundColor: `${riskColor}10` }}>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={600} size="sm">评估结果</Text>
                      <Badge color={riskColor} size="sm">
                        {riskLabel}
                      </Badge>
                    </Group>
                    <Group justify="space-between" align="center">
                      <Text size="xs" c="dimmed">总分</Text>
                      <Text fw={600} size="lg" c={riskColor}>
                        {result.totalScore}
                        <Text span size="xs" c="dimmed">/24</Text>
                      </Text>
                    </Group>
                    <Progress
                      value={(result.totalScore / 24) * 100}
                      color={riskColor}
                      size="sm"
                      radius="xl"
                    />
                    <Text size="xs" c="dimmed">
                      {result.riskDescription}
                    </Text>

                    {/* 建议措施 */}
                    <Box mt="xs">
                      <Text size="xs" fw={500} mb="xs">建议措施:</Text>
                      <Stack gap="4px">
                        {result.recommendations.slice(0, 3).map((rec, idx) => (
                          <Group key={idx} gap="xs">
                            <ThemeIcon size="xs" radius="xl" color="teal" variant="light">
                              <IconCheck size={10} />
                            </ThemeIcon>
                            <Text size="xs">{rec}</Text>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </>
            )}

            {/* 操作按钮 */}
            <Group grow>
              <Button
                variant="light"
                color="teal"
                leftSection={<IconCheck size={16} />}
                onClick={handleSave}
                disabled={!result}
              >
                保存评分
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default BlandScorePanel;
