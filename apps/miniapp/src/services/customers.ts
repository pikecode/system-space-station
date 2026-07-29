import { http } from './request';
import {
  type CreateCustomerPayloadDto,
  type CustomerDto,
  type PaginatedResponse,
  type QueryCustomersDto,
  type UpdateCustomerPayloadDto,
} from 'shared';
import { normalizePaginated } from './response';

export type CustomerRow = CustomerDto;
export type CreateCustomerPayload = CreateCustomerPayloadDto;

export const customersApi = {
  getAll: async (params?: QueryCustomersDto): Promise<PaginatedResponse<CustomerRow>> => {
    const res = await http.get<CustomerRow[] | PaginatedResponse<CustomerRow>>('/customers', params);
    return normalizePaginated(res);
  },

  getOne: (id: string) =>
    http.get<CustomerRow>(`/customers/${id}`),

  create: (data: CreateCustomerPayload) =>
    http.post<CustomerRow>('/customers', data),

  update: (id: string, data: UpdateCustomerPayloadDto) =>
    http.patch<CustomerRow>(`/customers/${id}`, data),
};
