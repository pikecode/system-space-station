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
  getAll: async (): Promise<{ data: MembershipRecord[]; total: number }> => {
    const res = await http.get<{ data: MembershipRecord[]; total: number } | MembershipRecord[]>('/memberships');
    return Array.isArray(res) ? { data: res, total: res.length } : res as { data: MembershipRecord[]; total: number };
  },
  getPending: async (): Promise<MembershipRecord[]> => {
    const res = await http.get<MembershipRecord[] | { data: MembershipRecord[] }>('/memberships/pending');
    return Array.isArray(res) ? res : (res as any).data ?? [];
  },
  getMemberLevels: async (): Promise<MemberLevel[]> => {
    const res = await http.get<MemberLevel[] | { data: MemberLevel[] }>('/member-levels');
    return Array.isArray(res) ? res : (res as any).data ?? [];
  },

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
