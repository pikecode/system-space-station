import request from './request';
import type {
  CreateCustomerPayloadDto,
  CustomerDto,
  PaginatedResponse,
  QueryCustomersDto,
  UpdateCustomerPayloadDto,
} from 'shared';

export const customersApi = {
  getAll: (params?: QueryCustomersDto) =>
    request.get<PaginatedResponse<CustomerDto>, PaginatedResponse<CustomerDto>>('/customers', { params }),
  getOne: (id: string) => request.get<CustomerDto, CustomerDto>(`/customers/${id}`),
  create: (data: CreateCustomerPayloadDto) => request.post<CustomerDto, CustomerDto>('/customers', data),
  update: (id: string, data: UpdateCustomerPayloadDto) => request.patch<CustomerDto, CustomerDto>(`/customers/${id}`, data),
  transfer: (id: string, data: unknown) => request.patch(`/customers/${id}/transfer`, data),
  disable: (id: string) => request.delete(`/customers/${id}`),
};
