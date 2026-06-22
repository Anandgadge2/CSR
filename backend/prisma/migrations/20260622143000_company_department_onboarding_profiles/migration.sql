-- Add detailed CSR company and government department onboarding profile support.

ALTER TYPE "DocumentVerificationStatus" ADD VALUE IF NOT EXISTS 'CLARIFICATION_REQUIRED';

DO $$ BEGIN
  CREATE TYPE "OnboardingReviewAction" AS ENUM ('APPROVED', 'REJECTED', 'CLARIFICATION_REQUIRED', 'SUSPENDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "legalName" TEXT,
  ADD COLUMN IF NOT EXISTS "displayName" TEXT,
  ADD COLUMN IF NOT EXISTS "cin" TEXT,
  ADD COLUMN IF NOT EXISTS "llpin" TEXT,
  ADD COLUMN IF NOT EXISTS "gstin" TEXT,
  ADD COLUMN IF NOT EXISTS "departmentCode" TEXT,
  ADD COLUMN IF NOT EXISTS "parentDepartment" TEXT,
  ADD COLUMN IF NOT EXISTS "officialEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "officialPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "website" TEXT,
  ADD COLUMN IF NOT EXISTS "stateId" TEXT,
  ADD COLUMN IF NOT EXISTS "districtId" TEXT,
  ADD COLUMN IF NOT EXISTS "talukaId" TEXT,
  ADD COLUMN IF NOT EXISTS "villageId" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'UPLOADED';

ALTER TABLE "OrganizationDocument"
  ADD COLUMN IF NOT EXISTS "fileName" TEXT,
  ADD COLUMN IF NOT EXISTS "mimeType" TEXT,
  ADD COLUMN IF NOT EXISTS "fileSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "CSRCompanyProfile" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "companyType" TEXT,
  "yearOfIncorporation" INTEGER,
  "mcaVerificationStatus" TEXT,
  "companyStatus" TEXT,
  "registeredOfficeAddress" TEXT,
  "corporateOfficeAddress" TEXT,
  "officialEmailDomain" TEXT,
  "csrApplicable" BOOLEAN NOT NULL DEFAULT false,
  "financialYear" TEXT,
  "netWorth" DECIMAL(65,30),
  "turnover" DECIMAL(65,30),
  "netProfit" DECIMAL(65,30),
  "averageNetProfit" DECIMAL(65,30),
  "csrObligationAmount" DECIMAL(65,30),
  "twoPercentCsrObligation" DECIMAL(65,30),
  "currentYearCsrBudget" DECIMAL(65,30),
  "unspentCsrAmount" DECIMAL(65,30),
  "ongoingProjectAmount" DECIMAL(65,30),
  "csrCommitteeApplicable" BOOLEAN NOT NULL DEFAULT false,
  "csrCommitteeDetails" JSONB,
  "csrCommitteeConstitutionDate" TIMESTAMP(3),
  "csrPolicyApprovalDate" TIMESTAMP(3),
  "boardApprovalStatus" TEXT,
  "csrHeadName" TEXT,
  "csrHeadDesignation" TEXT,
  "csrHeadEmail" TEXT,
  "csrHeadMobile" TEXT,
  "financeOfficerName" TEXT,
  "financeOfficerDesignation" TEXT,
  "financeOfficerEmail" TEXT,
  "authorizedSignatoryName" TEXT,
  "authorizedSignatoryDesignation" TEXT,
  "authorizedSignatoryEmail" TEXT,
  "authorizedSignatoryMobile" TEXT,
  "authorizationReferenceNumber" TEXT,
  "csrPolicyDocumentId" TEXT,
  "boardResolutionDocumentId" TEXT,
  "preferredDistricts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "preferredTalukas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "preferredSectors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "preferredProjectSize" TEXT,
  "preferredBeneficiaryGroups" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "scheduleVIIFocusAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "sdgFocusAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "esgFocusAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "minFundingAmount" DECIMAL(65,30),
  "maxFundingAmount" DECIMAL(65,30),
  "fundingPreference" TEXT,
  "implementationPreference" TEXT,
  "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
  "declarationAcceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CSRCompanyProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GovernmentDepartmentProfile" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "departmentType" TEXT,
  "parentDepartment" TEXT,
  "departmentCode" TEXT,
  "villageOrCity" TEXT,
  "officeWebsite" TEXT,
  "officialEmailDomain" TEXT,
  "officePhone" TEXT,
  "governmentOfficeIdentifier" TEXT,
  "nodalOfficerName" TEXT,
  "nodalOfficerDesignation" TEXT,
  "nodalOfficerDepartment" TEXT,
  "nodalOfficerEmail" TEXT,
  "nodalOfficerMobile" TEXT,
  "nodalOfficerOfficePhone" TEXT,
  "nodalOfficerEmployeeId" TEXT,
  "reportingOfficerName" TEXT,
  "reportingOfficerDesignation" TEXT,
  "reportingOfficerEmail" TEXT,
  "authorizationLetterNumber" TEXT,
  "authorizationLetterDate" TIMESTAMP(3),
  "issuingAuthorityName" TEXT,
  "issuingAuthorityDesignation" TEXT,
  "canCreateRequirements" BOOLEAN NOT NULL DEFAULT false,
  "canConfirmHandover" BOOLEAN NOT NULL DEFAULT false,
  "canUploadOfficialDocuments" BOOLEAN NOT NULL DEFAULT false,
  "departmentApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
  "internalApprovalReference" TEXT,
  "jurisdictionType" TEXT,
  "allowedDistrictIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "allowedTalukaIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "allowedVillageIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "allowedSectors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "canCreateStateLevelRequirement" BOOLEAN NOT NULL DEFAULT false,
  "canCreateDistrictLevelRequirement" BOOLEAN NOT NULL DEFAULT false,
  "canCreateLocalBodyLevelRequirement" BOOLEAN NOT NULL DEFAULT false,
  "requiresDistrictVerification" BOOLEAN NOT NULL DEFAULT false,
  "requirementPermissionSectors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
  "declarationAcceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GovernmentDepartmentProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OnboardingReview" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "reviewedBy" TEXT,
  "reviewAction" "OnboardingReviewAction" NOT NULL,
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OnboardingReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CSRCompanyProfile_organizationId_key" ON "CSRCompanyProfile"("organizationId");
CREATE INDEX IF NOT EXISTS "CSRCompanyProfile_tenantId_idx" ON "CSRCompanyProfile"("tenantId");

CREATE UNIQUE INDEX IF NOT EXISTS "GovernmentDepartmentProfile_organizationId_key" ON "GovernmentDepartmentProfile"("organizationId");
CREATE INDEX IF NOT EXISTS "GovernmentDepartmentProfile_tenantId_idx" ON "GovernmentDepartmentProfile"("tenantId");

CREATE INDEX IF NOT EXISTS "OnboardingReview_tenantId_idx" ON "OnboardingReview"("tenantId");
CREATE INDEX IF NOT EXISTS "OnboardingReview_organizationId_idx" ON "OnboardingReview"("organizationId");
CREATE INDEX IF NOT EXISTS "OnboardingReview_reviewAction_idx" ON "OnboardingReview"("reviewAction");

DO $$ BEGIN
  ALTER TABLE "CSRCompanyProfile" ADD CONSTRAINT "CSRCompanyProfile_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "GovernmentDepartmentProfile" ADD CONSTRAINT "GovernmentDepartmentProfile_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "OnboardingReview" ADD CONSTRAINT "OnboardingReview_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
