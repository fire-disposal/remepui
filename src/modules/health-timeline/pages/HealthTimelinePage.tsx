import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
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
  Chip,
  SegmentedControl,
} from '@mantine/core';
import {
  IconCalendar,
  IconRefresh,
  IconFilter,
  IconZoomIn,
  IconZoomOut,
  IconRestore,
  IconDeviceDesktopAnalytics,
} from '@tabler/icons-react';
import { useDataSubscription, useAcknowledgeEvent, useResolveEvent, usePatients, useDevices } from '../../../shared/api';
import type { DataRecord } from '../../../shared/api/types';
import { TimelineVisualization } from '../components/TimelineVisualization';
import { EventDetailPanel } from '../components/EventDetailPanel';

import type { SegmentedControlItem } from '@mantine/core';

const TIME_RANGES: SegmentedControlItem[] = [
  { value: '1h', label: '1小时' },
  { value: '6h', label: '6小时' },
  { value: '24h', label: '24小时' },
  { value: '7d', label: '7天' },
  { value: '30d', label: '30天' },
];

type TimeRange = typeof TIME_RANGES[number]['value'];

export function HealthTimelinePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(['info', 'warning', 'alert']);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DataRecord | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<DataRecord | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight - 200 });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight - 200 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const { data: rawData, isLoading, isFetching, refetch, isWsConnected } = useDataSubscription({
    query: {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      patient_id: selectedPatient || undefined,
      device_id: selectedDevice || undefined,
      page_size: 1000,
    },
    staleTime: 30000,
  });

  const { data: patientsData } = usePatients();
  const { data: devicesData } = useDevices();

  const acknowledgeMutation = useAcknowledgeEvent();
  const resolveMutation = useResolveEvent();

  const allData = useMemo(() => {
    console.log('[HealthTimeline] rawData:', rawData);
    return rawData || [];
  }, [rawData]);

  const allDataTypes = useMemo(() => {
    const types = new Set(allData.map((d) => d.data_type).filter(Boolean));
    const result = Array.from(types);
    console.log('[HealthTimeline] allDataTypes:', result);
    return result;
  }, [allData]);

  const filteredData = useMemo(() => {
    const result = allData.filter((record) => {
      const isEvent = record.data_category === 'event';
      
      if (isEvent && selectedSeverities.length > 0) {
        if (!selectedSeverities.includes(record.severity || '')) {
          return false;
        }
      }

      if (selectedDataTypes.length > 0) {
        if (!selectedDataTypes.includes(record.data_type)) {
          return false;
        }
      }

      return true;
    });
    console.log('[HealthTimeline] filteredData count:', result.length);
    return result;
  }, [allData, selectedSeverities, selectedDataTypes]);

  const stats = useMemo(() => {
    const events = filteredData.filter((d) => d.data_category === 'event');
    const metrics = filteredData.filter((d) => d.data_category === 'metric');
    const activeAlerts = events.filter((e) => e.status === 'active' && e.severity === 'alert');

    return {
      total: filteredData.length,
      events: events.length,
      metrics: metrics.length,
      activeAlerts: activeAlerts.length,
    };
  }, [filteredData]);

  const handleEventClick = useCallback((event: DataRecord) => {
    setSelectedEvent(event);
  }, []);

  const handleEventHover = useCallback((event: DataRecord | null) => {
    setHoveredEvent(event);
  }, []);

  const handleAcknowledge = useCallback((event: DataRecord) => {
    if (!event.patient_id) return;

    acknowledgeMutation.mutate({
      patient_id: event.patient_id,
      time: event.time,
      device_id: event.device_id || undefined,
    }, {
      onSuccess: () => {
        setSelectedEvent(null);
      },
    });
  }, [acknowledgeMutation]);

  const handleResolve = useCallback((event: DataRecord) => {
    if (!event.patient_id) return;

    resolveMutation.mutate({
      patient_id: event.patient_id,
      time: event.time,
      device_id: event.device_id || undefined,
    }, {
      onSuccess: () => {
        setSelectedEvent(null);
      },
    });
  }, [resolveMutation]);

  const patients = patientsData?.data || [];
  const devices = devicesData?.data || [];

  return (
    <Container fluid py="md" style={{ height: 'calc(100vh - 100px)' }} ref={containerRef}>
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <Group>
            <IconDeviceDesktopAnalytics size={28} />
            <div>
              <Title order={2}>健康数据时间轴</Title>
              <Text size="sm" c="dimmed">
                实时监控健康指标与事件
                {isWsConnected && (
                  <Badge size="xs" color="green" ml={8}>
                    实时连接
                  </Badge>
                )}
              </Text>
            </div>
          </Group>
          <Group>
            <Tooltip label="刷新数据">
              <ActionIcon variant="light" onClick={() => refetch()} loading={isFetching}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Group>
              <SegmentedControl
                value={timeRange}
                onChange={(value) => setTimeRange(value as TimeRange)}
                data={TIME_RANGES}
                size="sm"
              />

              <Select
                placeholder="选择患者"
                data={patients.map((p) => ({ value: p.id, label: p.name }))}
                value={selectedPatient}
                onChange={setSelectedPatient}
                clearable
                size="sm"
                style={{ width: 200 }}
              />

              <Select
                placeholder="选择设备"
                data={devices.map((d) => ({ value: d.id, label: d.serial_number }))}
                value={selectedDevice}
                onChange={setSelectedDevice}
                clearable
                size="sm"
                style={{ width: 200 }}
              />
            </Group>

            <Group>
              <Chip.Group multiple value={selectedSeverities} onChange={setSelectedSeverities}>
                <Chip value="info" color="blue" size="sm">
                  信息
                </Chip>
                <Chip value="warning" color="orange" size="sm">
                  警告
                </Chip>
                <Chip value="alert" color="red" size="sm">
                  警报
                </Chip>
              </Chip.Group>
            </Group>
          </Group>

          {allDataTypes.length > 0 && (
            <Group mt="md">
              <Text size="sm" c="dimmed">
                数据类型：
              </Text>
              <Chip.Group multiple value={selectedDataTypes} onChange={setSelectedDataTypes}>
                {allDataTypes.slice(0, 8).map((type) => (
                  <Chip key={type} value={type} size="sm">
                    {type}
                  </Chip>
                ))}
              </Chip.Group>
            </Group>
          )}
        </Paper>

        <Paper p="md" withBorder>
          <Group mb="md">
            <Badge size="lg" variant="light" color="blue">
              总计: {stats.total}
            </Badge>
            <Badge size="lg" variant="light" color="purple">
              事件: {stats.events}
            </Badge>
            <Badge size="lg" variant="light" color="cyan">
              指标: {stats.metrics}
            </Badge>
            {stats.activeAlerts > 0 && (
              <Badge size="lg" variant="filled" color="red">
                活跃警报: {stats.activeAlerts}
              </Badge>
            )}
          </Group>

          <Box style={{ position: 'relative', minHeight: 400 }}>
            {isLoading ? (
              <Center style={{ height: dimensions.height }}>
                <Stack align="center">
                  <Loader size="lg" />
                  <Text c="dimmed">加载数据中...</Text>
                </Stack>
              </Center>
            ) : filteredData.length === 0 ? (
              <Center style={{ height: dimensions.height }}>
                <Stack align="center">
                  <IconCalendar size={48} color="gray" />
                  <Text c="dimmed">暂无数据</Text>
                  <Text size="sm" c="dimmed">
                    提示：请确认时间范围和数据过滤条件
                  </Text>
                </Stack>
              </Center>
            ) : dimensions.width > 0 && dimensions.height > 0 ? (
              <TimelineVisualization
                data={filteredData}
                width={dimensions.width}
                height={dimensions.height}
                startTime={startTime}
                endTime={endTime}
                onEventClick={handleEventClick}
                onEventHover={handleEventHover}
              />
            ) : (
              <Center style={{ height: 400 }}>
                <Text c="dimmed">等待容器初始化...</Text>
              </Center>
            )}

            {selectedEvent && (
              <EventDetailPanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
                isAcknowledging={acknowledgeMutation.isPending}
                isResolving={resolveMutation.isPending}
              />
            )}

            {hoveredEvent && !selectedEvent && (
              <Box
                style={{
                  position: 'absolute',
                  left: 10,
                  bottom: 10,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                {hoveredEvent.data_type} - {new Date(hoveredEvent.time).toLocaleString('zh-CN')}
              </Box>
            )}
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}