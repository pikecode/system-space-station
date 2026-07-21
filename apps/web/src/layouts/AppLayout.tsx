import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import { useAuthStore } from '../store/auth';

const menusByRole = {
  ADMIN: [
    { path: '/admin/departments', name: '部门管理' },
    { path: '/admin/users', name: '员工管理' },
    { path: '/admin/admins', name: '系统管理员' },
    { path: '/admin/customers', name: '客户总览' },
    { path: '/admin/commissions', name: '分成总览' },
    { path: '/admin/config', name: '系统配置' },
  ],
  HEAD: [
    { path: '/dept/customers', name: '部门客户' },
    { path: '/dept/approvals', name: '待审批' },
    { path: '/dept/commissions', name: '部门分成' },
  ],
  MEMBER: [
    { path: '/my/customers', name: '我的客户' },
    { path: '/my/memberships', name: '会员申请' },
    { path: '/my/commissions', name: '我的分成' },
  ],
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const role = user?.role ?? 'MEMBER';
  const menus = menusByRole[role as keyof typeof menusByRole] ?? menusByRole.MEMBER;

  return (
    <ProLayout
      title="客户资源管理"
      location={{ pathname: location.pathname }}
      menuDataRender={() => menus}
      menuItemRender={(item, dom) => (
        <div onClick={() => navigate(item.path ?? '/')}>{dom}</div>
      )}
      avatarProps={{
        src: user?.avatar,
        title: user?.name,
        render: (_props, dom) => (
          <div>
            {dom}
            <span
              style={{ marginLeft: 8, cursor: 'pointer', fontSize: 12, color: '#999' }}
              onClick={logout}
            >
              退出
            </span>
          </div>
        ),
      }}
    >
      <Outlet />
    </ProLayout>
  );
}
