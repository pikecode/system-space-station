import request from './request';

export const departmentsApi = {
  getTree: () => request.get('/departments/tree'),
  getAll: () => request.get('/departments'),
  getOne: (id: string) => request.get(`/departments/${id}`),
  create: (data: unknown) => request.post('/departments', data),
  update: (id: string, data: unknown) => request.patch(`/departments/${id}`, data),
  disable: (id: string) => request.delete(`/departments/${id}`),
};
