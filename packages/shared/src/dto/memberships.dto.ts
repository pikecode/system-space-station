import { MembershipStatus } from '../enums';

export interface MembershipRecordDto {
  id: string;
  memberNo: string;
  status: MembershipStatus;
  fee: string;
  startDate: string;
  endDate: string;
  paidAt?: string | null;
  paidAmount?: string | null;
  paymentConfirmedBy?: string | null;
  contractedBy?: string | null;
  contractedEmployeeNo?: string | null;
  contractedDepartmentId?: string | null;
  reviewNote?: string | null;
  refundReason?: string | null;
  customer?: { id: string; name: string; phone: string } | null;
  memberLevel?: { id: string; name: string } | null;
  submitter?: { id: string; name: string } | null;
}

export interface MemberLevelDto {
  id: string;
  name: string;
  description?: string | null;
}

export interface CreateMembershipPayloadDto {
  customerId: string;
  memberLevelId?: string;
  fee: number;
  startDate: string;
  endDate: string;
}

export interface ReviewMembershipPayloadDto {
  paidAt?: string;
  reviewNote?: string;
}

export interface ConfirmPaymentPayloadDto {
  paidAt?: string;
  paidAmount?: number;
}

export interface RefundRequestPayloadDto {
  refundReason: string;
}
