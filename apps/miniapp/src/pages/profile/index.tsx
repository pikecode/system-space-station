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

  // 每次进入页面刷新用户信息（确保 shareCode 等字段最新）
  useEffect(() => {
    if (!token) return;
    authApi.me().then((me) => {
      if (me && token) setAuth(token, me as any);
    }).catch(() => {});
  }, []);

  // 配置分享卡片，携带分享码
  useShareAppMessage(() => ({
    title: `${user?.name ?? ''} 邀请您登记信息`,
    path: `/pages/register/index?shareCode=${user?.shareCode ?? ''}`,
  }));

  const handleCopyCode = () => {
    if (!user?.shareCode) return;
    Taro.setClipboardData({ data: user.shareCode });
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: false });
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
    <View className='page'>
      {/* 用户信息 */}
      <View className='card' style={{ margin: '24rpx', display: 'flex', alignItems: 'center', gap: '24rpx' }}>
        <View style={{ width: '100rpx', height: '100rpx', borderRadius: '50rpx', background: '#00a3a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: '40rpx', fontWeight: '700' }}>
            {user?.name?.[0] ?? '?'}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: '34rpx', fontWeight: '700', display: 'block' }}>{user?.name}</Text>
          <Text style={{ fontSize: '26rpx', color: '#888', display: 'block', marginTop: '8rpx' }}>
            {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
          </Text>
        </View>
      </View>

      {/* 分享邀请（仅有分享码的用户显示） */}
      {user?.shareCode && (
        <>
          <View className='section-title'>邀请客户</View>
          <View style={{ background: '#fff', borderRadius: '16rpx', margin: '0 24rpx', padding: '28rpx 32rpx' }}>
            <View style={{ display: 'flex', alignItems: 'center', marginBottom: '24rpx' }}>
              <Text style={{ fontSize: '28rpx', color: '#666', flex: 1 }}>我的分享码</Text>
              <Text style={{ fontSize: '32rpx', fontWeight: '700', color: '#00a3a3', letterSpacing: '4rpx', marginRight: '16rpx' }}>
                {user.shareCode}
              </Text>
              <Text
                style={{ fontSize: '24rpx', color: '#00a3a3', border: '1rpx solid #00a3a3', padding: '4rpx 16rpx', borderRadius: '8rpx' }}
                onClick={handleCopyCode}
              >
                复制
              </Text>
            </View>
            <Button
              style={{ background: '#00a3a3', color: '#fff', borderRadius: '12rpx', fontSize: '30rpx' }}
              openType='share'
            >
              分享给客户
            </Button>
          </View>
        </>
      )}

      {/* 功能 */}
      <View className='section-title'>功能</View>
      <View style={{ background: '#fff', borderRadius: '16rpx', margin: '0 24rpx' }}>
        <View
          className='row'
          style={{ padding: '28rpx 32rpx', cursor: 'pointer' }}
          onClick={() => Taro.navigateTo({ url: '/pages/commissions/list' })}
        >
          <Text style={{ fontSize: '30rpx', flex: 1 }}>我的分成</Text>
          <Text style={{ color: '#bbb', fontSize: '24rpx' }}>›</Text>
        </View>
      </View>

      <View style={{ padding: '48rpx 24rpx 0' }}>
        <Button
          style={{ background: '#fff', color: '#f5222d', border: '2rpx solid #f5222d', borderRadius: '12rpx' }}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </View>
    </View>
  );
}
