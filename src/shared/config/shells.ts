/**
 * 系统外壳配置管理
 * 前端配置化多个系统外壳，动态管理：
 * - LOGO 和标题
 * - 侧栏菜单
 * - 配色方案
 * - 功能模块
 */

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export interface ShellConfig {
  id: string;
  name: string; // 外壳名称（用户可见）
  logo: string; // LOGO URL 或 base64
  title: string; // 系统标题
  primaryColor: string; // Mantine 颜色名
  menuItems: MenuItem[]; // 侧栏菜单项
}

/**
 * 系统外壳预设配置
 * 可根据需求添加更多外壳
 */
export const SHELL_CONFIGS: Record<string, ShellConfig> = {
  // 外壳 1：设备管理系统
  device: {
    id: 'device',
    name: '设备管理系统',
    logo: '📱',
    title: 'Device Manager',
    primaryColor: 'blue',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: '📊' },
      { id: 'devices', label: '设备管理', path: '/devices', icon: '📱' },
      { id: 'monitoring', label: '监控中心', path: '/monitoring', icon: '📈' },
      { id: 'settings', label: '系统设置', path: '/settings', icon: '⚙️' },
    ],
  },

  // 外壳 2：患者管理系统
  patient: {
    id: 'patient',
    name: '患者管理系统',
    logo: '🏥',
    title: 'Patient Manager',
    primaryColor: 'green',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: '📊' },
      { id: 'patients', label: '患者列表', path: '/patients', icon: '👥' },
      { id: 'records', label: '病历管理', path: '/records', icon: '📋' },
      { id: 'appointments', label: '预约管理', path: '/appointments', icon: '📅' },
    ],
  },

  // 外壳 3：数据分析系统
  analytics: {
    id: 'analytics',
    name: '数据分析系统',
    logo: '📊',
    title: 'Analytics Dashboard',
    primaryColor: 'cyan',
    menuItems: [
      { id: 'dashboard', label: '仪表板', path: '/', icon: '📊' },
      { id: 'reports', label: '数据报告', path: '/reports', icon: '📑' },
      { id: 'charts', label: '数据可视化', path: '/charts', icon: '📈' },
      { id: 'exports', label: '数据导出', path: '/exports', icon: '💾' },
    ],
  },

  // 外壳 4：简约系统
  minimal: {
    id: 'minimal',
    name: '简约系统',
    logo: '✨',
    title: 'Simple Dashboard',
    primaryColor: 'gray',
    menuItems: [
      { id: 'dashboard', label: '首页', path: '/', icon: '🏠' },
      { id: 'help', label: '帮助', path: '/help', icon: '❓' },
    ],
  },
};

/**
 * 默认外壳
 */
export const DEFAULT_SHELL_ID = 'device';

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
