import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import { useAuthStore } from '../../store/auth';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '系统管理员', HEAD: '部门负责人', MEMBER: '部门成员',
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

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
