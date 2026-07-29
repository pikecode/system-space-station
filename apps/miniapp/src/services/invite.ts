import { http } from './request';
import type {
  InviterInfoDto,
  PublicRegisterCustomerPayloadDto,
  PublicRegisterCustomerResponseDto,
} from 'shared';

export type InviterInfo = InviterInfoDto;
export type RegisterPayload = PublicRegisterCustomerPayloadDto;

export const inviteApi = {
  getInviter: (shareCode: string) =>
    http.get<InviterInfo>(`/public/invite/${shareCode}`),

  register: (data: RegisterPayload) =>
    http.post<PublicRegisterCustomerResponseDto>('/public/register', data, false),
};
