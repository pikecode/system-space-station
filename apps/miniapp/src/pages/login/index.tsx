import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import { authApi } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import './index.css';

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [employeeNo, setEmployeeNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isLoggedIn()) {
      Taro.switchTab({ url: '/pages/customers/index' });
    }
  }, []);

  const normalizeEmployeeNo = (value: string) => value.trim().toUpperCase();

  const handleLogin = async () => {
    if (loading) return;
    setErrorMessage('');
    const normalizedEmployeeNo = normalizeEmployeeNo(employeeNo);
    if (!normalizedEmployeeNo || !password.trim()) {
      setErrorMessage('请填写编号和密码');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ employeeNo: normalizedEmployeeNo, password });
      setAuth(res.token, res.user);
      Taro.switchTab({ url: '/pages/customers/index' });
    } catch (e: any) {
      setErrorMessage(e?.message || e?.errMsg || '登录失败，请稍后重试');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='login-page'>
      <View className='login-brand'>
        <View className='login-brand__mark'>CRM</View>
        <View>
          <Text className='login-brand__name'>客户资源管理</Text>
          <Text className='login-brand__meta'>业务工作台</Text>
        </View>
      </View>

      <View className='login-header'>
        <Text className='login-title'>登录工作台</Text>
        <Text className='login-subtitle'>查看客户、待办与业务进展</Text>
      </View>

      <View className='login-form'>
        <View className='login-field'>
          <Text className='login-field__label'>编号</Text>
          <View className='login-field__control'>
            <Input
              className='login-field__input'
              placeholder='请输入员工编号'
              confirmType='next'
              value={employeeNo}
              onInput={(e) => { setEmployeeNo(e.detail.value.toUpperCase().replace(/\s/g, '')); setErrorMessage(''); }}
            />
          </View>
        </View>
        <View className='login-field'>
          <Text className='login-field__label'>密码</Text>
          <View className='login-field__control'>
            <Input
              className='login-field__input'
              placeholder='请输入密码'
              password
              confirmType='done'
              value={password}
              onInput={(e) => { setPassword(e.detail.value); setErrorMessage(''); }}
              onConfirm={handleLogin}
            />
          </View>
        </View>
        {errorMessage && <View className='login-error'>{errorMessage}</View>}
        <Button
          className='btn btn--primary login-btn'
          loading={loading}
          disabled={loading || !employeeNo.trim() || !password.trim() || undefined}
          onClick={handleLogin}
        >
          登录
        </Button>
      </View>
      <Text className='login-footer'>客户资源管理系统</Text>
    </View>
  );
}
