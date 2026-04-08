/**
 * API 类型定义
 */

// ==================== 通用类型 ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// ==================== 设备枚举 ====================

export const DeviceTypes = {
  MATTRESS: 'mattress',
  SMART_MATTRESS: 'smart_mattress',
  HEART_RATE_MONITOR: 'heart_rate_monitor',
  BLOOD_PRESSURE_MONITOR: 'blood_pressure_monitor',
  GLUCOSE_METER: 'glucose_meter',
  FALL_DETECTOR: 'fall_detector',
  SPO2_SENSOR: 'spo2_sensor',
} as const;

export const DeviceStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
} as const;

// ==================== 认证相关 ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserInfo {
  id: string;
  username: string;
  role_id: string;
  role_name: string;
  is_system_role: boolean;
  accessible_modules: ModuleCode[];
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface LogoutRequest {
  refresh_token?: string;
}

// ==================== 用户相关 ====================

export interface User {
  id: string;
  username: string;
  role_id: string;
  role_name?: string;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  status: string;
  last_login_at?: string | null;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role_id: string;
  email?: string | null;
  phone?: string | null;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
}

export interface UserQuery {
  role_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  page_size: number;
}

// ==================== 患者相关 ====================

export interface Patient {
  id: string;
  name: string;
  gender?: string | null;
  birth_date?: string | null;
  external_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientDetail extends Patient {
  profile?: PatientProfile | null;
}

export interface PatientProfile {
  id: string;
  patient_id: string;
  bed_number?: string | null;
  ward?: string | null;
  admission_date?: string | null;
  discharge_date?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  name: string;
  gender?: string | null;
  birth_date?: string | null;
  external_id?: string | null;
}

export interface UpdatePatientRequest {
  name?: string;
  gender?: string | null;
  birth_date?: string | null;
  external_id?: string | null;
}

export interface CreatePatientProfileRequest {
  bed_number?: string | null;
  ward?: string | null;
  admission_date?: string | null;
  discharge_date?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
}

export interface UpdatePatientProfileRequest extends CreatePatientProfileRequest {}

export interface PatientQuery {
  name?: string;
  external_id?: string;
  page?: number;
  page_size?: number;
}

export interface PatientListResponse {
  data: Patient[];
  total: number;
  page: number;
  page_size: number;
}

// ==================== 设备相关 ====================

export interface Device {
  id: string;
  serial_number: string;
  device_type: string;
  firmware_version?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  current_binding?: {
    id: string;
    patient_id: string;
    patient_name?: string;
  } | null;
}

export interface DeviceStatsResponse {
  total: number;
  active: number;
  inactive: number;
  online: number;
  offline: number;
}

export interface RegisterDeviceRequest {
  serial_number: string;
  device_type: string;
  firmware_version?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDeviceRequest {
  firmware_version?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceQuery {
  device_type?: string;
  status?: string;
  serial_number?: string;
  page?: number;
  page_size?: number;
}

export interface DeviceListResponse {
  devices: Device[];
  total: number;
  page: number;
  page_size: number;
}

// ==================== 绑定相关 ====================

export interface Binding {
  id: string;
  device_id: string;
  patient_id: string;
  bound_at: string;
  started_at?: string; // 别名
  unbound_at?: string | null;
  ended_at?: string | null; // 别名
  status: string;
  notes?: string | null;
  device_serial_number?: string;
  patient_name?: string;
}

export interface BindingListResponse {
  bindings: Binding[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateBindingRequest {
  device_id: string;
  patient_id: string;
  notes?: string | null;
}

export interface BindingQuery {
  device_id?: string;
  patient_id?: string;
  active_only?: boolean;
  page?: number;
  page_size?: number;
}

// ==================== 数据相关 ====================

export interface DataRecord {
  time: string;
  device_id?: string | null;
  patient_id?: string | null;
  data_type: string;
  data_category?: 'metric' | 'event';
  value_numeric?: number | null;
  value_text?: string | null;
  severity?: 'info' | 'warning' | 'alert';
  status?: 'active' | 'acknowledged' | 'resolved';
  payload?: Record<string, any>;
  source?: string;
  ingested_at?: string;
}

export interface DataQueryResponse {
  data: DataRecord[];
  total: number;
  page: number;
  page_size: number;
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface DataReportRequest {
  device_id: string;
  data_type: string;
  data_category?: 'metric' | 'event';
  severity?: 'info' | 'warning' | 'alert';
  value?: number | null;
  unit?: string | null;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface DataReportResponse {
  success: boolean;
  message?: string;
  record_id?: string;
}

export interface DataQuery {
  patient_id?: string;
  device_id?: string;
  data_type?: string;
  data_category?: string;
  severity?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
}

// ==================== 模块相关 ====================

export type ModuleCode = 
  | 'dashboard'
  | 'patients'
  | 'devices'
  | 'bindings'
  | 'data'
  | 'users'
  | 'roles'
  | 'audit_logs'
  | 'settings'
  | 'pressure_ulcer';

export interface Module {
  id: string;
  code: ModuleCode;
  name: string;
  description?: string | null;
  category: 'core' | 'admin' | 'feature';
  is_active: boolean;
  created_at: string;
}

export interface ModuleListResponse {
  modules: Module[];
}

export interface RoleModuleResponse {
  role_id: string;
  modules: Module[];
}

export interface AssignModuleRequest {
  module_id: string;
}

export interface BatchAssignModulesRequest {
  module_ids: string[];
}

export interface SetRoleModulesRequest {
  module_ids: string[];
}

// ==================== 权限相关（已废弃）====================

/** @deprecated 请使用 Module 替代 */
export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string | null;
  created_at: string;
}

/** @deprecated 请使用 ModuleListResponse 替代 */
export interface PermissionListResponse {
  permissions: Permission[];
}

/** @deprecated 请使用 RoleModuleResponse 替代 */
export interface RolePermissionResponse {
  role_id: string;
  permissions: Permission[];
}

/** @deprecated 请使用 AssignModuleRequest 替代 */
export interface AssignPermissionRequest {
  permission_id: string;
}

// ==================== 角色相关 ====================

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
}

export interface UpdateRoleRequest {
  name?: string | null;
  description?: string | null;
}

export interface RoleQuery {
  name?: string;
  page?: number;
  page_size?: number;
}

export interface RoleListResponse {
  roles: Role[];
  total: number;
}

// ==================== 审计日志相关 ====================

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  resource: string;
  resource_id?: string | null;
  details: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  status: string;
  error_message?: string | null;
  duration_ms?: number | null;
  created_at: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditLogQuery {
  user_id?: string;
  action?: string;
  resource?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
}

// ==================== 原始数据相关 ====================

export interface RawDataRecord {
  id: string;
  source: string;
  serial_number?: string | null;
  device_type?: string | null;
  status: string;
  status_message?: string | null;
  payload_size?: number;
  raw_payload_preview?: string | null;
  received_at: string;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawDataQueryResponse {
  data: RawDataRecord[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface RawDataQuery {
  source?: string;
  serial_number?: string;
  device_type?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
}