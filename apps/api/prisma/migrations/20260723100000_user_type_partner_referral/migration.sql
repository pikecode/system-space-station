-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('EMPLOYEE', 'PARTNER');

-- AlterEnum
ALTER TYPE "CommissionRole" ADD VALUE 'REFERRAL';

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "userType"   "UserType" NOT NULL DEFAULT 'EMPLOYEE';
ALTER TABLE "User" ADD COLUMN "hasLicense" BOOLEAN   NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "licenseNo"  TEXT;
ALTER TABLE "User" ADD COLUMN "shareCode"  TEXT;
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- UniqueIndex shareCode
CREATE UNIQUE INDEX "User_shareCode_key" ON "User"("shareCode");

-- AlterTable Customer
ALTER TABLE "Customer" ADD COLUMN "referredBy" TEXT;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_referredBy_fkey"
  FOREIGN KEY ("referredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Customer_referredBy_idx" ON "Customer"("referredBy");

-- AlterTable CommissionConfig
ALTER TABLE "CommissionConfig" ADD COLUMN "referralRatio" DECIMAL(5,2) NOT NULL DEFAULT 30;
