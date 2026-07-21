import { http } from './request';

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  customerType: 'INDIVIDUAL' | 'COMPANY';
  source: string;
  tags?: string;
  notes?: string;
  wechat?: string;
  gender?: string;
  birthday?: string;
  address?: string;
  creditCode?: string;
  industry?: string;
  contactName?: string;
  contactPhone?: string;
  assignedUser?: { id: string; name: string };
  department?: { id: string; name: string };
  memberships?: MembershipSummary[];
  status: string;
}

export interface MembershipSummary {
  id: string;
  memberNo: string;
  status: string;
  fee: string;
  startDate: string;
  endDate: string;
  memberLevel?: { name: string };
}

export const customersApi = {
  getAll: (params?: { name?: string; phone?: string }) =>
    http.get<CustomerRow[]>(`/customers?${new URLSearchParams(params as Record<string, string> ?? {})}`),

  getOne: (id: string) =>
    http.get<CustomerRow>(`/customers/${id}`),

  create: (data: unknown) =>
    http.post<CustomerRow>('/customers', data),

  update: (id: string, data: unknown) =>
    http.patch<CustomerRow>(`/customers/${id}`, data),
};
