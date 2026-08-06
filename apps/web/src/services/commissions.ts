import request from './request';
import type { CommissionRecordDto, CommissionSummaryDto, PaginatedResponse } from 'shared';

interface CommissionQuery {
  page?: number;
  pageSize?: number;
  status?: string;
}

export const commissionsApi = {
  getMy: (params?: CommissionQuery) =>
    request.get<PaginatedResponse<CommissionRecordDto>, PaginatedResponse<CommissionRecordDto>>('/commissions/my', { params }),
  getMySummary: () =>
    request.get<CommissionSummaryDto, CommissionSummaryDto>('/commissions/my-summary'),
  getDepartment: (params?: CommissionQuery) =>
    request.get<PaginatedResponse<CommissionRecordDto>, PaginatedResponse<CommissionRecordDto>>('/commissions/department', { params }),
  getDepartmentSummary: () =>
    request.get<CommissionSummaryDto, CommissionSummaryDto>('/commissions/department-summary'),
  getOverview: (params?: CommissionQuery) =>
    request.get<PaginatedResponse<CommissionRecordDto>, PaginatedResponse<CommissionRecordDto>>('/commissions/overview', { params }),
  getOverviewSummary: () =>
    request.get<CommissionSummaryDto, CommissionSummaryDto>('/commissions/overview-summary'),
  getPeriods: (params?: unknown) => request.get('/commissions/periods', { params }),
  settle: (periodId: string) => request.post(`/commissions/settle/${periodId}`),
};
