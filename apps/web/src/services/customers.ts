import request from './request';
import type {
  CreateCustomerPayloadDto,
  CustomerDto,
  PaginatedResponse,
  QueryCustomersDto,
  ContractCustomerPayloadDto,
  UpdateCustomerPayloadDto,
} from 'shared';
import type {
  CustomerInvestment,
  CustomerProfitRecord,
  InvestmentCommissionRecord,
} from './investments';

export interface CustomerAssets {
  customer: CustomerDto;
  investments: CustomerInvestment[];
  investmentCommissions: InvestmentCommissionRecord[];
  profitRecords: CustomerProfitRecord[];
}

export interface ResetCustomerPasswordResult {
  customerNo: string | null;
  initialPassword: string;
}

export const customersApi = {
  getAll: (params?: QueryCustomersDto) =>
    request.get<PaginatedResponse<CustomerDto>, PaginatedResponse<CustomerDto>>('/customers', { params }),
  getOne: (id: string) => request.get<CustomerDto, CustomerDto>(`/customers/${id}`),
  create: (data: CreateCustomerPayloadDto) => request.post<CustomerDto, CustomerDto>('/customers', data),
  update: (id: string, data: UpdateCustomerPayloadDto) => request.patch<CustomerDto, CustomerDto>(`/customers/${id}`, data),
  getAssets: (id: string) => request.get<CustomerAssets, CustomerAssets>(`/customers/${id}/assets`),
  resetPassword: (id: string) =>
    request.patch<ResetCustomerPasswordResult, ResetCustomerPasswordResult>(`/customers/${id}/reset-password`),
  contract: (id: string, data: ContractCustomerPayloadDto) => request.patch<CustomerDto, CustomerDto>(`/customers/${id}/contract`, data),
  transfer: (id: string, data: unknown) => request.patch(`/customers/${id}/transfer`, data),
  disable: (id: string) => request.delete<CustomerDto, CustomerDto>(`/customers/${id}`),
  restore: (id: string) => request.patch<CustomerDto, CustomerDto>(`/customers/${id}/restore`),
};
