-- Add organization and historical commission snapshot fields.
ALTER TABLE "Department" ADD COLUMN "code" TEXT;
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

ALTER TABLE "CommissionRecord" ADD COLUMN "departmentId" TEXT;
UPDATE "CommissionRecord" AS record
SET "departmentId" = customer."departmentId"
FROM "Membership" AS membership
JOIN "Customer" AS customer ON customer."id" = membership."customerId"
WHERE record."membershipId" = membership."id";
CREATE INDEX "CommissionRecord_departmentId_idx" ON "CommissionRecord"("departmentId");
ALTER TABLE "CommissionRecord"
  ADD CONSTRAINT "CommissionRecord_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Financial invariants that must hold even when writes bypass the API.
ALTER TABLE "CommissionConfig"
  ADD CONSTRAINT "CommissionConfig_ratio_range_check"
  CHECK (
    "memberRatio" BETWEEN 0 AND 100
    AND "deptHeadRatio" BETWEEN 0 AND 100
    AND "marketHeadRatio" BETWEEN 0 AND 100
    AND "companyRatio" BETWEEN 0 AND 100
  ),
  ADD CONSTRAINT "CommissionConfig_ratio_sum_check"
  CHECK ("memberRatio" + "deptHeadRatio" + "marketHeadRatio" + "companyRatio" = 100),
  ADD CONSTRAINT "CommissionConfig_settlement_days_check"
  CHECK ("settlementDays" BETWEEN 1 AND 365);

ALTER TABLE "Membership"
  ADD CONSTRAINT "Membership_fee_positive_check" CHECK ("fee" > 0),
  ADD CONSTRAINT "Membership_date_range_check" CHECK ("endDate" > "startDate");

ALTER TABLE "CommissionRecord"
  ADD CONSTRAINT "CommissionRecord_entry_amount_check"
  CHECK (
    ("entryType" = 'EARNING' AND "amount" >= 0 AND "originalRecordId" IS NULL)
    OR ("entryType" = 'REVERSAL' AND "amount" <= 0 AND "originalRecordId" IS NOT NULL)
  );

CREATE UNIQUE INDEX "SettlementPeriod_single_open_key"
  ON "SettlementPeriod"("status") WHERE "status" = 'OPEN';

ALTER TABLE "SettlementPeriod"
  ADD CONSTRAINT "SettlementPeriod_date_range_check" CHECK ("endDate" > "startDate");

-- Append-only financial configuration and audit trail.
CREATE FUNCTION reject_immutable_row_change() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only; UPDATE and DELETE are forbidden', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CommissionConfig_immutable_trigger"
  BEFORE UPDATE OR DELETE ON "CommissionConfig"
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_row_change();

CREATE TRIGGER "AuditLog_immutable_trigger"
  BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION reject_immutable_row_change();
