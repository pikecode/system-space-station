import Taro, { useDidShow } from '@tarojs/taro';
import { useAuthStore } from '../store/auth';

export function useRequireLogin() {
  const token = useAuthStore((s) => s.token);

  useDidShow(() => {
    if (!token) {
      Taro.reLaunch({ url: '/pages/login/index' });
    }
  });

  return !!token;
}
