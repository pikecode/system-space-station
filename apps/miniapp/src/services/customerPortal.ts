import { http } from './request';

export interface CustomerPortalMembership {
  id: string;
  memberNo: string;
  status: string;
  fee: string;
  paidAt?: string | null;
  paidAmount?: string | null;
  startDate: string;
  endDate: string;
  memberLevel?: { id: string; name: string } | null;
}

export interface CustomerPortalMe {
  id: string;
  customerNo: string;
  name: string;
  phone: string;
  customerType: string;
  status: string;
  memberActivatedAt?: string | null;
  investmentAmount?: string | null;
  memberships: CustomerPortalMembership[];
}

export const customerPortalApi = {
  me: () => http.get<CustomerPortalMe>('/customer-portal/me'),
  memberships: () => http.get<CustomerPortalMembership[]>('/customer-portal/memberships'),
};
