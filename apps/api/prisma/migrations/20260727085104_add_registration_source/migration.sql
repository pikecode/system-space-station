-- CreateEnum
CREATE TYPE "RegistrationSource" AS ENUM ('SELF', 'PARTNER', 'ADMIN');

-- DropIndex
DROP INDEX "Customer_referredBy_idx";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "registrationSource" "RegistrationSource" NOT NULL DEFAULT 'PARTNER';
