import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import { authApi } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import './index.css';

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      Taro.switchTab({ url: '/pages/customers/index' });
    }
  }, []);

  const handleLogin = async () => {
    if (!account.trim() || !password.trim()) {
      Taro.showToast({ title: '请填写账号和密码', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ account: account.trim(), password });
      setAuth(res.token, res.user);
      Taro.switchTab({ url: '/pages/customers/index' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '登录失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='login-page'>
      <View className='login-header'>
        <Text className='login-title'>客户资源管理</Text>
        <Text className='login-subtitle'>欢迎登录</Text>
      </View>

      <View className='login-form'>
        <View className='field'>
          <Input
            className='field__input'
            placeholder='用户名或手机号'
            value={account}
            onInput={(e) => setAccount(e.detail.value)}
          />
        </View>
        <View className='field'>
          <Input
            className='field__input'
            placeholder='密码'
            password
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>
        <Button
          className='btn btn--primary login-btn'
          loading={loading}
          onClick={handleLogin}
        >
          登录
        </Button>
      </View>
    </View>
  );
}
