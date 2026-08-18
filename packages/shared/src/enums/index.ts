export enum UserRole {
  ADMIN = 'ADMIN',
  HEAD = 'HEAD',
  MEMBER = 'MEMBER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum DepartmentType {
  GOVERNANCE = 'GOVERNANCE',
  HQ = 'HQ',
  CENTER = 'CENTER',
  DIRECT = 'DIRECT',
  MARKET = 'MARKET',
  DIVISION = 'DIVISION',
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
}

export enum CustomerSource {
  REFERRAL = 'REFERRAL',
  SELF_DEVELOPED = 'SELF_DEVELOPED',
  ACTIVITY = 'ACTIVITY',
  ONLINE = 'ONLINE',
  OTHER = 'OTHER',
}

export enum CustomerStatus {
  PROSPECT = 'PROSPECT',
  ACTIVE_MEMBER = 'ACTIVE_MEMBER',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum RegistrationSource {
  SELF = 'SELF',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

export enum RiskTolerance {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE',
  SPECULATIVE = 'SPECULATIVE',
}

export enum MemberLevelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum MembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUNDED = 'REFUNDED',
}

export enum CommissionRole {
  MEMBER = 'MEMBER',
  DEPT_HEAD = 'DEPT_HEAD',
  MARKET_HEAD = 'MARKET_HEAD',
  COMPANY = 'COMPANY',
  REFERRAL = 'REFERRAL',
}

export enum CommissionEntry {
  EARNING = 'EARNING',
  REVERSAL = 'REVERSAL',
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  SETTLED = 'SETTLED',
}

export enum PeriodStatus {
  OPEN = 'OPEN',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  SETTLED = 'SETTLED',
}
