import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Button, Result, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, type UserInfo } from '../store/auth';
import request from '../services/request';

const AppLayout = lazy(() => import('../layouts/AppLayout'));
const LoginPage = lazy(() => import('../pages/login/LoginPage'));
const DepartmentsPage = lazy(() => import('../pages/admin/departments/DepartmentsPage'));
const UsersPage = lazy(() => import('../pages/admin/users/UsersPage'));
const AdminsPage = lazy(() => import('../pages/admin/admins/AdminsPage'));
const AdminCustomersPage = lazy(() => import('../pages/admin/customers/AdminCustomersPage'));
const AdminCommissionsPage = lazy(() => import('../pages/admin/commissions/AdminCommissionsPage'));
const AdminInvestmentsPage = lazy(() => import('../pages/admin/investments/AdminInvestmentsPage'));
const ConfigPage = lazy(() => import('../pages/admin/config/ConfigPage'));
const CustomersPage = lazy(() => import('../pages/my/customers/CustomersPage'));
const MembershipsPage = lazy(() => import('../pages/my/memberships/MembershipsPage'));
const CommissionsPage = lazy(() => import('../pages/my/commissions/CommissionsPage'));
const ApprovalsPage = lazy(() => import('../pages/dept/approvals/ApprovalsPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const session = useQuery({
    queryKey: ['auth-session', token],
    queryFn: () => request.get<UserInfo, UserInfo>('/auth/me'),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (session.data) setUser(session.data);
  }, [session.data, setUser]);

  if (!token) return <Navigate to="/login" replace />;
  if (session.isPending || (session.data && user !== session.data)) {
    return (
      <div className="app-session-state">
        <Spin size="large" />
      </div>
    );
  }
  if (session.isError || !session.data) {
    return (
      <div className="app-session-state">
        <Result
          status="warning"
          title="暂时无法连接服务"
          subTitle="请检查网络连接后重试"
          extra={<Button type="primary" onClick={() => session.refetch()}>重新连接</Button>}
        />
      </div>
    );
  }
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'ADMIN') return <Navigate to="/my/customers" replace />;
  return <>{children}</>;
}

function RequireHead({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'HEAD') return <Navigate to="/my/customers" replace />;
  return <>{children}</>;
}

function RoleHomeRedirect() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === 'ADMIN') return <Navigate to="/admin/departments" replace />;
  if (role === 'HEAD') return <Navigate to="/dept/customers" replace />;
  return <Navigate to="/my/customers" replace />;
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
        <Suspense fallback={Fallback}>
          <AppLayout />
        </Suspense>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <RoleHomeRedirect /> },
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
        path: 'admin/admins',
        element: (
          <RequireAdmin>
            <Suspense fallback={Fallback}>
              <AdminsPage />
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
        path: 'admin/investments',
        element: (
          <RequireAdmin>
            <Suspense fallback={Fallback}>
              <AdminInvestmentsPage />
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
        path: 'dept/customers',
        element: (
          <RequireHead>
            <Suspense fallback={Fallback}>
              <CustomersPage />
            </Suspense>
          </RequireHead>
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
          <RequireHead>
            <Suspense fallback={Fallback}>
              <ApprovalsPage />
            </Suspense>
          </RequireHead>
        ),
      },
      {
        path: 'dept/commissions',
        element: (
          <RequireHead>
            <Suspense fallback={Fallback}>
              <CommissionsPage scope="department" />
            </Suspense>
          </RequireHead>
        ),
      },
    ],
  },
]);
