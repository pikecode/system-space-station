import { http } from './request';
import {
  type CommissionRecordDto,
  type PaginatedResponse,
} from 'shared';
import { normalizePaginated } from './response';

export type CommissionRecord = CommissionRecordDto;

export const commissionsApi = {
  getMy: async (params?: { page?: string; pageSize?: string; status?: string }): Promise<PaginatedResponse<CommissionRecord>> => {
    const res = await http.get<CommissionRecord[] | PaginatedResponse<CommissionRecord>>('/commissions/my', params);
    return normalizePaginated(res);
  },
  getDepartment: async (params?: { page?: string; pageSize?: string }): Promise<PaginatedResponse<CommissionRecord>> => {
    const res = await http.get<CommissionRecord[] | PaginatedResponse<CommissionRecord>>('/commissions/department', params);
    return normalizePaginated(res);
  },
};
