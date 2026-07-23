-- Core business entities use recoverable soft deletion. AuditLog is intentionally
-- excluded because it is append-only.
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "Company" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "Project" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "Organization" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "OrganizationDocument" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "OrganizationRole" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "CSRProject" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "CorporateEnquiry" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "GovernmentPitch" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;
ALTER TABLE "ConvergenceProject" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedById" TEXT, ADD COLUMN "deleteReason" TEXT;

CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "Company_deletedAt_idx" ON "Company"("deletedAt");
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");
CREATE INDEX "Organization_deletedAt_idx" ON "Organization"("deletedAt");
CREATE INDEX "OrganizationDocument_deletedAt_idx" ON "OrganizationDocument"("deletedAt");
CREATE INDEX "OrganizationRole_deletedAt_idx" ON "OrganizationRole"("deletedAt");
CREATE INDEX "CSRProject_deletedAt_idx" ON "CSRProject"("deletedAt");
CREATE INDEX "CorporateEnquiry_deletedAt_idx" ON "CorporateEnquiry"("deletedAt");
CREATE INDEX "GovernmentPitch_deletedAt_idx" ON "GovernmentPitch"("deletedAt");
CREATE INDEX "ConvergenceProject_deletedAt_idx" ON "ConvergenceProject"("deletedAt");
