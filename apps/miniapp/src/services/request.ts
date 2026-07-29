import Taro from '@tarojs/taro';
import { storage } from '../utils/storage';
import { useAuthStore } from '../store/auth';

const BASE_URL = process.env.TARO_APP_API_URL || '/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  params?: object;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const query = params
    ? Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
    : '';
  return `${BASE_URL}${path}${query ? `${path.includes('?') ? '&' : '?'}${query}` : ''}`;
}

function readErrorMessage(data: unknown) {
  const message = (data as { message?: string | string[] })?.message;
  if (Array.isArray(message)) return message[0] ?? '请求失败';
  return message ?? '请求失败';
}

let redirectingToLogin = false;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', data, params, auth = true } = options;
  const header: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = storage.getToken();
    if (token) header['Authorization'] = `Bearer ${token}`;
  }

  const res = await Taro.request({
    url: buildUrl(path, params),
    method,
    data: data ?? undefined,
    header,
  });

  if (res.statusCode === 401 && auth) {
    if (!redirectingToLogin) {
      redirectingToLogin = true;
      useAuthStore.getState().logout();
      Taro.reLaunch({ url: '/pages/login/index' });
      setTimeout(() => { redirectingToLogin = false; }, 3000);
    }
    throw new ApiError('未授权，请重新登录', 401);
  }

  if (res.statusCode >= 400) {
    throw new ApiError(readErrorMessage(res.data), res.statusCode);
  }

  return res.data as T;
}

export const http = {
  get: <T>(path: string, params?: RequestOptions['params']) => request<T>(path, { params }),
  post: <T>(path: string, data?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', data, auth }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', data }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
