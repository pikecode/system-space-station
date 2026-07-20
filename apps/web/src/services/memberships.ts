import request from './request';

export const membershipsApi = {
  getAll: (params?: unknown) => request.get('/memberships', { params }),
  getPending: () => request.get('/memberships/pending'),
  create: (data: unknown) => request.post('/memberships', data),
  resubmit: (id: string, data: unknown) => request.patch(`/memberships/${id}/resubmit`, data),
  approve: (id: string, data: unknown) => request.patch(`/memberships/${id}/approve`, data),
  reject: (id: string, data: unknown) => request.patch(`/memberships/${id}/reject`, data),
  requestRefund: (id: string, data: unknown) => request.post(`/memberships/${id}/refund`, data),
  approveRefund: (id: string) => request.patch(`/memberships/${id}/refund/approve`),
  rejectRefund: (id: string, data: unknown) => request.patch(`/memberships/${id}/refund/reject`, data),
};
