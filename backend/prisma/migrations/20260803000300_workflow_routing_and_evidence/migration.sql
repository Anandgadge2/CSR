-- Workflow routing, assessment conditions, and evidence persistence.
-- This is additive: existing submissions and projects remain unchanged.

ALTER TABLE "CorporateEnquiry"
  ADD COLUMN IF NOT EXISTS "firstContactedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "GovernmentPitch"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "FeasibilityAssessment"
  ADD COLUMN IF NOT EXISTS "targetDistricts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "targetDepartmentId" TEXT,
  ADD COLUMN IF NOT EXISTS "conditions" JSONB;

ALTER TABLE "ProjectMilestone"
  ADD COLUMN IF NOT EXISTS "completionCriteria" TEXT,
  ADD COLUMN IF NOT EXISTS "progressRemarks" TEXT,
  ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verifiedByUserId" TEXT;

ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "approvalSourceEnquiryId" TEXT,
  ADD COLUMN IF NOT EXISTS "approvalSourcePitchId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Project_approvalSourceEnquiryId_key" ON "Project"("approvalSourceEnquiryId");
CREATE UNIQUE INDEX IF NOT EXISTS "Project_approvalSourcePitchId_key" ON "Project"("approvalSourcePitchId");

CREATE TABLE IF NOT EXISTS "DistrictDncAssignment" (
  "id" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "dncUserId" TEXT NOT NULL,
  "assignedById" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DistrictDncAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DistrictDncAssignment_district_key" ON "DistrictDncAssignment"("district");
CREATE UNIQUE INDEX IF NOT EXISTS "DistrictDncAssignment_dncUserId_key" ON "DistrictDncAssignment"("dncUserId");
CREATE INDEX IF NOT EXISTS "DistrictDncAssignment_district_isActive_idx" ON "DistrictDncAssignment"("district", "isActive");
ALTER TABLE "DistrictDncAssignment"
  DROP CONSTRAINT IF EXISTS "DistrictDncAssignment_dncUserId_fkey",
  ADD CONSTRAINT "DistrictDncAssignment_dncUserId_fkey" FOREIGN KEY ("dncUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DistrictDncAssignment"
  DROP CONSTRAINT IF EXISTS "DistrictDncAssignment_assignedById_fkey",
  ADD CONSTRAINT "DistrictDncAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ProjectDistrictDncAssignment" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "dncUserId" TEXT NOT NULL,
  "assignedById" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectDistrictDncAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectDistrictDncAssignment_projectId_district_key" ON "ProjectDistrictDncAssignment"("projectId", "district");
CREATE INDEX IF NOT EXISTS "ProjectDistrictDncAssignment_dncUserId_status_idx" ON "ProjectDistrictDncAssignment"("dncUserId", "status");
ALTER TABLE "ProjectDistrictDncAssignment"
  DROP CONSTRAINT IF EXISTS "ProjectDistrictDncAssignment_projectId_fkey",
  ADD CONSTRAINT "ProjectDistrictDncAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ApplicationInteraction" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'PORTAL',
  "note" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationInteraction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ApplicationInteraction_entityType_entityId_occurredAt_idx" ON "ApplicationInteraction"("entityType", "entityId", "occurredAt");
CREATE INDEX IF NOT EXISTS "ApplicationInteraction_actorUserId_idx" ON "ApplicationInteraction"("actorUserId");

ALTER TABLE "AgencySubLogin"
  ADD COLUMN IF NOT EXISTS "agencyOrganizationId" TEXT,
  ADD COLUMN IF NOT EXISTS "userId" TEXT,
  ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "AgencySubLogin_userId_key" ON "AgencySubLogin"("userId");

ALTER TABLE "UserInvitation"
  ADD COLUMN IF NOT EXISTS "organizationId" TEXT,
  ADD COLUMN IF NOT EXISTS "parentUserId" TEXT,
  ADD COLUMN IF NOT EXISTS "agencySubLoginId" TEXT;
