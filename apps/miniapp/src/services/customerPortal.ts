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

export interface CustomerPortalInvestment {
  id: string;
  investmentNo: string;
  amount: string;
  investedAt: string;
  status: string;
  product: {
    id: string;
    productNo: string;
    name: string;
    productType?: string | null;
    riskLevel?: string | null;
  };
}

export interface CustomerPortalProfit {
  id: string;
  principalAmount: string;
  profitAmount: string;
  customerAmount: string;
  status: string;
  createdAt: string;
  settledAt?: string | null;
  product: { id: string; productNo: string; name: string };
  yieldPeriod: {
    id: string;
    periodStart: string;
    periodEnd: string;
    totalProfit: string;
  };
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
  investments: CustomerPortalInvestment[];
  profitRecords: CustomerPortalProfit[];
}

export const customerPortalApi = {
  me: () => http.get<CustomerPortalMe>('/customer-portal/me'),
  memberships: () => http.get<CustomerPortalMembership[]>('/customer-portal/memberships'),
  investments: () => http.get<CustomerPortalInvestment[]>('/customer-portal/investments'),
  profits: () => http.get<CustomerPortalProfit[]>('/customer-portal/profits'),
};
