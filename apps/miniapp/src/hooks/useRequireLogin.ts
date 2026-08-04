import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useAuthStore } from '../store/auth';

let navigating = false;

export function useRequireLogin(): boolean {
  // 响应式订阅 token，token 变化时触发 effect
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token && !navigating) {
      navigating = true;
      Taro.reLaunch({ url: '/pages/login/index' });
      setTimeout(() => { navigating = false; }, 3000);
    }
  }, [token]); // 只在 token 变化时执行，不在每次渲染时重新注册

  return !!token;
}
