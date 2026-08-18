ALTER TYPE "CustomerStatus" ADD VALUE IF NOT EXISTS 'PROSPECT';
ALTER TYPE "CustomerStatus" ADD VALUE IF NOT EXISTS 'ACTIVE_MEMBER';
ALTER TYPE "MembershipStatus" ADD VALUE IF NOT EXISTS 'PAID';

ALTER TABLE "Customer"
  ADD COLUMN "customerNo" TEXT,
  ADD COLUMN "customerPasswordHash" TEXT,
  ADD COLUMN "memberActivatedAt" TIMESTAMP(3),
  ADD COLUMN "customerLastLoginAt" TIMESTAMP(3),
  ADD COLUMN "contractedBy" TEXT,
  ADD COLUMN "contractedEmployeeNo" TEXT,
  ADD COLUMN "contractedDepartmentId" TEXT,
  ADD COLUMN "contractedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Customer_customerNo_key" ON "Customer"("customerNo");
CREATE INDEX "Customer_contractedEmployeeNo_idx" ON "Customer"("contractedEmployeeNo");

ALTER TABLE "Membership"
  ADD COLUMN "paidAmount" DECIMAL(12,2),
  ADD COLUMN "paymentConfirmedBy" TEXT,
  ADD COLUMN "contractedBy" TEXT,
  ADD COLUMN "contractedEmployeeNo" TEXT,
  ADD COLUMN "contractedDepartmentId" TEXT;
