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

export const investmentsApi = {
  products: () => request.get<InvestmentProduct[], InvestmentProduct[]>('/investment-products'),
  createProduct: (data: unknown) => request.post('/investment-products', data),
  customerInvestments: () => request.get<CustomerInvestment[], CustomerInvestment[]>('/customer-investments'),
  createCustomerInvestment: (data: unknown) => request.post('/customer-investments', data),
  yieldPeriods: () => request.get<ProductYieldPeriod[], ProductYieldPeriod[]>('/product-yields'),
  createYieldPeriod: (data: unknown) => request.post('/product-yields', data),
  confirmYieldPeriod: (id: string) => request.post(`/product-yields/${id}/confirm`),
  profits: () => request.get<CustomerProfitRecord[], CustomerProfitRecord[]>('/customer-profits'),
  settleProfit: (id: string) => request.post(`/customer-profits/${id}/settle`),
  configs: () => request.get<ProfitShareConfig[], ProfitShareConfig[]>('/profit-share-configs'),
  currentConfig: () => request.get<ProfitShareConfig, ProfitShareConfig>('/profit-share-configs/current'),
  createConfig: (data: unknown) => request.post('/profit-share-configs', data),
};
