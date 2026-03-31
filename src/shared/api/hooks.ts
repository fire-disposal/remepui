/**
 * React Query Hooks for API
 * 提供便捷的数据获取和缓存
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./auth";
import { userApi } from "./user";
import { patientApi } from "./patient";
import { deviceApi } from "./device";
import { bindingApi } from "./binding";
import { dataApi } from "./data";
import { roleApi, permissionApi } from "./role";
import { auditApi } from "./audit";
import type {
  LoginRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserQuery,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientQuery,
  RegisterDeviceRequest,
  UpdateDeviceRequest,
  DeviceQuery,
  CreateBindingRequest,
  BindingQuery,
  DataQuery,
  DataReportRequest,
  ChangePasswordRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleQuery,
  AssignPermissionRequest,
  AuditLogQuery,
} from "./types";

// ==================== Query Keys ====================

export const queryKeys = {
  users: (query?: UserQuery) => ["users", query] as const,
  user: (id: string) => ["user", id] as const,
  patients: (query?: PatientQuery) => ["patients", query] as const,
  patient: (id: string) => ["patient", id] as const,
  patientDetail: (id: string) => ["patient", id, "detail"] as const,
  devices: (query?: DeviceQuery) => ["devices", query] as const,
  device: (id: string) => ["device", id] as const,
  bindings: (query?: BindingQuery) => ["bindings", query] as const,
  data: (query?: DataQuery) => ["data", query] as const,
  roles: (query?: RoleQuery) => ["roles", query] as const,
  role: (id: string) => ["role", id] as const,
  permissions: () => ["permissions"] as const,
  auditLogs: (query?: AuditLogQuery) => ["audit-logs", query] as const,
  auditLog: (id: string) => ["audit-log", id] as const,
};

// ==================== Auth Hooks ====================

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: () => {
      // 登录成功后清除所有缓存，重新获取数据
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // 清除所有缓存
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  });
}

// ==================== User Hooks ====================

export function useUsers(query?: UserQuery) {
  return useQuery({
    queryKey: queryKeys.users(query),
    queryFn: () => userApi.list(query),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userApi.get(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ==================== Patient Hooks ====================

export function usePatients(query?: PatientQuery) {
  return useQuery({
    queryKey: queryKeys.patients(query),
    queryFn: () => patientApi.list(query),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patient(id),
    queryFn: () => patientApi.get(id),
    enabled: !!id,
  });
}

export function usePatientDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.patientDetail(id),
    queryFn: () => patientApi.getDetail(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientRequest }) =>
      patientApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patient(id) });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

// ==================== Device Hooks ====================

export function useDevices(query?: DeviceQuery) {
  return useQuery({
    queryKey: queryKeys.devices(query),
    queryFn: () => deviceApi.list(query),
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: queryKeys.device(id),
    queryFn: () => deviceApi.get(id),
    enabled: !!id,
  });
}

export function useRegisterDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterDeviceRequest) => deviceApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeviceRequest }) =>
      deviceApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.device(id) });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deviceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

// ==================== Binding Hooks ====================

export function useBindings(query?: BindingQuery) {
  return useQuery({
    queryKey: queryKeys.bindings(query),
    queryFn: () => bindingApi.list(query),
  });
}

export function useCreateBinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBindingRequest) => bindingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bindings"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useDeleteBinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bindingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bindings"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

// ==================== Data Hooks ====================

export function useData(query?: DataQuery) {
  return useQuery({
    queryKey: queryKeys.data(query),
    queryFn: () => dataApi.query(query),
  });
}

export function useReportData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DataReportRequest) => dataApi.report(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["data"] });
      if (data.device_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.data({ device_id: data.device_id }),
        });
      }
    },
  });
}

// ==================== Role Hooks ====================

export function useRoles(query?: RoleQuery) {
  return useQuery({
    queryKey: queryKeys.roles(query),
    queryFn: () => roleApi.list(query),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: queryKeys.role(id),
    queryFn: () => roleApi.get(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      roleApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.role(id) });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useRolePermissions(id: string) {
  return useQuery({
    queryKey: ["role-permissions", id],
    queryFn: () => roleApi.getPermissions(id),
    enabled: !!id,
  });
}

export function useAssignPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPermissionRequest }) =>
      roleApi.assignPermission(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", id] });
    },
  });
}

export function useRevokePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionId }: { id: string; permissionId: string }) =>
      roleApi.revokePermission(id, permissionId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", id] });
    },
  });
}

// ==================== Permission Hooks ====================

export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.permissions(),
    queryFn: () => permissionApi.list(),
  });
}

// ==================== Audit Log Hooks ====================

export function useAuditLogs(query?: AuditLogQuery) {
  return useQuery({
    queryKey: queryKeys.auditLogs(query),
    queryFn: () => auditApi.list(query),
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: queryKeys.auditLog(id),
    queryFn: () => auditApi.get(id),
    enabled: !!id,
  });
}