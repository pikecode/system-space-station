import request from './request';

export interface InvestmentProduct {
  id: string;
  productNo: string;
  name: string;
  productType?: string | null;
  riskLevel?: string | null;
  minAmount?: string | null;
  expectedStartAt?: string | null;
  expectedEndAt?: string | null;
  status: string;
  remark?: string | null;
}

export interface CustomerInvestment {
  id: string;
  investmentNo: string;
  amount: string;
  investedAt: string;
  status: string;
  contractedEmployeeNo?: string | null;
  createdEmployeeNo?: string | null;
  customer: { id: string; name: string; customerNo?: string | null; status: string };
  product: { id: string; productNo: string; name: string; status: string };
}

export interface CreateCustomerInvestmentResult extends CustomerInvestment {
  customerLogin?: {
    customerNo: string;
    initialPassword: string | null;
  };
}

export interface ProductYieldPeriod {
  id: string;
  totalProfit: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  product: { id: string; productNo: string; name: string };
  _count?: { profitRecords: number };
}

export interface CustomerProfitRecord {
  id: string;
  principalAmount: string;
  investmentShareRatio: string;
  profitAmount: string;
  customerAmount: string;
  ratioSnapshot: {
    configId: string;
    customerRatio: string;
    departmentRatio: string;
    contractedUserRatio: string;
    createdUserRatio: string;
    companyRatio: string;
    effectiveFrom: string;
  };
  status: string;
  customer: { id: string; name: string; customerNo?: string | null };
  product: { id: string; productNo: string; name: string };
  yieldPeriod: { id: string; periodStart: string; periodEnd: string; totalProfit: string };
  shareRecords: ProfitShareRecord[];
}

export interface ProfitShareRecord {
  id: string;
  receiverType: string;
  receiverId?: string | null;
  receiverNo?: string | null;
  ratio: string;
  amount: string;
  status: string;
}

export interface ProfitShareConfig {
  id: string;
  customerRatio: string;
  departmentRatio: string;
  contractedUserRatio: string;
  createdUserRatio: string;
  companyRatio: string;
  effectiveFrom: string;
  status: string;
  remark?: string | null;
}

export interface InvestmentCommissionConfig {
  id: string;
  contractedDepartmentRatio: string;
  contractedUserRatio: string;
  companyRatio: string;
  effectiveFrom: string;
  status: string;
  remark?: string | null;
}

export interface InvestmentCommissionRecord {
  id: string;
  receiverType: string;
  receiverId?: string | null;
  receiverNo?: string | null;
  baseAmount: string;
  ratio: string;
  amount: string;
  configSnapshot: {
    configId: string;
    contractedDepartmentRatio: string;
    contractedUserRatio: string;
    companyRatio: string;
    effectiveFrom: string;
  };
  status: string;
  createdAt: string;
  settledAt?: string | null;
  investment: CustomerInvestment;
}

export const investmentsApi = {
  products: (params?: Record<string, unknown>) =>
    request.get<InvestmentProduct[], InvestmentProduct[]>('/investment-products', { params }),
  createProduct: (data: unknown) => request.post<unknown, unknown>('/investment-products', data),
  customerInvestments: (params?: Record<string, unknown>) =>
    request.get<CustomerInvestment[], CustomerInvestment[]>('/customer-investments', { params }),
  createCustomerInvestment: (data: unknown) =>
    request.post<CreateCustomerInvestmentResult, CreateCustomerInvestmentResult>('/customer-investments', data),
  investmentCommissions: (params?: Record<string, unknown>) =>
    request.get<InvestmentCommissionRecord[], InvestmentCommissionRecord[]>('/investment-commissions', { params }),
  settleInvestmentCommission: (id: string) => request.post<unknown, unknown>(`/investment-commissions/${id}/settle`),
  investmentCommissionConfigs: () =>
    request.get<InvestmentCommissionConfig[], InvestmentCommissionConfig[]>('/investment-commission-configs'),
  currentInvestmentCommissionConfig: () =>
    request.get<InvestmentCommissionConfig, InvestmentCommissionConfig>('/investment-commission-configs/current'),
  createInvestmentCommissionConfig: (data: unknown) => request.post<unknown, unknown>('/investment-commission-configs', data),
  yieldPeriods: (params?: Record<string, unknown>) =>
    request.get<ProductYieldPeriod[], ProductYieldPeriod[]>('/product-yields', { params }),
  createYieldPeriod: (data: unknown) => request.post<unknown, unknown>('/product-yields', data),
  confirmYieldPeriod: (id: string) => request.post<unknown, unknown>(`/product-yields/${id}/confirm`),
  settleYieldPeriod: (id: string) => request.post<unknown, unknown>(`/product-yields/${id}/settle`),
  profits: (params?: Record<string, unknown>) =>
    request.get<CustomerProfitRecord[], CustomerProfitRecord[]>('/customer-profits', { params }),
  settleProfit: (id: string) => request.post<unknown, unknown>(`/customer-profits/${id}/settle`),
  configs: () => request.get<ProfitShareConfig[], ProfitShareConfig[]>('/profit-share-configs'),
  currentConfig: () => request.get<ProfitShareConfig, ProfitShareConfig>('/profit-share-configs/current'),
  createConfig: (data: unknown) => request.post<unknown, unknown>('/profit-share-configs', data),
};
