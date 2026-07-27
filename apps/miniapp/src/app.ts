import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import Taro from '@tarojs/taro';
import './app.css';

export default function App({ children }: PropsWithChildren) {
  useEffect(() => {
    try {
      const options = Taro.getLaunchOptionsSync();
      const shareCode = (options.query as Record<string, string>)?.shareCode;
      if (shareCode) {
        Taro.setStorageSync('pendingShareCode', shareCode);
      }
    } catch {}
  }, []);
  return children;
}
