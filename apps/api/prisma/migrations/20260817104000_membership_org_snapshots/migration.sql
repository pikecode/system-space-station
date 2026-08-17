ALTER TABLE "Membership"
  ADD COLUMN "submittedDepartmentId" TEXT,
  ADD COLUMN "submittedAssignedTo" TEXT,
  ADD COLUMN "approvedDepartmentId" TEXT,
  ADD COLUMN "approvedAssignedTo" TEXT;

CREATE INDEX "Membership_submittedDepartmentId_idx" ON "Membership"("submittedDepartmentId");
CREATE INDEX "Membership_approvedDepartmentId_idx" ON "Membership"("approvedDepartmentId");
