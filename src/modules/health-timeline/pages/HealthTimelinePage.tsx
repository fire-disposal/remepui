import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Group,
  Paper,
  Text,
  Badge,
  Select,
  Button,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  ScrollArea,
  Popover,
  Box,
  Chip,
  Drawer,
  Divider,
} from '@mantine/core';
import {
  IconCalendar,
  IconRefresh,
  IconFilter,
  IconHeartbeat,
  IconAlertTriangle,
  IconInfoCircle,
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
  IconRestore,
} from '@tabler/icons-react';
import { scaleTime, scaleLinear } from 'd3-scale';
import { timeFormat } from 'd3-time-format';
import { useData, useDevices, usePatients } from '../../../shared/api';
import { useQueryClient } from '@tanstack/react-query';

const SEVERITY_CONFIG = {
  info: { color: 'blue', icon: IconInfoCircle, label: '信息' },
  warning: { color: 'orange', icon: IconAlertTriangle, label: '警告' },
  alert: { color: 'red', icon: IconHeartbeat, label: '警报' },
};

const DATA_TYPE_CONFIG: Record<string, { color: string; shape: string }> = {
  heart_rate: { color: '#ef5350', shape: 'circle' },
  blood_pressure: { color: '#42a5f5', shape: 'diamond' },
  temperature: { color: '#ffa726', shape: 'triangle' },
  spo2: { color: '#ab47bc', shape: 'square' },
  fall_detection: { color: '#e91e63', shape: 'star' },
  pressure_alert: { color: '#9c27b0', shape: 'hexagon' },
};

export const HealthTimelinePage = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(['info', 'warning', 'alert']);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 计算时间范围
  const { startTime, endTime } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '1h':
        start.setHours(start.getHours() - 1);
        break;
      case '6h':
        start.setHours(start.getHours() - 6);
        break;
      case '24h':
        start.setDate(start.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
    }
    
    return { startTime: start, endTime: end };
  }, [timeRange]);

  // 使用TanStack Query获取数据
  const { 
    data: healthData, 
    isLoading, 
    refetch,
    isFetching,
  } = useData({
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    device_id: selectedDevice || undefined,
    patient_id: selectedPatient || undefined,
    severity: selectedSeverities.length > 0 ? selectedSeverities.join(',') : undefined,
    data_type: selectedDataTypes.length > 0 ? selectedDataTypes.join(',') : undefined,
    page_size: 1000,
  });

  // 并行获取设备列表（后台刷新）
  const { data: devicesData } = useDevices();
  
  // 并行获取患者列表（后台刷新）
  const { data: patientsData } = usePatients();

  const events = healthData?.data || [];
  const devices = devicesData?.data || [];
  const patients = patientsData?.data || [];

  // 预取下一页数据
  const prefetchNextPage = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['data', { 
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        page: 2 
      }],
      queryFn: () => fetch('/api/v1/data?page=2').then(r => r.json()),
    });
  }, [queryClient, startTime, endTime]);

  // 提取所有数据类型
  const allDataTypes = useMemo(() => {
    const types = new Set(events.map(e => e.data_type).filter(Boolean));
    return Array.from(types);
  }, [events]);

  // 过滤事件
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!selectedSeverities.includes(event.severity)) return false;
      if (selectedDataTypes.length > 0 && !selectedDataTypes.includes(event.data_type)) return false;
      return true;
    });
  }, [events, selectedSeverities, selectedDataTypes]);

  // 时间刻度
  const timeScale = useMemo(() => {
    const width = (timelineRef.current?.clientWidth || 1200) * zoomLevel;
    return scaleTime()
      .domain([startTime, endTime])
      .range([panOffset, width + panOffset]);
  }, [startTime, endTime, zoomLevel, panOffset]);

  // Y轴刻度
  const yScale = useMemo(() => {
    return scaleLinear()
      .domain([0, 100])
      .range([400, 50]);
  }, []);

  // 格式化时间
  const formatTime = timeFormat('%H:%M');
  const formatDate = timeFormat('%m/%d');
  const formatFullTime = timeFormat('%Y-%m-%d %H:%M:%S');

  // 时间刻度标记
  const timeTicks = useMemo(() => {
    const ticks: Date[] = [];
    const duration = endTime.getTime() - startTime.getTime();
    const tickCount = Math.floor(duration / (duration > 86400000 ? 86400000 : 3600000));
    
    for (let i = 0; i <= tickCount; i++) {
      const tick = new Date(startTime.getTime() + (duration / tickCount) * i);
      ticks.push(tick);
    }
    
    return ticks;
  }, [startTime, endTime]);

  // 缩放控制
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset(0);
  };

  // 导航时间范围
  const handleNavigateLeft = () => {
    const duration = endTime.getTime() - startTime.getTime();
    setPanOffset(prev => prev + duration * 0.2);
  };

  const handleNavigateRight = () => {
    const duration = endTime.getTime() - startTime.getTime();
    setPanOffset(prev => prev - duration * 0.2);
  };

  // 渲染事件点
  const renderEventPoint = useCallback((event: any, index: number) => {
    const x = timeScale(new Date(event.timestamp));
    const y = yScale(50 + Math.random() * 30); // 根据值定位
    const config = DATA_TYPE_CONFIG[event.data_type] || { color: '#888', shape: 'circle' };
    const severityConfig = SEVERITY_CONFIG[event.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
    
    const size = event.severity === 'alert' ? 16 : event.severity === 'warning' ? 12 : 10;
    
    return (
      <g key={event.id || index}>
        <circle
          cx={x}
          cy={y}
          r={size}
          fill={config.color}
          stroke={severityConfig.color}
          strokeWidth={event.severity === 'alert' ? 3 : 2}
          opacity={0.8}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHoveredEvent(event)}
          onMouseLeave={() => setHoveredEvent(null)}
        />
        {event.severity === 'alert' && (
          <circle
            cx={x}
            cy={y}
            r={size + 4}
            fill="none"
            stroke={severityConfig.color}
            strokeWidth={2}
            opacity={0.5}
          >
            <animate
              attributeName="r"
              from={size}
              to={size + 10}
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from={0.5}
              to={0}
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </g>
    );
  }, [timeScale, yScale]);

  return (
    <Container fluid py="md" style={{ height: 'calc(100vh - 100px)' }}>
      <Stack gap="md" h="100%">
        {/* 标题栏 */}
        <Group justify="space-between">
          <div>
            <Title order={2}>
              <Group gap="sm">
                <IconCalendar size={28} />
                健康数据时间轴
              </Group>
            </Title>
            <Text size="sm" color="dimmed" mt={4}>
              可视化查看健康事件和数据
            </Text>
          </div>
          <Group>
            <Tooltip label="刷新数据">
              <ActionIcon 
                variant="light" 
                onClick={() => refetch()}
                loading={isFetching}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              leftSection={<IconFilter size={16} />}
              variant="light"
              onClick={() => setDrawerOpen(true)}
            >
              筛选 ({filteredEvents.length})
            </Button>
          </Group>
        </Group>

        {/* 控制栏 */}
        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Group>
              <Chip.Group value={timeRange} onChange={(v) => setTimeRange(v as any)} multiple={false}>
                <Group gap="xs">
                  <Chip value="1h" variant="light">1小时</Chip>
                  <Chip value="6h" variant="light">6小时</Chip>
                  <Chip value="24h" variant="light" color="blue">24小时</Chip>
                  <Chip value="7d" variant="light">7天</Chip>
                  <Chip value="30d" variant="light">30天</Chip>
                </Group>
              </Chip.Group>
            </Group>
            <Group>
              <ActionIcon variant="light" onClick={handleNavigateLeft}>
                <IconChevronLeft size={18} />
              </ActionIcon>
              <ActionIcon variant="light" onClick={handleZoomOut}>
                <IconZoomOut size={18} />
              </ActionIcon>
              <Badge>{Math.round(zoomLevel * 100)}%</Badge>
              <ActionIcon variant="light" onClick={handleZoomIn}>
                <IconZoomIn size={18} />
              </ActionIcon>
              <ActionIcon variant="light" onClick={handleNavigateRight}>
                <IconChevronRight size={18} />
              </ActionIcon>
              <Tooltip label="重置视图">
                <ActionIcon variant="light" onClick={handleResetView}>
                  <IconRestore size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Paper>

        {/* 时间轴主区域 */}
        <Paper 
          withBorder 
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          ref={timelineRef}
        >
          {isLoading ? (
            <Center h="100%">
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text color="dimmed">加载健康数据...</Text>
              </Stack>
            </Center>
          ) : filteredEvents.length === 0 ? (
            <Center h="100%">
              <Stack align="center" gap="md">
                <IconCalendar size={48} opacity={0.3} />
                <Text color="dimmed">暂无数据</Text>
              </Stack>
            </Center>
          ) : (
            <ScrollArea h="100%" style={{ paddingBottom: 60 }}>
              <svg
                width="100%"
                height={500}
                style={{ minWidth: `${1200 * zoomLevel}px` }}
              >
                {/* 背景网格 */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* 时间刻度 */}
                {timeTicks.map((tick, i) => {
                  const x = timeScale(tick);
                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        y1={40}
                        x2={x}
                        y2={450}
                        stroke="#bdbdbd"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                      />
                      <text
                        x={x}
                        y={30}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#757575"
                      >
                        {formatTime(tick)}
                      </text>
                      <text
                        x={x}
                        y={20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#9e9e9e"
                      >
                        {formatDate(tick)}
                      </text>
                    </g>
                  );
                })}

                {/* 事件点 */}
                {filteredEvents.map((event, index) => renderEventPoint(event, index))}

                {/* 悬浮提示 */}
                {hoveredEvent && (
                  <g>
                    <rect
                      x={timeScale(new Date(hoveredEvent.timestamp)) - 100}
                      y={10}
                      width={200}
                      height={80}
                      fill="white"
                      stroke="#e0e0e0"
                      strokeWidth={1}
                      rx={4}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    />
                    <text
                      x={timeScale(new Date(hoveredEvent.timestamp)) - 90}
                      y={30}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {hoveredEvent.data_type}
                    </text>
                    <text
                      x={timeScale(new Date(hoveredEvent.timestamp)) - 90}
                      y={50}
                      fontSize="10"
                      fill="#757575"
                    >
                      时间: {formatFullTime(new Date(hoveredEvent.timestamp))}
                    </text>
                    <text
                      x={timeScale(new Date(hoveredEvent.timestamp)) - 90}
                      y={65}
                      fontSize="10"
                      fill={SEVERITY_CONFIG[hoveredEvent.severity]?.color || '#757575'}
                    >
                      严重级别: {SEVERITY_CONFIG[hoveredEvent.severity]?.label || hoveredEvent.severity}
                    </text>
                  </g>
                )}
              </svg>

              {/* 图例 */}
              <Paper
                p="md"
                style={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                }}
                withBorder
              >
                <Text size="sm" fw={500} mb="xs">数据类型图例</Text>
                <Group gap="md">
                  {Object.entries(DATA_TYPE_CONFIG).slice(0, 6).map(([type, config]) => (
                    <Group key={type} gap={4}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: config.color,
                        }}
                      />
                      <Text size="xs">{type.replace('_', ' ')}</Text>
                    </Group>
                  ))}
                </Group>
              </Paper>
            </ScrollArea>
          )}
        </Paper>

        {/* 统计信息 */}
        <Group>
          <Badge size="lg" color="blue">
            总事件: {events.length}
          </Badge>
          <Badge size="lg" color="green">
            显示: {filteredEvents.length}
          </Badge>
          <Badge size="lg" color="orange">
            警告: {events.filter(e => e.severity === 'warning').length}
          </Badge>
          <Badge size="lg" color="red">
            警报: {events.filter(e => e.severity === 'alert').length}
          </Badge>
        </Group>
      </Stack>

      {/* 筛选抽屉 */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="筛选条件"
        position="right"
        size="md"
      >
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">严重级别</Text>
            <Chip.Group
              value={selectedSeverities}
              onChange={(v) => setSelectedSeverities(v as string[])}
              multiple
            >
              <Group gap="xs">
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                  <Chip key={key} value={key} variant="light" color={config.color}>
                    {config.label}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </div>

          <Divider />

          <div>
            <Text size="sm" fw={500} mb="xs">数据类型</Text>
            <Chip.Group
              value={selectedDataTypes}
              onChange={(v) => setSelectedDataTypes(v as string[])}
              multiple
            >
              <Group gap="xs">
                {allDataTypes.map(type => (
                  <Chip key={type} value={type} variant="light">
                    {type.replace('_', ' ')}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </div>

          <Divider />

          <Select
            label="设备筛选"
            placeholder="选择设备"
            data={devices.map(d => ({
              value: d.id,
              label: `${d.serial_number} (${d.device_type})`,
            }))}
            value={selectedDevice}
            onChange={setSelectedDevice}
            clearable
            searchable
          />

          <Select
            label="患者筛选"
            placeholder="选择患者"
            data={patients.map(p => ({
              value: p.id,
              label: p.name || `患者 ${p.id.slice(0, 8)}`,
            }))}
            value={selectedPatient}
            onChange={setSelectedPatient}
            clearable
            searchable
          />

          <Button
            variant="light"
            fullWidth
            onClick={() => {
              setSelectedSeverities(['info', 'warning', 'alert']);
              setSelectedDataTypes([]);
              setSelectedDevice(null);
              setSelectedPatient(null);
            }}
          >
            重置筛选
          </Button>
        </Stack>
      </Drawer>
    </Container>
  );
};