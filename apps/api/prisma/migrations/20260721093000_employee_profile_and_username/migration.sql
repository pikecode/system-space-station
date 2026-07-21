-- Extend user accounts and employee profiles without exposing identity-card plaintext.
ALTER TABLE "User"
  ADD COLUMN "username" TEXT,
  ADD COLUMN "employeeNo" TEXT,
  ADD COLUMN "gender" "Gender",
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "alternatePhone" TEXT,
  ADD COLUMN "wechat" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "idCardEncrypted" TEXT,
  ADD COLUMN "idCardHash" TEXT,
  ADD COLUMN "idCardMasked" TEXT;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_employeeNo_key" ON "User"("employeeNo");
CREATE UNIQUE INDEX "User_idCardHash_key" ON "User"("idCardHash");

UPDATE "User" SET "username" = 'admin'
WHERE "phone" = '13800000000' AND "role" = 'ADMIN';

UPDATE "User"
SET "employeeNo" = CASE "phone"
  WHEN '13800000001' THEN 'MKT001'
  WHEN '13800000002' THEN 'DIV001'
  WHEN '13800000003' THEN 'EMP001'
END
WHERE "phone" IN ('13800000001', '13800000002', '13800000003');
