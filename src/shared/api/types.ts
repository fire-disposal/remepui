/**
 * API 类型定义
 * 与后端 remipedia API 接口对应
 */

// ==================== 通用类型 ====================

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ==================== 认证相关 ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  user: UserInfo;
  expires_at: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface UserInfo {
  id: string;
  username: string;
  role: string;
}

// ==================== 用户相关 ====================

export interface User {
  id: string;
  username: string;
  role: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  status: string;
  last_login_at?: string;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role?: string;
  phone?: string;
  email?: string;
}

export interface UpdateUserRequest {
  phone?: string;
  email?: string;
  avatar_url?: string;
  status?: string;
}

export interface UserQuery {
  username?: string;
  role?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

// ==================== 患者相关 ====================

export interface Patient {
  id: string;
  name: string;
  external_id?: string;
  created_at: string;
}

export interface PatientProfile {
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  contact_phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_id?: string;
  allergies: unknown[];
  medical_history: unknown[];
  notes?: string;
  tags: string[];
}

export interface PatientDetail {
  id: string;
  name: string;
  external_id?: string;
  profile?: PatientProfile;
  created_at: string;
}

export interface CreatePatientRequest {
  name: string;
  external_id?: string;
}

export interface UpdatePatientRequest {
  name?: string;
  external_id?: string;
}

export interface CreatePatientProfileRequest {
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  contact_phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_id?: string;
  allergies?: unknown[];
  medical_history?: unknown[];
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export type UpdatePatientProfileRequest = CreatePatientProfileRequest;

export interface PatientQuery {
  name?: string;
  external_id?: string;
  page?: number;
  page_size?: number;
}

// ==================== 设备相关 ====================

export interface BindingInfo {
  binding_id: string;
  patient_id: string;
  patient_name?: string;
  started_at: string;
}

export interface Device {
  id: string;
  serial_number: string;
  device_type: string;
  firmware_version?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  current_binding?: BindingInfo;
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

// ==================== 绑定相关 ====================

export interface Binding {
  id: string;
  device_id: string;
  patient_id: string;
  started_at: string;
  ended_at?: string;
  notes?: string;
}

export interface CreateBindingRequest {
  device_id: string;
  patient_id: string;
  notes?: string;
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
  device_id: string;
  subject_id?: string;
  data_type: string;
  payload: Record<string, unknown>;
  source: string;
  ingested_at: string;
}

export interface DataReportRequest {
  device_id: string;
  data_type: string;
  time?: string;
  payload: Record<string, unknown>;
}

export interface DataReportResponse {
  success: boolean;
  time: string;
  device_id: string;
}

export interface DataQuery {
  device_id?: string;
  subject_id?: string;
  data_type?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
}

// ==================== 设备类型枚举 ====================

export const DeviceTypes = {
  HEART_RATE_MONITOR: 'heart_rate_monitor',
  FALL_DETECTOR: 'fall_detector',
  SPO2_SENSOR: 'spo2_sensor',
  SMART_MATTRESS: 'smart_mattress',
} as const;

export const DeviceStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
} as const;

export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOCKED: 'locked',
} as const;