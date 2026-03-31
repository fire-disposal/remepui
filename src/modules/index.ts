/**
 * 模块统一导出
 */

// 认证模块
export { LoginPage } from "./auth/pages/LoginPage";

// 仪表板模块
export { DashboardPage } from "./dashboard/pages/DashboardPage";

// 患者管理模块
export { PatientListPage } from "./patients/pages/PatientListPage";

// 设备管理模块
export { DeviceListPage } from "./devices/pages/DeviceListPage";

// 绑定关系模块
export { BindingListPage } from "./bindings/pages/BindingListPage";

// 数据查询模块
export { DataPage } from "./data/pages/DataPage";

// 用户管理模块
export { UserListPage } from "./users/pages/UserListPage";

// 预警中心模块
export { AlertCenterPage } from "./alerts/pages/AlertCenterPage";

// 运营报表模块
export { OperationsReportPage } from "./reports/pages/OperationsReportPage";

// 压力性损伤仿真教学模块
export { PressureUlcerPage } from "./pressure-ulcer";
