import Taro, { useDidShow } from '@tarojs/taro';
import { useAuthStore } from '../store/auth';

let navigating = false;

export function useRequireLogin() {
  useDidShow(() => {
    // 始终从 store 读最新值，避免闭包捕获旧 token
    const token = useAuthStore.getState().token;
    if (!token && !navigating) {
      navigating = true;
      Taro.reLaunch({ url: '/pages/login/index' });
      setTimeout(() => { navigating = false; }, 3000);
    }
  });

  return !!useAuthStore.getState().token;
}
