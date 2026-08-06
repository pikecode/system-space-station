import {
  CustomerSource,
  CustomerStatus,
  CustomerType,
  Gender,
  RegistrationSource,
  RiskTolerance,
} from '../enums';

export interface MembershipSummaryDto {
  id: string;
  memberNo: string;
  status: string;
  fee: string;
  startDate: string;
  endDate: string;
  memberLevel?: {
    id?: string;
    name: string;
  } | null;
}

export interface CustomerDto {
  id: string;
  name: string;
  phone: string;
  customerType: CustomerType;
  source: CustomerSource;
  registrationSource?: RegistrationSource;
  tags?: string | null;
  notes?: string | null;
  wechat?: string | null;
  gender?: Gender | null;
  birthday?: string | null;
  address?: string | null;
  creditCode?: string | null;
  industry?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  legalPerson?: string | null;
  registeredCapital?: string | null;
  idCard?: string | null;
  riskTolerance?: RiskTolerance | null;
  isAccreditedInvestor?: boolean | null;
  investmentAmount?: string | null;
  assignedUser?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  memberships?: MembershipSummaryDto[];
  status: CustomerStatus;
}

export interface QueryCustomersDto {
  name?: string;
  phone?: string;
  customerType?: CustomerType;
  source?: CustomerSource;
  status?: CustomerStatus;
  departmentId?: string;
  assignedTo?: string;
  page?: number | string;
  pageSize?: number | string;
}

export interface CreateCustomerPayloadDto {
  shareCode?: string;
  assignedUserId?: string;
  customerType: CustomerType;
  name: string;
  phone: string;
  source?: CustomerSource;
  tags?: string;
  notes?: string;
  wechat?: string;
  gender?: Gender;
  birthday?: string;
  address?: string;
  creditCode?: string;
  industry?: string;
  contactName?: string;
  contactPhone?: string;
  legalPerson?: string;
  registeredCapital?: string;
  idCard?: string;
  riskTolerance?: RiskTolerance;
  isAccreditedInvestor?: boolean;
  investmentAmount?: string;
}

export type UpdateCustomerPayloadDto = Partial<
  Omit<CreateCustomerPayloadDto, 'shareCode' | 'assignedUserId'>
> & { status?: CustomerStatus };

export interface PublicRegisterCustomerPayloadDto {
  shareCode: string;
  customerType: CustomerType;
  name: string;
  phone: string;
  wechat?: string;
  notes?: string;
  gender?: Gender;
  birthday?: string;
  address?: string;
  creditCode?: string;
  industry?: string;
  contactName?: string;
  contactPhone?: string;
  legalPerson?: string;
  registeredCapital?: string;
  idCard?: string;
  riskTolerance?: RiskTolerance;
  isAccreditedInvestor?: boolean;
  investmentAmount?: string;
}

export interface PublicRegisterCustomerResponseDto {
  success: boolean;
  customerId: string;
}

export interface InviterInfoDto {
  inviterName: string;
  deptName: string;
}
