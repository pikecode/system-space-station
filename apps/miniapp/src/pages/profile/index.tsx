import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../services/auth';
import { useRequireLogin } from '../../hooks/useRequireLogin';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员',
  HEAD: '部门负责人',
  MEMBER: '部门成员',
};

export default function ProfilePage() {
  const { user, logout, setAuth } = useAuthStore();
  const token = useAuthStore((state) => state.token);
  const authorized = useRequireLogin();

  useEffect(() => {
    if (!token) return;
    authApi.me().then((me) => {
      if (me && token) setAuth(token, me as any);
    }).catch(() => {});
  }, []);

  const handleCopyCode = () => {
    if (!user?.shareCode) return;
    Taro.setClipboardData({ data: user.shareCode });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '退出后需要重新输入账号和密码，确认退出吗？',
      confirmColor: '#b83b3b',
      success: ({ confirm }) => {
        if (confirm) {
          logout();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  const navItems = [
    { title: '分成明细', desc: '查看收入、状态和结算日期', url: '/pages/commissions/list', visible: true },
    { title: '审批待办', desc: '处理入会与退款申请', url: '/pages/approvals/index', visible: user?.role === 'HEAD' || user?.role === 'ADMIN' },
  ].filter((item) => item.visible);

  if (!authorized) return <View className='loading'>跳转登录中...</View>;

  return (
    <View className='page profile-page'>

      <View className='identity-band'>
        <View className='avatar avatar--large'>{user?.name?.[0] ?? '?'}</View>
        <View className='identity-band__body'>
          <Text className='identity-band__eyebrow'>当前账号</Text>
          <Text className='identity-band__title'>{user?.name || '未命名用户'}</Text>
          <Text className='identity-band__meta'>
            {ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '角色未设置'}
          </Text>
        </View>
      </View>

      {user?.shareCode && (
        <>
          <View className='section-title'>客户邀请</View>
          <View className='surface surface--padded'>
            <View className='invite-code'>
              <View>
                <Text className='invite-code__label'>我的分享码</Text>
                <Text className='invite-code__value'>{user.shareCode}</Text>
              </View>
              <View className='invite-code__copy' onClick={handleCopyCode}>复制</View>
            </View>
          </View>
        </>
      )}

      <View className='section-title'>业务工具</View>
      <View className='entity-list'>
        {navItems.map((item) => (
          <View
            key={item.url}
            className='entity-row'
            onClick={() => Taro.navigateTo({ url: item.url })}
          >
            <View className='entity-row__body'>
              <Text className='entity-row__title'>{item.title}</Text>
              <Text className='profile-nav__desc'>{item.desc}</Text>
            </View>
            <Text className='entity-row__arrow'>›</Text>
          </View>
        ))}
      </View>

      <View className='logout-action' onClick={handleLogout}>退出登录</View>
    </View>
  );
}
