-- CreateEnum
CREATE TYPE "InvestmentProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CustomerInvestmentStatus" AS ENUM ('ACTIVE', 'EXITED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductYieldStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'SETTLED');

-- CreateEnum
CREATE TYPE "CustomerProfitStatus" AS ENUM ('GENERATED', 'SETTLED');

-- CreateEnum
CREATE TYPE "ProfitShareConfigStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProfitShareReceiverType" AS ENUM ('CUSTOMER', 'DEPARTMENT', 'CONTRACTED_USER', 'CREATED_USER', 'COMPANY');

-- CreateTable
CREATE TABLE "InvestmentProduct" (
    "id" TEXT NOT NULL,
    "productNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productType" TEXT,
    "riskLevel" "RiskTolerance",
    "minAmount" DECIMAL(12,2),
    "expectedStartAt" TIMESTAMP(3),
    "expectedEndAt" TIMESTAMP(3),
    "status" "InvestmentProductStatus" NOT NULL DEFAULT 'DRAFT',
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerInvestment" (
    "id" TEXT NOT NULL,
    "investmentNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "investedAt" TIMESTAMP(3) NOT NULL,
    "status" "CustomerInvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "contractedBy" TEXT,
    "contractedEmployeeNo" TEXT,
    "contractedDepartmentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdEmployeeNo" TEXT,
    "createdDepartmentId" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInvestment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductYieldPeriod" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalProfit" DECIMAL(12,2) NOT NULL,
    "status" "ProductYieldStatus" NOT NULL DEFAULT 'DRAFT',
    "confirmedBy" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductYieldPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfitRecord" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "yieldPeriodId" TEXT NOT NULL,
    "principalAmount" DECIMAL(12,2) NOT NULL,
    "investmentShareRatio" DECIMAL(12,8) NOT NULL,
    "profitAmount" DECIMAL(12,2) NOT NULL,
    "customerAmount" DECIMAL(12,2) NOT NULL,
    "ratioSnapshot" JSONB NOT NULL,
    "status" "CustomerProfitStatus" NOT NULL DEFAULT 'GENERATED',
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerProfitRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitShareConfig" (
    "id" TEXT NOT NULL,
    "customerRatio" DECIMAL(5,2) NOT NULL,
    "departmentRatio" DECIMAL(5,2) NOT NULL,
    "contractedUserRatio" DECIMAL(5,2) NOT NULL,
    "createdUserRatio" DECIMAL(5,2) NOT NULL,
    "companyRatio" DECIMAL(5,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "status" "ProfitShareConfigStatus" NOT NULL DEFAULT 'ACTIVE',
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfitShareConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfitShareRecord" (
    "id" TEXT NOT NULL,
    "profitRecordId" TEXT NOT NULL,
    "receiverType" "ProfitShareReceiverType" NOT NULL,
    "receiverId" TEXT,
    "receiverNo" TEXT,
    "ratio" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "CustomerProfitStatus" NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "ProfitShareRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentProduct_productNo_key" ON "InvestmentProduct"("productNo");
CREATE INDEX "InvestmentProduct_status_idx" ON "InvestmentProduct"("status");
CREATE INDEX "InvestmentProduct_productNo_idx" ON "InvestmentProduct"("productNo");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInvestment_investmentNo_key" ON "CustomerInvestment"("investmentNo");
CREATE INDEX "CustomerInvestment_customerId_idx" ON "CustomerInvestment"("customerId");
CREATE INDEX "CustomerInvestment_productId_status_idx" ON "CustomerInvestment"("productId", "status");
CREATE INDEX "CustomerInvestment_contractedEmployeeNo_idx" ON "CustomerInvestment"("contractedEmployeeNo");

-- CreateIndex
CREATE UNIQUE INDEX "ProductYieldPeriod_productId_periodStart_periodEnd_key" ON "ProductYieldPeriod"("productId", "periodStart", "periodEnd");
CREATE INDEX "ProductYieldPeriod_status_idx" ON "ProductYieldPeriod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfitRecord_investmentId_yieldPeriodId_key" ON "CustomerProfitRecord"("investmentId", "yieldPeriodId");
CREATE INDEX "CustomerProfitRecord_customerId_createdAt_idx" ON "CustomerProfitRecord"("customerId", "createdAt");
CREATE INDEX "CustomerProfitRecord_productId_idx" ON "CustomerProfitRecord"("productId");
CREATE INDEX "CustomerProfitRecord_status_idx" ON "CustomerProfitRecord"("status");

-- CreateIndex
CREATE INDEX "ProfitShareConfig_status_effectiveFrom_idx" ON "ProfitShareConfig"("status", "effectiveFrom");

-- CreateIndex
CREATE INDEX "ProfitShareRecord_profitRecordId_idx" ON "ProfitShareRecord"("profitRecordId");
CREATE INDEX "ProfitShareRecord_receiverType_receiverNo_idx" ON "ProfitShareRecord"("receiverType", "receiverNo");
CREATE INDEX "ProfitShareRecord_status_idx" ON "ProfitShareRecord"("status");

-- AddForeignKey
ALTER TABLE "CustomerInvestment" ADD CONSTRAINT "CustomerInvestment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerInvestment" ADD CONSTRAINT "CustomerInvestment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InvestmentProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductYieldPeriod" ADD CONSTRAINT "ProductYieldPeriod_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InvestmentProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerProfitRecord" ADD CONSTRAINT "CustomerProfitRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerProfitRecord" ADD CONSTRAINT "CustomerProfitRecord_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "CustomerInvestment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerProfitRecord" ADD CONSTRAINT "CustomerProfitRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "InvestmentProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerProfitRecord" ADD CONSTRAINT "CustomerProfitRecord_yieldPeriodId_fkey" FOREIGN KEY ("yieldPeriodId") REFERENCES "ProductYieldPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfitShareRecord" ADD CONSTRAINT "ProfitShareRecord_profitRecordId_fkey" FOREIGN KEY ("profitRecordId") REFERENCES "CustomerProfitRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
