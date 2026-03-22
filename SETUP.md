# RemepUI - Project Setup Guide

## 🎯 Project Overview

RemepUI is a modern full-stack web application built with:
- **Frontend Framework**: React 19 + TypeScript + Vite
- **UI Library**: Mantine
- **State Management**: Zustand (Auth) + TanStack Query (Server State)
- **Routing**: TanStack Router with type-safe routes
- **API Layer**: Axios with JWT token injection
- **Logging**: Custom structured logging system
- **Data Visualization**: ECharts + React Three Fiber (3D)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── routes/              # TanStack Router route definitions
│   │   ├── __root.tsx       # Root route with app initialization
│   │   ├── index.tsx        # Protected home page (requires auth)
│   │   └── login.tsx        # Login page (public)
│   ├── layout/
│   │   └── AppLayout.tsx    # Main app layout with navigation
│   ├── providers.tsx        # Global providers (Query, Mantine, etc.)
│   └── router.ts            # Router configuration
│
├── modules/                 # Business-specific modules
│   ├── auth/
│   │   └── pages/
│   │       └── LoginPage.tsx
│   ├── dashboard/
│   │   └── pages/
│   │       └── DashboardPage.tsx
│   ├── device/              # (Future) Device management module
│   └── patient/             # (Future) Patient management module
│
├── shared/
│   ├── api/
│   │   ├── client.ts        # Axios instance with interceptors
│   │   ├── auth.ts          # Auth API service
│   │   └── query-client.ts  # TanStack Query configuration
│   ├── logger/
│   │   └── index.ts         # Structured logging utility
│   ├── store/
│   │   └── auth.ts          # Zustand auth store (JWT + user state)
│   ├── ui/
│   │   └── toast.ts         # Mantine notifications utility
│   ├── hooks/
│   │   └── useAuth.ts       # Auth operations hook
│   └── (future) components/ # Shared UI components
│
├── widgets/                 # Reusable complex components
│   ├── (future) DataTable.tsx
│   ├── (future) Chart.tsx
│   └── (future) Canvas3D.tsx
│
├── main.tsx                 # App entry point
├── index.css                # Global styles
└── App.tsx                  # (To be removed/refactored)
```

---

## 🔐 Authentication System

### How It Works

1. **User Logs In** → LoginPage.tsx captures credentials
2. **API Call** → authApi.login() sends request to backend
3. **Token Stored** → JWT stored in localStorage + Zustand store
4. **Auto Injection** → Axios interceptor auto-injects token in requests
5. **Route Guards** → Protected routes check token before rendering
6. **Auto Logout** → 401 response triggers logout + redirect to login

### Key Files

- **Store**: `shared/store/auth.ts` (Zustand)
  - Manages user state and token
  - Persists to localStorage
  - Hydrates on app startup

- **API**: `shared/api/auth.ts`
  - login(), register(), logout()
  - getCurrentUser(), refreshToken()

- **Hook**: `shared/hooks/useAuth.ts`
  - Provides login/logout functions
  - Handles loading/error states
  - Auto-navigates on success/failure

---

## 🌐 API Layer Design

### Axios Client (`shared/api/client.ts`)

```typescript
// Features:
1. Single axios instance
2. Request interceptor:
   - Injects JWT token from store
   - Logs API calls
3. Response interceptor:
   - Unwraps response.data
   - Logs responses
   - Handles 401 (auto-logout)
4. Error handling:
   - Logs errors with context
   - Triggers toast notifications
```

### Creating API Services

```typescript
// Example: shared/api/device.ts
import { apiClient } from './client';

export const deviceApi = {
  // GET /devices
  list: () => apiClient.get('/devices'),
  
  // GET /devices/:id
  get: (id: string) => apiClient.get(`/devices/${id}`),
  
  // POST /devices
  create: (data: DeviceData) => apiClient.post('/devices', data),
  
  // PUT /devices/:id
  update: (id: string, data: DeviceData) => 
    apiClient.put(`/devices/${id}`, data),
  
  // DELETE /devices/:id
  delete: (id: string) => apiClient.delete(`/devices/${id}`),
};
```

---

## 📊 TanStack Query Integration

### Basic Usage Pattern

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceApi } from '@/shared/api/device';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['devices'],
  queryFn: () => deviceApi.list(),
});

// Create/Update/Delete
const queryClient = useQueryClient();
const { mutate: createDevice } = useMutation({
  mutationFn: (data: DeviceData) => deviceApi.create(data),
  onSuccess: () => {
    // Refetch data after successful mutation
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  },
});
```

### Query Key Conventions

```typescript
// Collections
['devices']
['patients']

// Single items
['devices', id]
['patients', id]

// Filtered/Paginated
['devices', { page: 1, limit: 10 }]
['patients', { search: 'john' }]

// Related data
['devices', id, 'logs']
['patients', id, 'records']
```

---

## 🛣️ Routing Architecture

### Route Guard Pattern

Protected routes check authentication before rendering:

```typescript
export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error('Not authenticated');
    }
  },
  component: DashboardComponent,
});
```

### Creating New Routes

1. **Create route file** in `app/routes/`
   ```typescript
   // app/routes/devices.tsx
   export const Route = createFileRoute('/devices')({
     component: DevicesPage,
   });
   ```

2. **Add to router** in `app/router.ts`
   ```typescript
   const routeTree = RootComponent.addChildren([
     IndexComponent,
     LoginComponent,
     DevicesComponent, // Add here
   ]);
   ```

3. **Create page component** in `modules/*/pages/`
   ```typescript
   export const DevicesPage = () => {
     // Use hooks, queries, state management
     return <div>Devices</div>;
   };
   ```

---

## 🎨 UI & Themes

### Mantine Providers

All Mantine components are available globally:

```typescript
import { Button, Card, Grid, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
```

### Toast Notifications

```typescript
import { toast } from '@/shared/ui/toast';

// Success
toast.success('Item created successfully');

// Error
toast.error('Failed to delete item');

// Info/Warning
toast.info('Processing your request...');
toast.warning('This action cannot be undone');
```

### Theme Customization

Edit `app/providers.tsx` to configure Mantine theme:

```typescript
<MantineProvider
  theme={{
    primaryColor: 'blue',
    colors: { /* ... */ },
  }}
>
```

---

## 📝 Logging System

### Usage

```typescript
import { logger } from '@/shared/logger';

logger.debug('Debug message', { data: 'value' });
logger.info('User logged in', { username: 'john' });
logger.warn('Deprecated API used');
logger.error('Request failed', error);
```

### Integration Points

- API requests/responses
- User actions (login/logout)
- Error boundaries
- Important business logic

### Production

In production, logs can be sent to remote service (e.g., Sentry):

```typescript
// shared/logger/index.ts
if (!this.isDev && level === 'error') {
  sendToRemoteLogger(context);
}
```

---

## 🚀 Getting Started

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit with your API base URL
# VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:5173

### 4. Build for Production

```bash
pnpm build
```

---

## 🔄 Development Workflow

### Adding a New Feature

1. **Create API Service**
   ```typescript
   // shared/api/devices.ts
   ```

2. **Create Page Component**
   ```typescript
   // modules/device/pages/DevicesPage.tsx
   ```

3. **Create Route**
   ```typescript
   // app/routes/devices.tsx
   ```

4. **Add Navigation Link**
   ```typescript
   // app/layout/AppLayout.tsx
   ```

5. **Test with Mock Data**
   - Use TanStack Query with mock functions
   - Or use mock API interceptors

### Common Patterns

**Fetch with Loading/Error:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['devices'],
  queryFn: deviceApi.list,
});

if (isLoading) return <Loader />;
if (error) return <Error message={error.message} />;
return <DeviceTable data={data} />;
```

**Form Submission:**
```typescript
const { mutate } = useMutation({
  mutationFn: deviceApi.create,
  onSuccess: () => {
    toast.success('Device created');
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

---

## 🧪 Testing

### Unit Tests (Future)
- Use Vitest for unit tests
- Test utilities, hooks, components

### E2E Tests (Future)
- Use Playwright for end-to-end tests
- Test full user workflows

---

## 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2 | UI framework |
| @tanstack/react-router | 1.168 | Routing with type safety |
| @tanstack/react-query | 5.94 | Server state management |
| zustand | 5.0 | Client state management |
| @mantine/core | 8.3 | UI component library |
| axios | 1.13 | HTTP client |
| echarts | 6.0 | Data visualization |
| three | 0.183 | 3D rendering |

---

## 🐛 Troubleshooting

### App won't compile
- Check TypeScript errors: `npm run build`
- Verify all imports use correct paths

### Login not working
- Check VITE_API_BASE_URL in .env
- Verify backend is running and accessible
- Check browser console for errors

### Routes not found
- Ensure route files are in `app/routes/`
- Check file naming (matches createFileRoute path)
- Verify router.ts includes the route

### API calls failing
- Check Authorization header is being sent
- Verify token is in localStorage
- Check response in Network tab
- Look at logger output for details

---

## 🎓 Learning Resources

### TanStack Router
- https://tanstack.com/router/latest

### TanStack Query
- https://tanstack.com/query/latest

### Mantine
- https://mantine.dev/

### Zustand
- https://github.com/pmndrs/zustand

---

## 📝 Next Steps

1. **Connect Real Backend**
   - Update API_BASE_URL
   - Implement auth API with real JWT validation
   - Test with actual backend server

2. **Create Business Modules**
   - Device management
   - Patient records
   - Data visualization

3. **Build Data Tables**
   - Use TanStack Table + Mantine Table
   - Implement pagination/sorting/filtering
   - Add CRUD operations

4. **Add Charts & Visualization**
   - Integrate ECharts
   - Create reusable chart components
   - Add 3D visualization with Three.js

5. **Deploy**
   - Build production bundle
   - Deploy to hosting (Vercel, Netlify, etc.)
   - Set up CI/CD pipeline

---

## 📞 Support

For questions or issues:
1. Check project documentation
2. Review code comments
3. Check browser console
4. Review network requests
