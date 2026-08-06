import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) return '网络连接失败，请检查网络后重试';

  const message = error.response.data?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (error.response.status >= 500) return '服务暂时不可用，请稍后重试';
  return fallback;
}
