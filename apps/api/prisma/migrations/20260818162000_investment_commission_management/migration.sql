-- CreateEnum
CREATE TYPE "InvestmentCommissionConfigStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InvestmentCommissionStatus" AS ENUM ('GENERATED', 'SETTLED');

-- CreateEnum
CREATE TYPE "InvestmentCommissionReceiverType" AS ENUM ('CONTRACTED_DEPARTMENT', 'CONTRACTED_USER', 'COMPANY');

-- CreateTable
CREATE TABLE "InvestmentCommissionConfig" (
    "id" TEXT NOT NULL,
    "contractedDepartmentRatio" DECIMAL(5,2) NOT NULL,
    "contractedUserRatio" DECIMAL(5,2) NOT NULL,
    "companyRatio" DECIMAL(5,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "status" "InvestmentCommissionConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentCommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentCommissionRecord" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "receiverType" "InvestmentCommissionReceiverType" NOT NULL,
    "receiverId" TEXT,
    "receiverNo" TEXT,
    "baseAmount" DECIMAL(12,2) NOT NULL,
    "ratio" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "configSnapshot" JSONB NOT NULL,
    "status" "InvestmentCommissionStatus" NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "InvestmentCommissionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvestmentCommissionConfig_status_effectiveFrom_idx" ON "InvestmentCommissionConfig"("status", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCommissionRecord_investmentId_receiverType_key" ON "InvestmentCommissionRecord"("investmentId", "receiverType");
CREATE INDEX "InvestmentCommissionRecord_investmentId_idx" ON "InvestmentCommissionRecord"("investmentId");
CREATE INDEX "InvestmentCommissionRecord_receiverType_receiverNo_idx" ON "InvestmentCommissionRecord"("receiverType", "receiverNo");
CREATE INDEX "InvestmentCommissionRecord_status_idx" ON "InvestmentCommissionRecord"("status");

-- AddForeignKey
ALTER TABLE "InvestmentCommissionRecord" ADD CONSTRAINT "InvestmentCommissionRecord_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "CustomerInvestment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
