import Taro from '@tarojs/taro';
import { http } from './request';
import type { LoginDto, LoginResponseDto } from 'shared';

export const authApi = {
  login: (data: LoginDto) =>
    http.post<LoginResponseDto>('/auth/login', data, false),

  wechatLogin: async (): Promise<LoginResponseDto> => {
    const { code } = await Taro.login();
    return http.post<LoginResponseDto>('/auth/wechat-login', { code }, false);
  },

  bindWechat: async (account: string, password: string): Promise<LoginResponseDto> => {
    const { code } = await Taro.login();
    return http.post<LoginResponseDto>('/auth/wechat-bind', { account, password, code }, false);
  },

  me: () => http.get<LoginResponseDto['user']>('/auth/me'),
};
