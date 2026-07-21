import { http } from './request';

export interface CommissionRecord {
  id: string;
  amount: string;
  ratio: string;
  status: string;
  receiverRole: string;
  entryType: string;
  createdAt: string;
  settledAt?: string;
  membership?: {
    fee: string;
    customer?: { name: string };
  };
}

export const commissionsApi = {
  getMy: async (): Promise<CommissionRecord[]> => {
    const res = await http.get<CommissionRecord[] | { data: CommissionRecord[] }>('/commissions/my');
    return Array.isArray(res) ? res : (res as any).data ?? [];
  },
  getDepartment: async (): Promise<CommissionRecord[]> => {
    const res = await http.get<CommissionRecord[] | { data: CommissionRecord[] }>('/commissions/department');
    return Array.isArray(res) ? res : (res as any).data ?? [];
  },
};
