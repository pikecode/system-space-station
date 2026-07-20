import request from './request';

export const positionsApi = {
  getAll: () => request.get('/positions'),
  create: (data: unknown) => request.post('/positions', data),
  update: (id: string, data: unknown) => request.patch(`/positions/${id}`, data),
  disable: (id: string) => request.delete(`/positions/${id}`),
};
