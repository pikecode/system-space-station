import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import { authApi } from '../../services/auth';
import { useAuthStore } from '../../store/auth';
import './index.css';

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setCustomerAuth = useAuthStore((s) => s.setCustomerAuth);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isCustomer = useAuthStore((s) => s.isCustomer);
  const [loginType, setLoginType] = useState<'EMPLOYEE' | 'CUSTOMER'>('EMPLOYEE');
  const [employeeNo, setEmployeeNo] = useState('');
  const [customerNo, setCustomerNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isLoggedIn()) {
      if (isCustomer()) Taro.redirectTo({ url: '/pages/customer-portal/index' });
      else Taro.switchTab({ url: '/pages/customers/index' });
    }
  }, []);

  const normalizeNo = (value: string) => value.trim().toUpperCase();

  const handleLogin = async () => {
    if (loading) return;
    setErrorMessage('');
    const normalizedNo = normalizeNo(loginType === 'CUSTOMER' ? customerNo : employeeNo);
    if (!normalizedNo || !password.trim()) {
      setErrorMessage('请填写编号和密码');
      return;
    }
    setLoading(true);
    try {
      if (loginType === 'CUSTOMER') {
        const res = await authApi.customerLogin({ customerNo: normalizedNo, password });
        setCustomerAuth(res.token, res.customer);
        Taro.redirectTo({ url: '/pages/customer-portal/index' });
      } else {
        const res = await authApi.login({ employeeNo: normalizedNo, password });
        setAuth(res.token, res.user);
        Taro.switchTab({ url: '/pages/customers/index' });
      }
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
        <Text className='login-title'>{loginType === 'CUSTOMER' ? '会员登录' : '登录工作台'}</Text>
        <Text className='login-subtitle'>
          {loginType === 'CUSTOMER' ? '查看企业资料与入会信息' : '查看客户、待办与业务进展'}
        </Text>
      </View>

      <View className='login-form'>
        <View className='login-segment'>
          <View
            className={`login-segment__item${loginType === 'EMPLOYEE' ? ' login-segment__item--active' : ''}`}
            onClick={() => { setLoginType('EMPLOYEE'); setErrorMessage(''); setPassword(''); }}
          >
            员工
          </View>
          <View
            className={`login-segment__item${loginType === 'CUSTOMER' ? ' login-segment__item--active' : ''}`}
            onClick={() => { setLoginType('CUSTOMER'); setErrorMessage(''); setPassword(''); }}
          >
            会员
          </View>
        </View>
        <View className='login-field'>
          <Text className='login-field__label'>编号</Text>
          <View className='login-field__control'>
            <Input
              className='login-field__input'
              placeholder={loginType === 'CUSTOMER' ? '请输入客户编号' : '请输入员工编号'}
              confirmType='next'
              value={loginType === 'CUSTOMER' ? customerNo : employeeNo}
              onInput={(e) => {
                const value = e.detail.value.toUpperCase().replace(/\s/g, '');
                if (loginType === 'CUSTOMER') setCustomerNo(value);
                else setEmployeeNo(value);
                setErrorMessage('');
              }}
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
          disabled={loading || !(loginType === 'CUSTOMER' ? customerNo : employeeNo).trim() || !password.trim() || undefined}
          onClick={handleLogin}
        >
          登录
        </Button>
      </View>
      <Text className='login-footer'>客户资源管理系统</Text>
    </View>
  );
}
