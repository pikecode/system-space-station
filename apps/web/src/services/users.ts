import request from './request';

export const usersApi = {
  getAll: (params?: unknown) => request.get('/users', { params }),
  getOne: (id: string) => request.get(`/users/${id}`),
  getDepartmentMembers: (departmentId?: string) =>
    request.get('/users/department-members', { params: { departmentId } }),
  create: (data: unknown) => request.post('/users', data),
  update: (id: string, data: unknown) => request.patch(`/users/${id}`, data),
  transfer: (id: string, data: unknown) => request.patch(`/users/${id}/transfer`, data),
  setStatus: (id: string, data: unknown) => request.patch(`/users/${id}/status`, data),
};
