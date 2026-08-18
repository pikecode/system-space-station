import { Link, Outlet, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown } from 'antd';
import {
  ApartmentOutlined,
  AuditOutlined,
  ContactsOutlined,
  DollarOutlined,
  FundProjectionScreenOutlined,
  IdcardOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth';
import { useIsMobile } from '../hooks/useIsMobile';

const menusByRole = {
  ADMIN: [
    { path: '/admin/departments', name: '部门管理', icon: <ApartmentOutlined /> },
    { path: '/admin/users', name: '员工管理', icon: <TeamOutlined /> },
    { path: '/admin/admins', name: '系统管理员', icon: <SafetyCertificateOutlined /> },
    { path: '/admin/customers', name: '客户总览', icon: <ContactsOutlined /> },
    { path: '/admin/commissions', name: '分成总览', icon: <DollarOutlined /> },
    { path: '/admin/investments', name: '投资收益', icon: <FundProjectionScreenOutlined /> },
    { path: '/admin/config', name: '系统配置', icon: <SettingOutlined /> },
  ],
  HEAD: [
    { path: '/dept/customers', name: '部门客户', icon: <ContactsOutlined /> },
    { path: '/dept/approvals', name: '待审批', icon: <AuditOutlined /> },
    { path: '/dept/commissions', name: '部门分成', icon: <DollarOutlined /> },
  ],
  MEMBER: [
    { path: '/my/customers', name: '我的客户', icon: <ContactsOutlined /> },
    { path: '/my/memberships', name: '会员申请', icon: <IdcardOutlined /> },
    { path: '/my/commissions', name: '我的分成', icon: <DollarOutlined /> },
  ],
};

export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const role = user?.role ?? 'MEMBER';
  const menus = menusByRole[role as keyof typeof menusByRole] ?? menusByRole.MEMBER;

  const isMobile = useIsMobile();

  return (
    <ProLayout
      title="客户资源管理"
      location={{ pathname: location.pathname }}
      menuDataRender={() => menus}
      menuItemRender={(item, dom) => (
        <Link to={item.path ?? '/'}>{dom}</Link>
      )}
      avatarProps={{
        src: user?.avatar,
        title: user?.name,
        render: (_props, dom) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: logout,
                },
              ],
            }}
          >
            <div style={{ cursor: 'pointer' }}>{dom}</div>
          </Dropdown>
        ),
      }}
      layout={isMobile ? 'mix' : 'side'}
      fixSiderbar
      fixedHeader
      contentStyle={{
        padding: isMobile ? 'var(--space-sm)' : 'var(--space-md)',
      }}
    >
      <Outlet />
    </ProLayout>
  );
}
