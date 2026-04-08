/**
 * 系统外壳配置管理
 * 前端配置化多个系统外壳，动态管理：
 * - Favicon
 * - LOGO 和标题
 * - 侧栏菜单（基于模块的权限控制）
 * - 配色方案（基于 Mantine 色阶系统）
 * - 功能模块
 */

import {
  IconHome,
  IconUsers,
  IconDeviceDesktop,
  IconLink,
  IconChartLine,
  IconUser,
  IconPalette,
  IconHeartbeat,
  IconDeviceMobile,
  IconShield,
  IconStar,
  IconFlame,
  IconHeart,
  IconClipboardText,
  IconLock,
} from "@tabler/icons-react";
import type { ModuleCode } from "../api/types";

// 图标映射表 - 将图标名称映射到 Tabler Icons 组件
export const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string }>> = {
  home: IconHome,
  users: IconUsers,
  device: IconDeviceDesktop,
  link: IconLink,
  chart: IconChartLine,
  user: IconUser,
  palette: IconPalette,
  heartbeat: IconHeartbeat,
  mobile: IconDeviceMobile,
  shield: IconShield,
  star: IconStar,
  flame: IconFlame,
  heart: IconHeart,
  clipboard: IconClipboardText,
  lock: IconLock,
};

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string; // 图标名称，对应 ICON_MAP 中的 key
  /** 关联的模块代码，用于权限控制 */
  module: ModuleCode;
}

export interface ShellConfig {
  id: string;
  name: string; // 外壳名称（用户可见）
  logo: string; // LOGO (emoji 或图片 URL)
  favicon?: string; // Favicon URL (可选，默认使用 logo)
  title: string; // 系统标题
  description?: string; // 系统描述
  primaryColor: string; // Mantine 颜色名，自动支持色阶和深色模式
  menuItems: MenuItem[]; // 侧栏菜单项
}

/**
 * 系统外壳预设配置
 * 可根据需求添加更多外壳
 * 
 * 模块说明：
 * - dashboard: 仪表板
 * - patients: 患者管理
 * - devices: 设备管理
 * - bindings: 绑定关系
 * - data: 数据查询
 * - users: 用户管理（管理模块）
 * - roles: 角色管理（管理模块）
 * - audit_logs: 审计日志（管理模块）
 * - settings: 系统设置（管理模块）
 * - pressure_ulcer: 压疮教学（特色功能）
 */
export const SHELL_CONFIGS: Record<string, ShellConfig> = {
  // 外壳 1：IoT 健康平台（默认）
  default: {
    id: 'default',
    name: 'IoT 健康平台',
    logo: '🏥',
    title: 'Remipedia',
    description: 'IoT 健康数据管理平台',
    primaryColor: 'blue',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: 'home', module: 'dashboard' },
      { id: 'patients', label: '患者管理', path: '/patients', icon: 'users', module: 'patients' },
      { id: 'devices', label: '设备管理', path: '/devices', icon: 'device', module: 'devices' },
      { id: 'bindings', label: '绑定关系', path: '/bindings', icon: 'link', module: 'bindings' },
      { id: 'data', label: '数据查询', path: '/data', icon: 'chart', module: 'data' },
      { id: 'users', label: '用户管理', path: '/users', icon: 'user', module: 'users' },
      { id: 'settings', label: '外壳设置', path: '/settings/shell', icon: 'palette', module: 'settings' },
    ],
  },

  // 外壳 2：设备管理系统
  device: {
    id: 'device',
    name: '设备管理系统',
    logo: '📱',
    title: 'Device Manager',
    description: 'IoT 设备管理控制台',
    primaryColor: 'violet',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: 'home', module: 'dashboard' },
      { id: 'devices', label: '设备管理', path: '/devices', icon: 'device', module: 'devices' },
      { id: 'bindings', label: '绑定关系', path: '/bindings', icon: 'link', module: 'bindings' },
      { id: 'data', label: '数据查询', path: '/data', icon: 'chart', module: 'data' },
      { id: 'settings', label: '外壳设置', path: '/settings/shell', icon: 'palette', module: 'settings' },
    ],
  },

  // 外壳 3：患者管理系统
  patient: {
    id: 'patient',
    name: '患者管理系统',
    logo: '🏥',
    title: 'Patient Manager',
    description: '患者健康档案管理系统',
    primaryColor: 'green',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: 'home', module: 'dashboard' },
      { id: 'patients', label: '患者列表', path: '/patients', icon: 'users', module: 'patients' },
      { id: 'bindings', label: '设备绑定', path: '/bindings', icon: 'link', module: 'bindings' },
      { id: 'data', label: '健康数据', path: '/data', icon: 'chart', module: 'data' },
      { id: 'settings', label: '外壳设置', path: '/settings/shell', icon: 'palette', module: 'settings' },
    ],
  },

  // 外壳 4：数据分析系统
  analytics: {
    id: 'analytics',
    name: '数据分析系统',
    logo: '📊',
    title: 'Analytics Dashboard',
    description: '健康数据分析与可视化平台',
    primaryColor: 'cyan',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: 'home', module: 'dashboard' },
      { id: 'data', label: '数据查询', path: '/data', icon: 'chart', module: 'data' },
      { id: 'devices', label: '设备管理', path: '/devices', icon: 'device', module: 'devices' },
      { id: 'settings', label: '外壳设置', path: '/settings/shell', icon: 'palette', module: 'settings' },
    ],
  },

  // 外壳 5：管理员视图
  admin: {
    id: 'admin',
    name: '管理员视图',
    logo: '🛡️',
    title: 'Admin Panel',
    description: '系统管理控制台',
    primaryColor: 'red',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: 'home', module: 'dashboard' },
      { id: 'users', label: '用户管理', path: '/users', icon: 'user', module: 'users' },
      { id: 'roles', label: '角色管理', path: '/roles', icon: 'shield', module: 'roles' },
      { id: 'modules', label: '模块权限', path: '/modules', icon: 'lock', module: 'roles' },
      { id: 'audit-logs', label: '审计日志', path: '/audit-logs', icon: 'clipboard', module: 'audit_logs' },
      { id: 'raw-data', label: '原始数据', path: '/raw-data', icon: 'device', module: 'data' },
      { id: 'patients', label: '患者管理', path: '/patients', icon: 'users', module: 'patients' },
      { id: 'devices', label: '设备管理', path: '/devices', icon: 'device', module: 'devices' },
      { id: 'bindings-visual', label: '可视化绑定', path: '/bindings-visual', icon: 'link', module: 'bindings' },
      { id: 'health-timeline', label: '健康时间轴', path: '/health-timeline', icon: 'chart', module: 'data' },
      { id: 'data', label: '数据查询', path: '/data', icon: 'chart', module: 'data' },
      { id: 'settings', label: '外壳设置', path: '/settings/shell', icon: 'palette', module: 'settings' },
    ],
  },

  // 外壳 6：简约视图
  minimal: {
    id: 'minimal',
    name: '简约视图',
    logo: '✨',
    title: 'Simple View',
    description: '简约功能视图',
    primaryColor: 'gray',
    menuItems: [
      { id: 'dashboard', label: '首页', path: '/', icon: 'home', module: 'dashboard' },
      { id: 'patients', label: '患者', path: '/patients', icon: 'users', module: 'patients' },
      { id: 'devices', label: '设备', path: '/devices', icon: 'device', module: 'devices' },
      { id: 'settings', label: '外壳设置', path: '/settings/shell', icon: 'palette', module: 'settings' },
    ],
  },

  // 外壳 7：橙色主题
  orange: {
    id: 'orange',
    name: '活力视图',
    logo: '🔥',
    title: 'Vitality Dashboard',
    description: '活力健康数据视图',
    primaryColor: 'orange',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: 'home', module: 'dashboard' },
      { id: 'patients', label: '患者管理', path: '/patients', icon: 'users', module: 'patients' },
      { id: 'devices', label: '设备管理', path: '/devices', icon: 'device', module: 'devices' },
      { id: 'data', label: '数据查询', path: '/data', icon: 'chart', module: 'data' },
      { id: 'settings', label: '外壳设置', path: '/settings/shell', icon: 'palette', module: 'settings' },
    ],
  },

  // 外壳 8：压力性损伤仿真教学
  'pressure-ulcer': {
    id: 'pressure-ulcer',
    name: '压疮仿真教学',
    logo: '🩹',
    title: 'Pressure Ulcer Simulation',
    description: '压力性损伤仿真教学系统',
    primaryColor: 'pink',
    menuItems: [
      { id: 'simulation', label: '仿真教学', path: '/pressure-ulcer', icon: 'heart', module: 'pressure_ulcer' },
    ],
  },
};

/**
 * 默认外壳
 */
export const DEFAULT_SHELL_ID = 'default';

/**
 * 获取外壳配置列表（用于下拉选单）
 */
export function getShellOptions(): Array<{ value: string; label: string }> {
  return Object.values(SHELL_CONFIGS).map((config) => ({
    value: config.id,
    label: config.name,
  }));
}

/**
 * 根据 ID 获取外壳配置
 */
export function getShellConfig(id: string): ShellConfig {
  return SHELL_CONFIGS[id] || SHELL_CONFIGS[DEFAULT_SHELL_ID];
}

/**
 * Mantine 支持的颜色列表
 */
export const MANTINE_COLORS = [
  'dark', 'gray', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue',
  'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'lime'
] as const;

export type MantineColor = typeof MANTINE_COLORS[number];