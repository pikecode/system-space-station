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
  HQ = 'HQ',
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

export enum MembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
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
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  SETTLED = 'SETTLED',
}
