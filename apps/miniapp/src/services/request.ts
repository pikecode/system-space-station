import Taro from '@tarojs/taro';
import { storage } from '../utils/storage';

const BASE_URL = (typeof process !== 'undefined' && process.env?.TARO_APP_API_URL) || '/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, auth = true } = options;
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth) {
    const token = storage.getToken();
    if (token) header['Authorization'] = `Bearer ${token}`;
  }

  const res = await Taro.request({
    url: `${BASE_URL}${path}`,
    method,
    data: data ?? undefined,
    header,
  });

  if (res.statusCode === 401) {
    storage.clear();
    Taro.reLaunch({ url: '/pages/login/index' });
    throw new ApiError('未授权，请重新登录', 401);
  }

  if (res.statusCode >= 400) {
    const msg = (res.data as { message?: string })?.message ?? '请求失败';
    throw new ApiError(Array.isArray(msg) ? msg[0] : msg, res.statusCode);
  }

  return res.data as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', data, auth }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', data }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
