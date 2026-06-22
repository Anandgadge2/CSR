-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'HIDDEN', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "OrganizationKind" AS ENUM ('NGO', 'CSR_COMPANY', 'GOVERNMENT_DEPARTMENT', 'PORTAL_ADMIN_ORG');

-- CreateEnum
CREATE TYPE "OrganizationOnboardingStatus" AS ENUM ('REGISTERED', 'PROFILE_INCOMPLETE', 'DOCUMENTS_PENDING', 'SUBMITTED_FOR_REVIEW', 'UNDER_VERIFICATION', 'CLARIFICATION_REQUIRED', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'HIDDEN', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('GLOBAL', 'TENANT', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'NEEDS_CORRECTION');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MASTER_ADMIN';

-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "AssetHandover" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorRole" TEXT,
ADD COLUMN     "actorUserId" TEXT,
ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "newValueJson" JSONB,
ADD COLUMN     "oldValueJson" JSONB,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "BeneficiaryProfile" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CSRFundMilestone" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CSRFundRelease" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CSRProject" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CSRRequirement" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CSRRequirementDocument" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CompanyInterest" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "CompletionReport" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ImpactMetric" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ImpactReport" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "NGO" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "NGOApplication" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ProgressReport" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ProjectInspection" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "isSystemSeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "UtilizationCertificate" ADD COLUMN     "tenantId" TEXT;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "domain" TEXT,
    "logo" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantFeature" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "configJson" JSONB,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationType" "OrganizationKind" NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "pan" TEXT,
    "gst" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "district" TEXT,
    "taluka" TEXT,
    "onboardingStatus" "OrganizationOnboardingStatus" NOT NULL DEFAULT 'REGISTERED',
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "clarificationRemarks" TEXT,
    "sourceNgoId" TEXT,
    "sourceCompanyId" TEXT,
    "sourceBeneficiaryProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'UPLOADED',
    "remarks" TEXT,
    "uploadedBy" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "RoleScope" NOT NULL,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "OrganizationRolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserOrganizationRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "organizationId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "Tenant_state_idx" ON "Tenant"("state");

-- CreateIndex
CREATE INDEX "TenantFeature_featureKey_idx" ON "TenantFeature"("featureKey");

-- CreateIndex
CREATE UNIQUE INDEX "TenantFeature_tenantId_featureKey_key" ON "TenantFeature"("tenantId", "featureKey");

-- CreateIndex
CREATE INDEX "Organization_tenantId_idx" ON "Organization"("tenantId");

-- CreateIndex
CREATE INDEX "Organization_organizationType_idx" ON "Organization"("organizationType");

-- CreateIndex
CREATE INDEX "Organization_onboardingStatus_idx" ON "Organization"("onboardingStatus");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "OrganizationDocument_tenantId_idx" ON "OrganizationDocument"("tenantId");

-- CreateIndex
CREATE INDEX "OrganizationDocument_organizationId_idx" ON "OrganizationDocument"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationDocument_verificationStatus_idx" ON "OrganizationDocument"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "OrganizationRole_tenantId_idx" ON "OrganizationRole"("tenantId");

-- CreateIndex
CREATE INDEX "OrganizationRole_organizationId_idx" ON "OrganizationRole"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationRole_scope_idx" ON "OrganizationRole"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_tenantId_organizationId_name_key" ON "OrganizationRole"("tenantId", "organizationId", "name");

-- CreateIndex
CREATE INDEX "UserOrganizationRole_tenantId_idx" ON "UserOrganizationRole"("tenantId");

-- CreateIndex
CREATE INDEX "UserOrganizationRole_organizationId_idx" ON "UserOrganizationRole"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOrganizationRole_userId_roleId_organizationId_key" ON "UserOrganizationRole"("userId", "roleId", "organizationId");

-- CreateIndex
CREATE INDEX "Agreement_tenantId_idx" ON "Agreement"("tenantId");

-- CreateIndex
CREATE INDEX "AssetHandover_tenantId_idx" ON "AssetHandover"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_tenantId_idx" ON "BeneficiaryProfile"("tenantId");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_organizationId_idx" ON "BeneficiaryProfile"("organizationId");

-- CreateIndex
CREATE INDEX "CSRFundMilestone_tenantId_idx" ON "CSRFundMilestone"("tenantId");

-- CreateIndex
CREATE INDEX "CSRFundRelease_tenantId_idx" ON "CSRFundRelease"("tenantId");

-- CreateIndex
CREATE INDEX "CSRProject_tenantId_idx" ON "CSRProject"("tenantId");

-- CreateIndex
CREATE INDEX "CSRRequirement_tenantId_idx" ON "CSRRequirement"("tenantId");

-- CreateIndex
CREATE INDEX "CSRRequirementDocument_tenantId_idx" ON "CSRRequirementDocument"("tenantId");

-- CreateIndex
CREATE INDEX "Chat_tenantId_idx" ON "Chat"("tenantId");

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE INDEX "Company_organizationId_idx" ON "Company"("organizationId");

-- CreateIndex
CREATE INDEX "CompanyInterest_tenantId_idx" ON "CompanyInterest"("tenantId");

-- CreateIndex
CREATE INDEX "CompletionReport_tenantId_idx" ON "CompletionReport"("tenantId");

-- CreateIndex
CREATE INDEX "Document_tenantId_idx" ON "Document"("tenantId");

-- CreateIndex
CREATE INDEX "Document_organizationId_idx" ON "Document"("organizationId");

-- CreateIndex
CREATE INDEX "ImpactMetric_tenantId_idx" ON "ImpactMetric"("tenantId");

-- CreateIndex
CREATE INDEX "ImpactReport_tenantId_idx" ON "ImpactReport"("tenantId");

-- CreateIndex
CREATE INDEX "Message_tenantId_idx" ON "Message"("tenantId");

-- CreateIndex
CREATE INDEX "Milestone_tenantId_idx" ON "Milestone"("tenantId");

-- CreateIndex
CREATE INDEX "NGO_tenantId_idx" ON "NGO"("tenantId");

-- CreateIndex
CREATE INDEX "NGO_organizationId_idx" ON "NGO"("organizationId");

-- CreateIndex
CREATE INDEX "NGOApplication_tenantId_idx" ON "NGOApplication"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "ProgressReport_tenantId_idx" ON "ProgressReport"("tenantId");

-- CreateIndex
CREATE INDEX "Project_tenantId_idx" ON "Project"("tenantId");

-- CreateIndex
CREATE INDEX "ProjectInspection_tenantId_idx" ON "ProjectInspection"("tenantId");

-- CreateIndex
CREATE INDEX "Report_tenantId_idx" ON "Report"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "UtilizationCertificate_tenantId_idx" ON "UtilizationCertificate"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantFeature" ADD CONSTRAINT "TenantFeature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationDocument" ADD CONSTRAINT "OrganizationDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRolePermission" ADD CONSTRAINT "OrganizationRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRolePermission" ADD CONSTRAINT "OrganizationRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganizationRole" ADD CONSTRAINT "UserOrganizationRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganizationRole" ADD CONSTRAINT "UserOrganizationRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganizationRole" ADD CONSTRAINT "UserOrganizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
