import { http } from './request';

export interface InviterInfo {
  inviterName: string;
  deptName: string;
}

export interface RegisterPayload {
  shareCode: string;
  customerType: 'INDIVIDUAL' | 'COMPANY';
  name: string;
  phone: string;
  wechat?: string;
  notes?: string;
}

export const inviteApi = {
  getInviter: (shareCode: string) =>
    http.get<InviterInfo>(`/public/invite/${shareCode}`),

  register: (data: RegisterPayload) =>
    http.post<{ success: boolean; customerId: string }>('/public/register', data, false),
};
