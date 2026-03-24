/**
 * 增强版压力性损伤仿真教学页面
 * 使用增强版仿真引擎和高级可视化
 */

import { useEffect, useCallback, useState } from 'react';
import {
  Container, Text, Stack, Paper, Grid, Group, Badge, Button,
  ActionIcon, Tooltip, Box, Tabs, SimpleGrid, ThemeIcon, Switch,
  Divider, ScrollArea
} from '@mantine/core';
import {
  IconActivity, IconVolume, IconVolumeOff, IconInfoCircle,
  IconDatabase, IconTimeline, IconAlertTriangle, IconBook,
  IconBrain, IconChartLine, IconStethoscope, IconRotateClockwise,
  IconPlayerPlay, IconPlayerPause, IconRefresh
} from '@tabler/icons-react';
import { useEnhancedSimulation } from '../hooks/useEnhancedSimulation';
import { useAudioSystem } from '../hooks/useAudioSystem';
import {
  ParameterPanel, BodyModel, StatusIndicators, TimeControl,
  AlertSystem, DamageChart, SimulationRecords, EducationPanel,
  EventTimeline, EventList, DamageStageIndicator,
  PredictionChart, SmartRecommendations
} from '../components';
import type { SimulationRecord, PressureUlcerEvent } from '../types';

export const PressureUlcerPage = () => {
  const {
    params,
    state,
    alertState,
    riskScore,
    criticalTime,
    recommendedInterval,
    updateParams,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    finishSimulation,
    resetSimulation,
    performReposition,
    endRecovery,
    getRiskFactors,
    getEvents,
    loadRecords,
    deleteRecord,
    formatTime,
  } = useEnhancedSimulation();

  const [records, setRecords] = useState<SimulationRecord[]>(loadRecords());
  const [events, setEvents] = useState<PressureUlcerEvent[]>([]);
  const [showPrediction, setShowPrediction] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const {
    enabled: audioEnabled,
    toggleAudio,
    testSound,
    playAlertSound,
    initAudioContext,
  } = useAudioSystem();

  const refreshRecords = useCallback(() => {
    setRecords(loadRecords());
  }, [loadRecords]);

  const handleDeleteRecord = useCallback(
    (id: string) => {
      const newRecords = deleteRecord(id);
      setRecords(newRecords);
    },
    [deleteRecord]
  );

  // 警报触发时播放声音
  useEffect(() => {
    if (alertState.level !== 'none') {
      playAlertSound(alertState.level);
    }
  }, [alertState.level, playAlertSound]);

  // 更新事件列表
  useEffect(() => {
    if (state.isRunning || state.isFinished) {
      setEvents(getEvents());
    }
  }, [state.isRunning, state.isFinished, getEvents]);

  const handleReposition = useCallback(() => {
    performReposition();
  }, [performReposition]);

  const handleStart = useCallback(() => {
    initAudioContext();
    startSimulation();
  }, [initAudioContext, startSimulation]);

  const handlePause = useCallback(() => {
    pauseSimulation();
  }, [pauseSimulation]);

  const handleResume = useCallback(() => {
    resumeSimulation();
  }, [resumeSimulation]);

  const handleFinish = useCallback(() => {
    finishSimulation();
    refreshRecords();
  }, [finishSimulation, refreshRecords]);

  const handleReset = useCallback(() => {
    resetSimulation();
  }, [resetSimulation]);

  const riskFactors = getRiskFactors();
  
  const simulationStatus = state.isRecovering
    ? '恢复期'
    : state.isRunning && !state.isPaused
    ? '运行中'
    : state.isPaused
    ? '已暂停'
    : state.isFinished
    ? '已结束'
    : '就绪';

  const statusColor = state.isRecovering
    ? 'green'
    : state.isRunning && !state.isPaused
    ? 'green'
    : state.isPaused
    ? 'yellow'
    : state.isFinished
    ? 'blue'
    : 'gray';

  return (
    <Box p="md">
      {/* 顶部状态栏 */}
      <Paper shadow="xs" p="sm" radius="md" mb="md" withBorder>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <ThemeIcon color="pink" variant="light" size="lg" radius="md">
              <IconActivity size={18} />
            </ThemeIcon>
            <Box>
              <Text size="sm" fw={600}>压疮风险仿真系统</Text>
              <Text size="xs" c="dimmed">
                风险: {riskScore.toFixed(1)} | 
                伤害: {state.damagePercent.toFixed(1)}% | 
                翻身: {state.repositionCount}次 |
                时间: {formatTime(state.elapsedTime)}
              </Text>
            </Box>
          </Group>

          <Group gap="xs">
            <Badge color={statusColor} variant="light" size="sm">
              {simulationStatus}
            </Badge>

            {state.isRecovering && (
              <Badge color="green" variant="light" size="sm">
                恢复中
              </Badge>
            )}

            <Tooltip label={audioEnabled ? '关闭声音' : '开启声音'}>
              <ActionIcon
                variant={audioEnabled ? 'light' : 'subtle'}
                color={audioEnabled ? 'blue' : 'gray'}
                onClick={toggleAudio}
                size="sm"
              >
                {audioEnabled ? <IconVolume size={16} /> : <IconVolumeOff size={16} />}
              </ActionIcon>
            </Tooltip>

            <Tooltip label="关于本系统">
              <ActionIcon variant="subtle" size="sm">
                <IconInfoCircle size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Paper>

      {/* 主内容区域 */}
      <Grid gutter="md">
        {/* 左侧：参数控制面板 */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Stack gap="md">
            <Paper shadow="xs" p="sm" radius="md" withBorder>
              <ParameterPanel
                params={params}
                onUpdateParams={updateParams}
                isRunning={state.isRunning}
                isPaused={state.isPaused}
                isFinished={state.isFinished}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onFinish={handleFinish}
                onReset={handleReset}
              />
            </Paper>

            {/* 快速控制 */}
            <Paper shadow="xs" p="sm" radius="md" withBorder>
              <Text size="xs" fw={600} c="dimmed" mb="sm">快速控制</Text>
              <Group grow gap="xs">
                <Button
                  onClick={handleReposition}
                  disabled={!state.isRunning || state.isFinished || state.isRecovering}
                  size="compact-sm"
                  color="grape"
                  leftSection={<IconRotateClockwise size={14} />}
                >
                  翻身
                </Button>
                {state.isRecovering && (
                  <Button
                    onClick={endRecovery}
                    size="compact-sm"
                    variant="light"
                    color="green"
                  >
                    结束恢复
                  </Button>
                )}
              </Group>
            </Paper>

            {/* 显示选项 */}
            <Paper shadow="xs" p="sm" radius="md" withBorder>
              <Text size="xs" fw={600} c="dimmed" mb="sm">显示选项</Text>
              <Stack gap="xs">
                <Switch
                  label="显示预测曲线"
                  checked={showPrediction}
                  onChange={(e) => setShowPrediction(e.currentTarget.checked)}
                  size="xs"
                />
                <Switch
                  label="显示智能建议"
                  checked={showRecommendations}
                  onChange={(e) => setShowRecommendations(e.currentTarget.checked)}
                  size="xs"
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        {/* 右侧：仿真显示区域 */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Stack gap="md">
            {/* 状态指示器 */}
            <StatusIndicators
              riskScore={riskScore}
              damagePercent={state.damagePercent}
              riskFactors={riskFactors}
            />

            {/* 主显示区 */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              {/* 人体模型 */}
              <Paper shadow="xs" radius="md" withBorder style={{ overflow: 'hidden' }}>
                <Box
                  p="xs"
                  style={{
                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                    backgroundColor: 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Group justify="space-between">
                    <Text size="sm" fw={600}>人体模型</Text>
                    <Badge variant="outline" size="xs">5个高发部位</Badge>
                  </Group>
                </Box>
                <Box h={320} style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <BodyModel
                    bodyParts={state.bodyParts}
                    onReposition={handleReposition}
                    isRunning={state.isRunning}
                    isFinished={state.isFinished}
                  />
                </Box>
              </Paper>

              {/* 右侧信息区 */}
              <Stack gap="md">
                {/* 伤害阶段指示器 */}
                <DamageStageIndicator damagePercent={state.damagePercent} />

                {/* 警报系统 */}
                <AlertSystem
                  alertLevel={alertState.level}
                  message={alertState.message}
                  audioEnabled={audioEnabled}
                  onToggleAudio={toggleAudio}
                  onTestAudio={testSound}
                />

                {/* 时间控制 */}
                <TimeControl
                  elapsedTime={state.elapsedTime}
                  criticalTime={criticalTime}
                  formatTime={formatTime}
                  isRunning={state.isRunning && !state.isPaused}
                />
              </Stack>
            </SimpleGrid>

            {/* 预测和建议区域 */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              {showPrediction && (
                <PredictionChart
                  history={state.history}
                  prediction={state.predictionData}
                  predictedUlcerTime={state.predictedUlcerTime}
                  recommendedRepositionTime={recommendedInterval}
                  isRunning={state.isRunning && !state.isPaused}
                  formatTime={formatTime}
                />
              )}
              
              {showRecommendations && (
                <SmartRecommendations
                  params={params}
                  riskFactors={riskFactors}
                  riskScore={riskScore}
                  damagePercent={state.damagePercent}
                  recommendedInterval={recommendedInterval}
                  predictedUlcerTime={state.predictedUlcerTime}
                  isRunning={state.isRunning}
                  isRecovering={state.isRecovering}
                  repositionCount={state.repositionCount}
                  formatTime={formatTime}
                />
              )}
            </SimpleGrid>

            {/* 伤害曲线 */}
            <Paper shadow="xs" radius="md" withBorder>
              <DamageChart
                history={state.history}
                isRunning={state.isRunning && !state.isPaused}
              />
            </Paper>

            {/* 底部标签页 */}
            <Paper shadow="xs" radius="md" withBorder>
              <Tabs defaultValue="records">
                <Tabs.List style={{ paddingLeft: 8, paddingRight: 8 }}>
                  <Tabs.Tab value="records" leftSection={<IconDatabase size={14} />}>
                    仿真记录
                  </Tabs.Tab>
                  <Tabs.Tab value="timeline" leftSection={<IconTimeline size={14} />}>
                    事件时间轴
                  </Tabs.Tab>
                  <Tabs.Tab value="events" leftSection={<IconAlertTriangle size={14} />}>
                    事件列表
                  </Tabs.Tab>
                  <Tabs.Tab value="education" leftSection={<IconBook size={14} />}>
                    教学说明
                  </Tabs.Tab>
                </Tabs.List>

                <Box p="sm">
                  <Tabs.Panel value="records">
                    <SimulationRecords
                      records={records}
                      onDelete={handleDeleteRecord}
                      formatTime={formatTime}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="timeline">
                    <EventTimeline
                      events={events}
                      formatTime={formatTime}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="events">
                    <EventList
                      events={events}
                      formatTime={formatTime}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="education">
                    <EducationPanel />
                  </Tabs.Panel>
                </Box>
              </Tabs>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* 底部信息 */}
      <Paper shadow="xs" p="xs" radius="md" mt="md" withBorder>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            基于 NPUAP/EPUAP 国际压疮防治指南 | 增强版仿真引擎 v2.0
          </Text>
          <Group gap="sm">
            <Text size="xs" c="dimmed">临界时间: {formatTime(criticalTime)}</Text>
            <Text size="xs" c="dimmed">建议翻身: {formatTime(recommendedInterval)}</Text>
          </Group>
        </Group>
      </Paper>
    </Box>
  );
};