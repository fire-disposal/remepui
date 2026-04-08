/**
 * API 服务统一导出
 */

// API 客户端
export { apiClient } from "./client";

// 类型定义
export * from "./types";

// API 服务
export { authApi, getRefreshToken, setRefreshToken, clearRefreshToken } from "./auth";
export { userApi } from "./user";
export { patientApi } from "./patient";
export { deviceApi } from "./device";
export { bindingApi } from "./binding";
export { dataApi } from "./data";
export { roleApi, moduleApi, isAdmin, hasRoleName, hasRoleId } from "./role";
export { auditApi } from "./audit";
export { rawDataApi } from "./raw-data";

// React Query hooks
export * from "./hooks";