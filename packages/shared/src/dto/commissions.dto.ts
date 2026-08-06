import { CommissionEntry, CommissionRole, CommissionStatus } from '../enums';

export interface CommissionRecordDto {
  id: string;
  amount: string;
  ratio: string;
  status: CommissionStatus;
  receiverRole: CommissionRole;
  entryType: CommissionEntry;
  createdAt: string;
  settledAt?: string | null;
  receiverUser?: { id: string; name: string } | null;
  membership?: {
    fee: string;
    customer?: {
      id?: string;
      name: string;
    } | null;
  } | null;
}

export interface CommissionSummaryDto {
  pending: string;
  pendingPayment: string;
  settled: string;
}
