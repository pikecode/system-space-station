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
  getMy: () => http.get<CommissionRecord[]>('/commissions/my'),
  getDepartment: () => http.get<CommissionRecord[]>('/commissions/department'),
};
