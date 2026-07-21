-- AlterTable: replace address with province/city/district/addressDetail on User
ALTER TABLE "User" ADD COLUMN "province" TEXT;
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "district" TEXT;
ALTER TABLE "User" ADD COLUMN "addressDetail" TEXT;
ALTER TABLE "User" DROP COLUMN IF EXISTS "address";
