import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuthStore } from '../store/auth';

const LoginPage = lazy(() => import('../pages/login/LoginPage'));
const DepartmentsPage = lazy(() => import('../pages/admin/departments/DepartmentsPage'));
const UsersPage = lazy(() => import('../pages/admin/users/UsersPage'));
const AdminCustomersPage = lazy(() => import('../pages/admin/customers/AdminCustomersPage'));
const AdminCommissionsPage = lazy(() => import('../pages/admin/commissions/AdminCommissionsPage'));
const ConfigPage = lazy(() => import('../pages/admin/config/ConfigPage'));
const CustomersPage = lazy(() => import('../pages/my/customers/CustomersPage'));
const MembershipsPage = lazy(() => import('../pages/my/memberships/MembershipsPage'));
const CommissionsPage = lazy(() => import('../pages/my/commissions/CommissionsPage'));
const ApprovalsPage = lazy(() => import('../pages/dept/approvals/ApprovalsPage'));

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
        path: 'admin/customers',
        element: (
          <RequireAdmin>
            <Suspense fallback={Fallback}>
              <AdminCustomersPage />
            </Suspense>
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/commissions',
        element: (
          <RequireAdmin>
            <Suspense fallback={Fallback}>
              <AdminCommissionsPage />
            </Suspense>
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/config',
        element: (
          <RequireAdmin>
            <Suspense fallback={Fallback}>
              <ConfigPage />
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
      {
        path: 'my/memberships',
        element: (
          <Suspense fallback={Fallback}>
            <MembershipsPage />
          </Suspense>
        ),
      },
      {
        path: 'my/commissions',
        element: (
          <Suspense fallback={Fallback}>
            <CommissionsPage />
          </Suspense>
        ),
      },
      {
        path: 'dept/approvals',
        element: (
          <Suspense fallback={Fallback}>
            <ApprovalsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
