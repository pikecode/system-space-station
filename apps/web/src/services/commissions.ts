import request from './request';

export const commissionsApi = {
  getMy: (params?: unknown) => request.get('/commissions/my', { params }),
  getDepartment: (params?: unknown) => request.get('/commissions/department', { params }),
  getOverview: (params?: unknown) => request.get('/commissions/overview', { params }),
  getPeriods: (params?: unknown) => request.get('/commissions/periods', { params }),
  settle: (periodId: string) => request.post(`/commissions/settle/${periodId}`),
};
