import { Link, Outlet, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown } from 'antd';
import {
  ApartmentOutlined,
  ContactsOutlined,
  DollarOutlined,
  FundProjectionScreenOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth';
import { useIsMobile } from '../hooks/useIsMobile';

const menusByRole = {
  ADMIN: [
    {
      path: '/admin/business',
      name: '业务管理',
      icon: <ContactsOutlined />,
      children: [
        { path: '/admin/customers', name: '客户管理', icon: <ContactsOutlined /> },
        { path: '/admin/investments', name: '投资管理', icon: <FundProjectionScreenOutlined /> },
        { path: '/admin/commissions', name: '佣金结算', icon: <DollarOutlined /> },
      ],
    },
    {
      path: '/admin/organization',
      name: '组织管理',
      icon: <ApartmentOutlined />,
      children: [
        { path: '/admin/departments', name: '组织架构', icon: <ApartmentOutlined /> },
        { path: '/admin/users', name: '人员管理', icon: <TeamOutlined /> },
      ],
    },
    {
      path: '/admin/system',
      name: '系统管理',
      icon: <SettingOutlined />,
      children: [
        { path: '/admin/admins', name: '管理员账号', icon: <SafetyCertificateOutlined /> },
        { path: '/admin/config', name: '基础配置', icon: <SettingOutlined /> },
      ],
    },
  ],
  HEAD: [
    { path: '/dept/customers', name: '客户管理', icon: <ContactsOutlined /> },
    { path: '/dept/commissions', name: '部门佣金', icon: <DollarOutlined /> },
  ],
  MEMBER: [
    { path: '/my/customers', name: '客户管理', icon: <ContactsOutlined /> },
    { path: '/my/commissions', name: '我的佣金', icon: <DollarOutlined /> },
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
