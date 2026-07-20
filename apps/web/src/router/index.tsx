import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuthStore } from '../store/auth';

const LoginPage = lazy(() => import('../pages/login/LoginPage'));
const DepartmentsPage = lazy(() => import('../pages/admin/departments/DepartmentsPage'));
const UsersPage = lazy(() => import('../pages/admin/users/UsersPage'));
const CustomersPage = lazy(() => import('../pages/my/customers/CustomersPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'ADMIN') return <Navigate to="/my/customers" replace />;
  return <>{children}</>;
}

const Fallback = <div style={{ padding: 24 }}>加载中…</div>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: <div>Dashboard（待实现）</div>,
      },
      {
        path: 'admin/departments',
        element: (
          <RequireAdmin>
            <Suspense fallback={Fallback}>
              <DepartmentsPage />
            </Suspense>
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RequireAdmin>
            <Suspense fallback={Fallback}>
              <UsersPage />
            </Suspense>
          </RequireAdmin>
        ),
      },
      {
        path: 'my/customers',
        element: (
          <Suspense fallback={Fallback}>
            <CustomersPage />
          </Suspense>
        ),
      },
    ],
  },
]);
