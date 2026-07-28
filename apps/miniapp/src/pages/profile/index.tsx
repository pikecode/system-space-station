import { useEffect } from 'react';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../services/auth';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员', HEAD: '部门负责人', MEMBER: '部门成员',
};

export default function ProfilePage() {
  const { user, logout, setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    authApi.me().then((me) => {
      if (me && token) setAuth(token, me as any);
    }).catch(() => {});
  }, []);

  useShareAppMessage(() => ({
    title: `${user?.name ?? ''} 邀请您登记信息`,
    path: `/pages/register/index?shareCode=${user?.shareCode ?? ''}`,
  }));

  const handleCopyCode = () => {
    if (!user?.shareCode) return;
    Taro.setClipboardData({ data: user.shareCode });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确认退出？',
      success: ({ confirm }) => {
        if (confirm) {
          logout();
          Taro.reLaunch({ url: '/pages/login/index' });
        }
      },
    });
  };

  return (
    <View className='page' style={{ paddingBottom: '64rpx' }}>
      {/* Hero Banner */}
      <View style={{
        background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)',
        borderRadius: '0 0 40rpx 40rpx',
        padding: '48rpx 32rpx 56rpx',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20rpx',
      }}>
        <View style={{
          width: '120rpx', height: '120rpx', borderRadius: '999rpx',
          background: 'rgba(255,255,255,0.2)',
          border: '4rpx solid rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: 'var(--color-text-inv)', fontSize: '48rpx', fontWeight: '800' }}>
            {user?.name?.[0] ?? '?'}
          </Text>
        </View>
        <View style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '40rpx', fontWeight: '800', color: 'var(--color-text-inv)', display: 'block' }}>{user?.name}</Text>
          <Text style={{ fontSize: '26rpx', color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '8rpx' }}>
            {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
          </Text>
        </View>
      </View>

      {/* 分享邀请 */}
      {user?.shareCode && (
        <View style={{ margin: 'var(--space-md) var(--space-md) 0', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', boxShadow: 'var(--shadow-card)' }}>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
            <Text style={{ fontSize: '26rpx', color: 'var(--color-text-2)', flex: 1 }}>我的分享码</Text>
            <Text style={{ fontFamily: '"Courier New", "SF Mono", monospace', fontSize: '40rpx', fontWeight: '700', color: 'var(--color-brand)', letterSpacing: '0.15em', marginRight: '16rpx' }}>
              {user.shareCode}
            </Text>
            <Text
              style={{ fontSize: '24rpx', color: 'var(--color-brand)', border: '2rpx solid var(--color-brand)', padding: '8rpx 20rpx', borderRadius: 'var(--radius-pill)' }}
              onClick={handleCopyCode}
            >
              复制
            </Text>
          </View>
          <Button
            style={{ background: 'linear-gradient(135deg, #0a4f5e 0%, #007d7d 100%)', color: 'var(--color-text-inv)', borderRadius: 'var(--radius-md)', fontSize: '30rpx', fontWeight: '600', height: '88rpx' }}
            openType='share'
          >
            分享给客户
          </Button>
        </View>
      )}

      {/* 退出登录 */}
      <View style={{ padding: 'var(--space-xl) var(--space-md) 0', textAlign: 'center' }}>
        <Text
          style={{ fontSize: '28rpx', color: 'var(--color-text-3)' }}
          onClick={handleLogout}
        >
          退出登录
        </Text>
      </View>
    </View>
  );
}
