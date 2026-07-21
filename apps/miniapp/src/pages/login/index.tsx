import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import { authApi } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import './index.css';

type LoginMode = 'password' | 'wechat-bind';

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState<LoginMode>('password');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async () => {
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

  const handleWechatLogin = async () => {
    setLoading(true);
    try {
      const res = await authApi.wechatLogin();
      setAuth(res.token, res.user);
      Taro.switchTab({ url: '/pages/customers/index' });
    } catch (e: any) {
      if (e.status === 404) {
        setMode('wechat-bind');
        Taro.showToast({ title: '请绑定账号', icon: 'none' });
      } else {
        Taro.showToast({ title: e.message || '微信登录失败', icon: 'none' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWechatBind = async () => {
    if (!account.trim() || !password.trim()) {
      Taro.showToast({ title: '请填写账号和密码', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.bindWechat(account.trim(), password);
      setAuth(res.token, res.user);
      Taro.switchTab({ url: '/pages/customers/index' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '绑定失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='login-page'>
      <View className='login-header'>
        <Text className='login-title'>客户资源管理</Text>
        <Text className='login-subtitle'>
          {mode === 'wechat-bind' ? '首次微信登录，请绑定账号' : '欢迎登录'}
        </Text>
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

        {mode === 'password' ? (
          <>
            <Button
              className='btn btn--primary login-btn'
              loading={loading}
              onClick={handlePasswordLogin}
            >
              登录
            </Button>
            <Button
              className='btn btn--outline login-btn'
              loading={loading}
              onClick={handleWechatLogin}
            >
              微信一键登录
            </Button>
          </>
        ) : (
          <Button
            className='btn btn--primary login-btn'
            loading={loading}
            onClick={handleWechatBind}
          >
            绑定并登录
          </Button>
        )}
      </View>
    </View>
  );
}
