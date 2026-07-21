import Taro from '@tarojs/taro';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const storage = {
  getToken: (): string | null => {
    try { return Taro.getStorageSync(TOKEN_KEY) || null; }
    catch { return null; }
  },
  setToken: (token: string) => Taro.setStorageSync(TOKEN_KEY, token),
  removeToken: () => Taro.removeStorageSync(TOKEN_KEY),

  getUser: <T = unknown>(): T | null => {
    try {
      const raw = Taro.getStorageSync(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setUser: (user: unknown) => Taro.setStorageSync(USER_KEY, JSON.stringify(user)),
  removeUser: () => Taro.removeStorageSync(USER_KEY),

  clear: () => {
    Taro.removeStorageSync(TOKEN_KEY);
    Taro.removeStorageSync(USER_KEY);
  },
};
