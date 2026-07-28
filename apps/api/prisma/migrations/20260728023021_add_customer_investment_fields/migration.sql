-- CreateEnum
CREATE TYPE "RiskTolerance" AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'SPECULATIVE');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "idCard" TEXT,
ADD COLUMN     "investmentAmount" DECIMAL(12,2),
ADD COLUMN     "isAccreditedInvestor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legalPerson" TEXT,
ADD COLUMN     "registeredCapital" TEXT,
ADD COLUMN     "riskTolerance" "RiskTolerance";
