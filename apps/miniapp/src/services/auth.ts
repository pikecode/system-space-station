import Taro from '@tarojs/taro';
import { http } from './request';
import type {
  CustomerLoginDto,
  CustomerLoginResponseDto,
  LoginResponseDto,
  MiniAppLoginDto,
  UnifiedMiniAppLoginDto,
  UnifiedMiniAppLoginResponseDto,
} from 'shared';

export const authApi = {
  login: (data: MiniAppLoginDto) =>
    http.post<LoginResponseDto>('/auth/miniapp-login', data, false),

  customerLogin: (data: CustomerLoginDto) =>
    http.post<CustomerLoginResponseDto>('/auth/customer-login', data, false),

  unifiedLogin: (data: UnifiedMiniAppLoginDto) =>
    http.post<UnifiedMiniAppLoginResponseDto>('/auth/miniapp-unified-login', data, false),

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
