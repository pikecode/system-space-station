import request from './request';

export const customersApi = {
  getAll: (params?: unknown) => request.get('/customers', { params }),
  getOne: (id: string) => request.get(`/customers/${id}`),
  create: (data: unknown) => request.post('/customers', data),
  update: (id: string, data: unknown) => request.patch(`/customers/${id}`, data),
  transfer: (id: string, data: unknown) => request.patch(`/customers/${id}/transfer`, data),
  disable: (id: string) => request.delete(`/customers/${id}`),
};
