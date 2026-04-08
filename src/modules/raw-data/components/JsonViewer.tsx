import { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Collapse,
  ScrollArea,
  Button,
  Code,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconCheck,
  IconBraces,
  IconFileText,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface JsonViewerProps {
  data: any;
  title?: string;
  maxHeight?: number;
  collapsed?: boolean;
}

export const JsonViewer = ({ 
  data, 
  title, 
  maxHeight = 400,
  collapsed: defaultCollapsed = false 
}: JsonViewerProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const lineCount = jsonString.split('\n').length;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      notifications.show({
        title: '复制成功',
        message: 'JSON 已复制到剪贴板',
        color: 'green',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      notifications.show({
        title: '复制失败',
        message: '无法复制到剪贴板',
        color: 'red',
      });
    }
  };

  const getValueType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getValueColor = (value: any): string => {
    const type = getValueType(value);
    switch (type) {
      case 'string': return 'green';
      case 'number': return 'blue';
      case 'boolean': return 'orange';
      case 'null': return 'gray';
      case 'array': return 'grape';
      case 'object': return 'cyan';
      default: return 'dark';
    }
  };

  const renderValue = (value: any, depth = 0): React.ReactNode => {
    if (value === null) {
      return <Text component="span" color="gray">null</Text>;
    }
    
    if (typeof value === 'string') {
      return <Text component="span" color="green">"{value}"</Text>;
    }
    
    if (typeof value === 'number') {
      return <Text component="span" color="blue">{value}</Text>;
    }
    
    if (typeof value === 'boolean') {
      return <Text component="span" color="orange">{value.toString()}</Text>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text component="span">[]</Text>;
      }
      return (
        <Stack gap={2} ml={depth > 0 ? 20 : 0}>
          <Text component="span">[</Text>
          {value.map((item, index) => (
            <Group key={index} gap={4} ml={20}>
              <Text component="span" color="dimmed" size="sm">{index}:</Text>
              {renderValue(item, depth + 1)}
              {index < value.length - 1 && <Text component="span">,</Text>}
            </Group>
          ))}
          <Text component="span" ml={0}>]</Text>
        </Stack>
      );
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <Text component="span">{ '{}'}</Text>;
      }
      return (
        <Stack gap={2} ml={depth > 0 ? 20 : 0}>
          <Text component="span">{'{'}</Text>
          {entries.map(([key, val], index) => (
            <Group key={key} gap={4} ml={20}>
              <Text component="span" color="violet" fw={500}>"{key}":</Text>
              {renderValue(val, depth + 1)}
              {index < entries.length - 1 && <Text component="span">,</Text>}
            </Group>
          ))}
          <Text component="span" ml={0}>{'}'}</Text>
        </Stack>
      );
    }
    
    return <Text component="span">{String(value)}</Text>;
  };

  return (
    <Paper withBorder p="sm">
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <IconChevronRight size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </ActionIcon>
            {title && (
              <Group gap={4}>
                <IconBraces size={16} color="var(--mantine-color-violet-6)" />
                <Text fw={500} size="sm">{title}</Text>
              </Group>
            )}
            <Badge size="xs" variant="light" color="gray">
              {lineCount} 行
            </Badge>
          </Group>
          <Tooltip label={copied ? '已复制' : '复制 JSON'}>
            <ActionIcon
              variant="light"
              size="sm"
              onClick={handleCopy}
              color={copied ? 'green' : 'gray'}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>

        <Collapse in={!collapsed}>
          <ScrollArea.Autosize mah={maxHeight}>
            <Paper
              p="sm"
              style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
            >
              {renderValue(data)}
            </Paper>
          </ScrollArea.Autosize>
        </Collapse>
      </Stack>
    </Paper>
  );
};