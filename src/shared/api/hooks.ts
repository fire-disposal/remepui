/**
 * React Query Hooks for API
 * 提供便捷的数据获取和缓存
 * 
 * TanStack Query 优化策略：
 * - staleTime: 控制数据过期时间
 * - gcTime: 控制缓存保留时间
 * - refetchOnWindowFocus: 窗口聚焦时自动刷新
 * - retry: 失败重试策略
 * - select: 数据转换优化
 * - enabled: 条件查询
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { authApi } from "./auth";
import { userApi } from "./user";
import { patientApi } from "./patient";
import { deviceApi } from "./device";
import { bindingApi } from "./binding";
import { dataApi } from "./data";
import { roleApi, moduleApi, isAdmin, hasRoleName, hasRoleId } from "./role";
import { auditApi } from "./audit";
import { rawDataApi } from "./raw-data";
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
  AssignModuleRequest,
  BatchAssignModulesRequest,
  SetRoleModulesRequest,
  AuditLogQuery,
  RawDataQuery,
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
  deviceStats: () => ["devices", "stats"] as const,
  bindings: (query?: BindingQuery) => ["bindings", query] as const,
  data: (query?: DataQuery) => ["data", query] as const,
  roles: (query?: RoleQuery) => ["roles", query] as const,
  role: (id: string) => ["role", id] as const,
  modules: () => ["modules"] as const,
  roleModules: (id: string) => ["role-modules", id] as const,
  auditLogs: (query?: AuditLogQuery) => ["audit-logs", query] as const,
  auditLog: (id: string) => ["audit-log", id] as const,
};

// ==================== 默认查询配置 ====================

const defaultQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5分钟内数据视为新鲜
  gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
  refetchOnWindowFocus: true, // 窗口聚焦时刷新
  retry: 2, // 失败重试2次
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
};

const listQueryConfig = {
  ...defaultQueryConfig,
  staleTime: 2 * 60 * 1000, // 列表数据2分钟过期
};

const detailQueryConfig = {
  ...defaultQueryConfig,
  staleTime: 10 * 60 * 1000, // 详情数据10分钟过期
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
    ...listQueryConfig,
    select: (data) => ({
      ...data,
      data: data.data.map(user => ({
        ...user,
        displayName: user.username,
      })),
    }),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userApi.get(id),
    ...detailQueryConfig,
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.create(data),
    onSuccess: () => {
      // 使所有用户列表缓存失效
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error('Create user failed:', error);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.update(id, data),
    onSuccess: (_, { id }) => {
      // 更新单个用户缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
      // 刷新列表
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
    ...listQueryConfig,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patient(id),
    queryFn: () => patientApi.get(id),
    ...detailQueryConfig,
    enabled: !!id,
  });
}

export function usePatientDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.patientDetail(id),
    queryFn: () => patientApi.getDetail(id),
    ...detailQueryConfig,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.patientDetail(id) });
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
    ...listQueryConfig,
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: queryKeys.device(id),
    queryFn: () => deviceApi.get(id),
    ...detailQueryConfig,
    enabled: !!id,
  });
}

export function useDeviceStats() {
  return useQuery({
    queryKey: queryKeys.deviceStats(),
    queryFn: async () => {
      const res = await fetch('/api/v1/devices/stats');
      if (!res.ok) throw new Error('Failed to fetch device stats');
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}

export function useRegisterDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterDeviceRequest) => deviceApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.deviceStats() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.deviceStats() });
    },
  });
}

// ==================== Binding Hooks ====================

export function useBindings(query?: BindingQuery) {
  return useQuery({
    queryKey: queryKeys.bindings(query),
    queryFn: () => bindingApi.list(query),
    ...listQueryConfig,
  });
}

export function useCreateBinding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBindingRequest) => bindingApi.create(data),
    onSuccess: () => {
      // 使所有绑定缓存失效
      queryClient.invalidateQueries({ queryKey: ["bindings"] });
      // 使设备缓存失效（因为设备状态可能变化）
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
    ...listQueryConfig,
    staleTime: 30 * 1000, // 数据30秒过期（实时性要求高）
  });
}

// 无限滚动查询数据
export function useInfiniteData(query?: DataQuery) {
  return useInfiniteQuery({
    queryKey: queryKeys.data(query),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/v1/data?page=${pageParam}&page_size=50`);
      if (!res.ok) throw new Error('Failed to fetch data');
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < Math.ceil(lastPage.total / 50)) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    ...defaultQueryConfig,
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
    ...detailQueryConfig,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: queryKeys.role(id),
    queryFn: () => roleApi.get(id),
    ...detailQueryConfig,
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

export function useRoleModules(id: string) {
  return useQuery({
    queryKey: queryKeys.roleModules(id),
    queryFn: () => roleApi.getModules(id),
    ...detailQueryConfig,
    enabled: !!id,
  });
}

export function useBatchAssignModules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BatchAssignModulesRequest }) =>
      roleApi.batchAssignModules(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleModules(id) });
    },
  });
}

export function useSetRoleModules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetRoleModulesRequest }) =>
      roleApi.setModules(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleModules(id) });
    },
  });
}

// ==================== Module Hooks ====================

export function useModules() {
  return useQuery({
    queryKey: queryKeys.modules(),
    queryFn: () => moduleApi.list(),
    staleTime: 30 * 60 * 1000, // 模块数据30分钟过期（很少变化）
  });
}

// ==================== Audit Log Hooks ====================

export function useAuditLogs(query?: AuditLogQuery) {
  return useQuery({
    queryKey: queryKeys.auditLogs(query),
    queryFn: () => auditApi.list(query),
    ...listQueryConfig,
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: queryKeys.auditLog(id),
    queryFn: () => auditApi.get(id),
    ...detailQueryConfig,
    enabled: !!id,
  });
}

// ==================== Raw Data Hooks ====================

export function useRawData(query?: RawDataQuery) {
  return useQuery({
    queryKey: ["raw-data", query],
    queryFn: () => rawDataApi.query(query),
    ...listQueryConfig,
  });
}

export function useRawDataDetail(id: string | null) {
  return useQuery({
    queryKey: ["raw-data-detail", id],
    queryFn: () => rawDataApi.getDetail(id!),
    ...detailQueryConfig,
    enabled: !!id,
  });
}

// ==================== 预取工具函数 ====================

export function usePrefetchUser() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.user(id),
      queryFn: () => userApi.get(id),
      ...detailQueryConfig,
    });
  };
}

export function usePrefetchPatient() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.patientDetail(id),
      queryFn: () => patientApi.getDetail(id),
      ...detailQueryConfig,
    });
  };
}

export function usePrefetchDevice() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.device(id),
      queryFn: () => deviceApi.get(id),
      ...detailQueryConfig,
    });
  };
}