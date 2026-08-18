import { http } from './request';
import {
  type CreateMembershipPayloadDto,
  type ConfirmPaymentPayloadDto,
  type MemberLevelDto,
  type MembershipRecordDto,
  type PaginatedResponse,
  type RefundRequestPayloadDto,
  type ReviewMembershipPayloadDto,
} from 'shared';
import { normalizePaginated } from './response';

export type MembershipRecord = MembershipRecordDto;
export type MemberLevel = MemberLevelDto;

export const membershipsApi = {
  getAll: async (params?: { page?: string; pageSize?: string; status?: string; customerId?: string }): Promise<PaginatedResponse<MembershipRecord>> => {
    const res = await http.get<MembershipRecord[] | PaginatedResponse<MembershipRecord>>('/memberships', params);
    return normalizePaginated(res);
  },
  getOne: (id: string) => http.get<MembershipRecord>(`/memberships/${id}`),
  getPending: async (): Promise<MembershipRecord[]> => {
    const res = await http.get<MembershipRecord[] | { data: MembershipRecord[] }>('/memberships/pending');
    return Array.isArray(res) ? res : res.data ?? [];
  },
  getMemberLevels: async (): Promise<MemberLevel[]> => {
    const res = await http.get<MemberLevel[] | { data: MemberLevel[] }>('/member-levels');
    return Array.isArray(res) ? res : res.data ?? [];
  },

  create: (data: CreateMembershipPayloadDto) => http.post<MembershipRecord>('/memberships', data),
  resubmit: (id: string, data: CreateMembershipPayloadDto) =>
    http.patch<MembershipRecord>(`/memberships/${id}/resubmit`, data),

  approve: (id: string, data: ReviewMembershipPayloadDto) =>
    http.patch<MembershipRecord>(`/memberships/${id}/approve`, data),
  confirmPayment: (id: string, data: ConfirmPaymentPayloadDto) =>
    http.patch<MembershipRecord>(`/memberships/${id}/confirm-payment`, data),
  reject: (id: string, data: ReviewMembershipPayloadDto) =>
    http.patch<MembershipRecord>(`/memberships/${id}/reject`, data),

  requestRefund: (id: string, data: RefundRequestPayloadDto) =>
    http.post<MembershipRecord>(`/memberships/${id}/refund`, data),
  approveRefund: (id: string) =>
    http.patch<MembershipRecord>(`/memberships/${id}/refund/approve`),
  rejectRefund: (id: string, data: ReviewMembershipPayloadDto) =>
    http.patch<MembershipRecord>(`/memberships/${id}/refund/reject`, data),
};
