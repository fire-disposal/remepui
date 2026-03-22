# 🚀 RemepUI Quick Start Guide

## 5分钟快速上手

### 1️⃣ 初始化项目

```bash
# 安装依赖
pnpm install

# 复制环境配置
cp .env.example .env

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:5173`

---

## 2️⃣ 项目已内置的功能

### ✅ 认证系统
- JWT Token 支持
- 自动登出（401 处理）
- 本地存储持久化
- 路由保护（自动重定向到登录页）

### ✅ 请求层
- Axios 实例化
- 自动 Token 注入
- 请求/响应拦截器
- 错误日志记录

### ✅ 状态管理
- Zustand 认证存储
- TanStack Query 服务端状态
- localStorage 持久化

### ✅ 路由系统
- TanStack Router（类型安全）
- 路由守卫（beforeLoad）
- 自动重定向
- 404 页面

### ✅ UI & 通知
- Mantine 组件库
- Toast 通知系统
- 全局 Layout（导航栏 + 侧边栏）

### ✅ 日志系统
- 结构化日志
- 彩色开发输出
- JSON 生产输出

---

## 3️⃣ 目录速查

| 路径 | 用途 |
|------|------|
| `src/app/routes/` | 路由定义 |
| `src/app/layout/` | 全局布局 |
| `src/modules/` | 业务模块（device/patient等） |
| `src/shared/api/` | API 服务 + Axios 配置 |
| `src/shared/store/` | Zustand 状态管理 |
| `src/shared/hooks/` | 自定义 Hooks |
| `src/shared/logger/` | 日志工具 |
| `src/shared/ui/` | UI 工具（Toast） |
| `src/widgets/` | 可复用组件 |

---

## 4️⃣ 常见任务速查

### 创建新的 API 服务

**文件**: `src/shared/api/device.ts`

```typescript
import { apiClient } from './client';

export const deviceApi = {
  list: () => apiClient.get('/device/list'),
  get: (id: string) => apiClient.get(`/device/${id}`),
  create: (data) => apiClient.post('/device', data),
  update: (id: string, data) => apiClient.put(`/device/${id}`, data),
  delete: (id: string) => apiClient.delete(`/device/${id}`),
};
```

### 在组件中使用 API

```typescript
import { useQuery } from '@tanstack/react-query';
import { deviceApi } from '@/shared/api/device';

export const DeviceList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceApi.list(),
  });

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && data.map(item => <div key={item.id}>{item.name}</div>)}
    </>
  );
};
```

### 创建新路由

**文件**: `src/app/routes/devices.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '../../shared/store/auth';
import { DevicesPage } from '../../modules/device/pages/DevicesPage';

export const Route = createFileRoute('/devices')({
  // 路由守卫：检查认证
  beforeLoad: async () => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Unauthorized');
  },
  component: DevicesPage,
});
```

然后在 `src/app/router.ts` 添加：

```typescript
const routeTree = RootComponent.addChildren([
  IndexComponent,
  LoginComponent,
  DevicesComponent, // 新增
]);
```

### 使用通知

```typescript
import { toast } from '@/shared/ui/toast';

// 成功
toast.success('Operation successful');

// 错误
toast.error('Something went wrong');

// 信息
toast.info('Please note this');

// 警告
toast.warning('Be careful');
```

### 使用日志

```typescript
import { logger } from '@/shared/logger';

logger.debug('Debug message', { data: 'value' });
logger.info('User login', { username: 'john' });
logger.warn('Warning message');
logger.error('Error occurred', error);
```

### 获取当前用户信息

```typescript
import { useAuthStore } from '@/shared/store/auth';

export const Profile = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return (
    <div>
      <p>Hello, {user?.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 调用登录

```typescript
import { useAuth } from '@/shared/hooks/useAuth';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();

  const handleSubmit = async (username: string, password: string) => {
    try {
      await login(username, password);
      // 自动重定向到首页
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <form onSubmit={() => handleSubmit('user', 'pass')}>
      {/* 表单代码 */}
    </form>
  );
};
```

### 创建 Mutation（创建/更新/删除）

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceApi } from '@/shared/api/device';
import { toast } from '@/shared/ui/toast';

export const CreateDeviceForm = () => {
  const queryClient = useQueryClient();
  
  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => deviceApi.create(data),
    onSuccess: () => {
      toast.success('Device created');
      // 重新获取列表数据
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <button onClick={() => mutate({ name: 'Device 1' })} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create'}
    </button>
  );
};
```

---

## 5️⃣ 环境配置

编辑 `.env` 文件：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 6️⃣ 后端 API 规范

### 登录接口

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

响应 (200 OK):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user-1",
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["admin"]
  }
}
```

### 其他接口

所有 API 请求会自动携带：

```
Authorization: Bearer eyJhbGc...
```

---

## 7️⃣ 故障排除

| 问题 | 解决方案 |
|------|---------|
| 编译失败 | 运行 `pnpm build` 检查类型错误 |
| 路由 404 | 检查 `src/app/router.ts` 是否添加了路由 |
| 登录失败 | 检查 `.env` 中的 `VITE_API_BASE_URL` |
| API 无响应 | 检查后端是否运行，token 是否有效 |
| 样式不生效 | 确保导入了 Mantine 样式：`@mantine/core/styles.css` |

---

## 8️⃣ 生产构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

---

## 9️⃣ 文件清单

核心文件说明：

| 文件 | 说明 |
|------|------|
| `src/app/router.ts` | 路由树配置 |
| `src/app/providers.tsx` | 全局 Providers |
| `src/app/routes/__root.tsx` | 根路由 + 初始化 |
| `src/shared/api/client.ts` | Axios 实例 + 拦截器 |
| `src/shared/store/auth.ts` | 认证状态管理 |
| `src/shared/hooks/useAuth.ts` | 认证操作 Hook |
| `src/shared/logger/index.ts` | 日志工具 |
| `src/shared/ui/toast.ts` | 通知工具 |
| `.env.example` | 环境变量模板 |
| `SETUP.md` | 详细文档 |

---

## 🔟 核心流程图

### 认证流程

```
登录页面
  ↓
输入用户名/密码
  ↓
useAuth() hook → authApi.login()
  ↓
Axios 请求 POST /api/auth/login
  ↓
后端返回 token + user
  ↓
Zustand store 保存 token + user
  ↓
localStorage 持久化
  ↓
自动重定向到首页
```

### 路由保护流程

```
访问受保护路由
  ↓
beforeLoad 检查 token
  ↓
有 token → 允许进入页面
无 token → 抛错 → 重定向到 login
```

### API 请求流程

```
组件调用 apiClient.get('/devices')
  ↓
请求拦截器 → 注入 Authorization header
  ↓
发送 HTTP 请求
  ↓
响应拦截器 → 解析响应
  ↓
成功 → 返回 data
失败 → 401 → 自动登出 + 重定向

  其他错误 → 记录日志 + 显示 toast
```

---

## 更新说明

### 如何连接真实后端

1. **设置 API 基础 URL**
   ```env
   VITE_API_BASE_URL=https://your-api.com/api
   ```

2. **实现认证接口**
   - 后端需要提供 `POST /auth/login`
   - 返回 JWT token + user 信息

3. **创建 API 服务**
   ```typescript
   // src/shared/api/yourapi.ts
   export const yourApi = { ... };
   ```

4. **在组件中使用**
   ```typescript
   const { data } = useQuery({
     queryKey: ['data'],
     queryFn: () => yourApi.getData(),
   });
   ```

---

## 📚 推荐阅读

- `SETUP.md` - 详细项目文档
- `src/shared/api/client.ts` - API 拦截器实现
- `src/shared/store/auth.ts` - 认证状态实现
- `src/app/router.ts` - 路由配置

---

## 🎉 你已准备好开始开发！

开始构建你的第一个功能：

1. 创建 API 服务文件
2. 创建页面组件
3. 创建路由
4. 在导航中添加链接
5. 测试功能

祝你编码愉快！🚀