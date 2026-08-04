import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useAuthStore } from '../store/auth';

let navigating = false;

export function useRequireLogin(): boolean {
  const token = useAuthStore.getState().token;

  useEffect(() => {
    if (!token && !navigating) {
      navigating = true;
      Taro.reLaunch({ url: '/pages/login/index' });
      setTimeout(() => { navigating = false; }, 3000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return !!token;
}
