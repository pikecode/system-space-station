import { http } from './request';

export interface MembershipRecord {
  id: string;
  memberNo: string;
  status: string;
  fee: string;
  startDate: string;
  endDate: string;
  reviewNote?: string;
  refundReason?: string;
  customer?: { id: string; name: string; phone: string };
  memberLevel?: { id: string; name: string };
  submitter?: { id: string; name: string };
}

export interface MemberLevel {
  id: string;
  name: string;
  description?: string;
}

export const membershipsApi = {
  getAll: () => http.get<{ data: MembershipRecord[]; total: number }>('/memberships'),
  getPending: () => http.get<MembershipRecord[]>('/memberships/pending'),
  getMemberLevels: () => http.get<MemberLevel[]>('/member-levels'),

  create: (data: unknown) => http.post<MembershipRecord>('/memberships', data),
  resubmit: (id: string, data: unknown) =>
    http.patch<MembershipRecord>(`/memberships/${id}/resubmit`, data),

  approve: (id: string, data: { paidAt: string; reviewNote?: string }) =>
    http.patch<MembershipRecord>(`/memberships/${id}/approve`, data),
  reject: (id: string, data: { reviewNote: string }) =>
    http.patch<MembershipRecord>(`/memberships/${id}/reject`, data),

  requestRefund: (id: string, data: { refundReason: string }) =>
    http.post<MembershipRecord>(`/memberships/${id}/refund`, data),
  approveRefund: (id: string) =>
    http.patch<MembershipRecord>(`/memberships/${id}/refund/approve`),
  rejectRefund: (id: string, data: { reviewNote: string }) =>
    http.patch<MembershipRecord>(`/memberships/${id}/refund/reject`, data),
};
