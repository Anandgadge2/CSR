-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER_ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN', 'BENEFICIARY_AGENCY', 'COMPANY_ADMIN', 'COMPANY_MEMBER', 'NGO_ADMIN', 'NGO_MEMBER', 'PORTAL_ADMIN', 'CSR_ADMIN', 'ANALYST_REVIEWER', 'COMPLIANCE_REVIEWER', 'FINANCE_USER', 'APPROVER', 'AUDITOR', 'AUTHORIZED_SIGNATORY', 'CSR_RELATIONSHIP_MANAGER', 'JOINT_SECRETARY', 'PLANNING_SECRETARY', 'DISTRICT_NODAL_OFFICER', 'STATE_CSR_CELL', 'CORPORATE_USER', 'IMPLEMENTING_AGENCY_USER', 'GOVERNMENT_OFFICER');

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
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'NEEDS_CORRECTION', 'CLARIFICATION_REQUIRED');

-- CreateEnum
CREATE TYPE "OnboardingReviewAction" AS ENUM ('APPROVED', 'REJECTED', 'CLARIFICATION_REQUIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('TRUST', 'SOCIETY', 'SECTION_8_COMPANY', 'GOVERNMENT_ENTITY', 'OTHER');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'AUTO_CHECK_PENDING', 'AUTO_CHECK_PASSED', 'AUTO_CHECK_FAILED', 'UNDER_ANALYST_REVIEW', 'QUERY_RAISED', 'RESUBMITTED', 'UNDER_COMPLIANCE_REVIEW', 'APPROVAL_PENDING', 'APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED', 'SUSPENDED', 'EXPIRED', 'REVERIFICATION_DUE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('REGISTRATION_CERTIFICATE', 'TRUST_DEED', 'MOA', 'AOA', 'SOCIETY_RULES', 'PAN_CARD', 'CSR1_CERTIFICATE', 'CERTIFICATE_12A', 'CERTIFICATE_80G', 'CANCELLED_CHEQUE', 'BANK_STATEMENT', 'BANK_VERIFICATION_LETTER', 'AUTHORIZED_SIGNATORY_PROOF', 'BOARD_RESOLUTION', 'AUTHORITY_LETTER', 'TRUSTEE_LIST', 'AUDITED_FINANCIAL_STATEMENT', 'ANNUAL_REPORT', 'DECLARATION_FORM', 'CONSENT_FORM', 'GST_CERTIFICATE', 'FCRA_CERTIFICATE', 'FCRA_PRIOR_PERMISSION', 'FC4_RETURN', 'FCRA_BANK_PROOF', 'ITR7_ACKNOWLEDGEMENT', 'FORM_10B', 'FORM_10BB', 'PROJECT_COMPLETION_CERTIFICATE', 'DONOR_REFERENCE_LETTER', 'LITIGATION_DOCUMENT', 'POWER_OF_ATTORNEY', 'NGO_DARPAN_CERTIFICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING_UPLOAD', 'UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'NEEDS_CORRECTION');

-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('OPEN', 'RESPONDED', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "FundReleaseStatus" AS ENUM ('PENDING', 'APPROVED', 'RELEASED', 'REJECTED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "CorporateEnquiryStatus" AS ENUM ('SUBMITTED', 'TRACKING_ID_GENERATED', 'RM_ASSIGNED', 'RM_CONTACTED', 'ASSESSMENT_PENDING', 'ASSESSMENT_SUBMITTED_TO_JS', 'JS_APPROVED', 'JS_REJECTED', 'NODAL_OFFICER_APPOINTED', 'MOU_PENDING', 'MOU_SIGNED', 'PROJECT_ONBOARDED', 'EXECUTION_STARTED', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "GovernmentPitchStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RM_VERIFICATION_PENDING', 'RM_VERIFIED', 'JS_APPROVAL_PENDING', 'JS_APPROVED', 'JS_REJECTED', 'PUBLIC_LISTED', 'CORPORATE_INTEREST_RECEIVED', 'NODAL_OFFICER_ASSIGNED', 'MOU_PENDING', 'MOU_SIGNED', 'PROJECT_ONBOARDED', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FeasibilityResult" AS ENUM ('FEASIBLE', 'PROCEED_WITH_CONDITIONS', 'NOT_FEASIBLE');

-- CreateEnum
CREATE TYPE "ChecklistAnswer" AS ENUM ('YES', 'NO', 'NA');

-- CreateEnum
CREATE TYPE "SLAStage" AS ENUM ('RM_RESPONSE', 'JS_DECISION', 'SECRETARY_ESCALATION', 'GOVERNMENT_PITCH_VERIFICATION', 'GRIEVANCE_LEVEL_1', 'GRIEVANCE_LEVEL_2', 'STATIC_HELPDESK');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('RAISED', 'ACKNOWLEDGED', 'LEVEL_1_REVIEW', 'LEVEL_1_RESOLVED', 'ESCALATED_TO_STATE_CELL', 'LEVEL_2_RESOLVED', 'ESCALATED_TO_JS_SECRETARY', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SimpleMilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FUNDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'APPROVED_BY_NGO', 'APPROVED_BY_COMPANY', 'RELEASED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('CSR', 'IMPACT', 'BENEFICIARY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "CSRCategory" AS ENUM ('EDUCATION', 'HEALTH', 'WATER', 'SANITATION', 'SKILL_DEVELOPMENT', 'ENVIRONMENT', 'WOMEN_EMPOWERMENT', 'AGRICULTURE', 'ANIMAL_HUSBANDRY', 'RURAL_DEVELOPMENT', 'SPORTS', 'OTHER');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CSRRequirementStatus" AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'CLARIFICATION_REQUIRED', 'FIELD_VERIFICATION_REQUIRED', 'VERIFIED', 'MARKETPLACE_LISTED', 'NGO_APPLICATIONS_OPEN', 'COMPANY_INTEREST_RECEIVED', 'NGO_SELECTED', 'AGREEMENT_PENDING', 'AGREEMENT_SIGNED', 'EXECUTION_STARTED', 'IN_PROGRESS', 'COMPLETION_SUBMITTED', 'COMPLETED', 'IMPACT_REPORT_GENERATED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NGOEmpanelmentStatus" AS ENUM ('PROFILE_INCOMPLETE', 'PROFILE_SUBMITTED', 'DOCUMENT_REVIEW', 'FIELD_VERIFICATION', 'EMPANELLED', 'EMPANELMENT_REJECTED', 'SUSPENDED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "NGOApplicationStatus" AS ENUM ('NGO_APPLIED', 'SHORTLISTED', 'APPLICATION_REJECTED', 'SELECTED_BY_COMPANY', 'AGREEMENT_PENDING', 'AGREEMENT_SIGNED', 'EXECUTION_STARTED', 'COMPLETED', 'NOT_SELECTED');

-- CreateEnum
CREATE TYPE "CompanyInterestStatus" AS ENUM ('INTEREST_SUBMITTED', 'UNDER_DISCUSSION', 'FUNDING_APPROVED', 'WITHDRAWN', 'NGO_SELECTED', 'CI_AGREEMENT_PENDING', 'CI_AGREEMENT_SIGNED', 'FUND_RELEASED', 'CI_PROJECT_IN_PROGRESS', 'CI_COMPLETED');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT_GENERATED', 'SENT_FOR_REVIEW', 'APPROVED_BY_GOVERNMENT', 'APPROVED_BY_COMPANY', 'APPROVED_BY_NGO', 'SIGNED', 'AGR_REJECTED', 'REVISION_REQUIRED');

-- CreateEnum
CREATE TYPE "CSRFundMilestoneStatus" AS ENUM ('FM_PENDING', 'RELEASE_REQUESTED', 'FM_RELEASED', 'UTILIZATION_SUBMITTED', 'FM_VERIFIED', 'FM_REJECTED');

-- CreateEnum
CREATE TYPE "ProgressReportStatus" AS ENUM ('PR_SUBMITTED', 'PR_VERIFIED', 'PR_REJECTED', 'PR_REVISION_REQUIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'NGO_MEMBER',
    "accountStatus" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isSystemSeeded" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ngoId" TEXT,
    "companyId" TEXT,
    "assignedDistrict" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NGO" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "darpanNumber" TEXT,
    "csr1Number" TEXT,
    "pan" TEXT NOT NULL,
    "certificate12AUrl" TEXT,
    "certificate80GUrl" TEXT,
    "fcraDetails" TEXT,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Maharashtra',
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "village" TEXT,
    "website" TEXT,
    "socialLinks" JSONB,
    "impactStatistics" JSONB,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "empanelmentStatus" "NGOEmpanelmentStatus" NOT NULL DEFAULT 'PROFILE_INCOMPLETE',
    "empanelmentRemarks" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "areasOfOperation" TEXT[],
    "city" TEXT,
    "csrSectors" TEXT[],
    "displayName" TEXT,
    "officialEmail" TEXT,
    "officialPhone" TEXT,
    "organizationType" "OrganizationType",
    "pincode" TEXT,
    "registrationAuthority" TEXT,
    "registrationDate" TIMESTAMP(3),
    "yearEstablished" INTEGER,

    CONSTRAINT "NGO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "cin" TEXT NOT NULL,
    "gst" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "csrBudget" DECIMAL(65,30) NOT NULL,
    "csrRegistrationNo" TEXT,
    "csrPolicyUrl" TEXT,
    "registeredAddress" TEXT,
    "csrHeadName" TEXT,
    "csrHeadEmail" TEXT,
    "csrHeadMobile" TEXT,
    "annualCsrBudget" DECIMAL(65,30),
    "preferredDistricts" TEXT[],
    "preferredBudgetMin" DECIMAL(65,30),
    "preferredBudgetMax" DECIMAL(65,30),
    "pastCsrWork" TEXT,
    "companyLogoUrl" TEXT,
    "focusAreas" TEXT[],
    "contactInfo" JSONB NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "ngoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "focusArea" TEXT NOT NULL,
    "sdgGoal" TEXT NOT NULL,
    "beneficiaryCount" INTEGER NOT NULL,
    "budgetRequested" DECIMAL(65,30) NOT NULL,
    "budgetFunded" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL DEFAULT 'Maharashtra',
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "village" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "completionEvidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "projectId" TEXT,
    "ngoId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "readBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "ngoId" TEXT,
    "companyId" TEXT,
    "projectId" TEXT,
    "chatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "factors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "content" JSONB NOT NULL,
    "fileUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "ngoId" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "actorUserId" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" JSONB NOT NULL,
    "oldValueJson" JSONB,
    "newValueJson" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingApplication" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT,
    "organizationType" "OrganizationType" NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "registrationAuthority" TEXT NOT NULL,
    "stateOfRegistration" TEXT NOT NULL,
    "panNumber" TEXT NOT NULL,
    "ngoDarpanId" TEXT,
    "csr1RegistrationNumber" TEXT,
    "yearEstablished" INTEGER NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "officialPhone" TEXT NOT NULL,
    "website" TEXT,
    "headOfficeAddress" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "areasOfOperation" TEXT[],
    "csrSectors" TEXT[],
    "csr1Status" BOOLEAN NOT NULL DEFAULT false,
    "has12A" BOOLEAN NOT NULL DEFAULT false,
    "has80G" BOOLEAN NOT NULL DEFAULT false,
    "gstRegistered" BOOLEAN NOT NULL DEFAULT false,
    "gstin" TEXT,
    "fcraStatus" TEXT,
    "fcraRegistrationNumber" TEXT,
    "founderDetails" JSONB,
    "trusteesDirectors" JSONB,
    "authorizedSignatory" JSONB,
    "bankAccountHolder" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "bankAccountNumber" TEXT,
    "ifscCode" TEXT,
    "accountType" TEXT,
    "auditorName" TEXT,
    "auditorFirm" TEXT,
    "auditorContact" TEXT,
    "annualTurnover" JSONB,
    "yearsOfOperation" INTEGER,
    "previousProjects" JSONB,
    "beneficiaryCountLastFY" INTEGER,
    "staffCount" INTEGER,
    "volunteerCount" INTEGER,
    "blacklistDeclaration" BOOLEAN NOT NULL DEFAULT false,
    "litigationDeclaration" BOOLEAN NOT NULL DEFAULT false,
    "conflictOfInterest" BOOLEAN NOT NULL DEFAULT false,
    "relatedPartyDeclaration" BOOLEAN NOT NULL DEFAULT false,
    "dataPrivacyConsent" BOOLEAN NOT NULL DEFAULT false,
    "verificationConsent" BOOLEAN NOT NULL DEFAULT false,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
    "completenessPercentage" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "assignedReviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingStatusHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" "OnboardingStatus",
    "toStatus" "OnboardingStatus" NOT NULL,
    "changedById" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingQuery" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "queryText" TEXT NOT NULL,
    "documentType" "DocumentType",
    "fieldName" TEXT,
    "status" "QueryStatus" NOT NULL DEFAULT 'OPEN',
    "priority" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryResponse" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "respondedById" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "attachmentUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueryResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCheck" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "checkStatus" TEXT NOT NULL,
    "checkResult" JSONB,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationCheck_pkey" PRIMARY KEY ("id")
);

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
    "legalName" TEXT,
    "displayName" TEXT,
    "registrationNumber" TEXT,
    "cin" TEXT,
    "llpin" TEXT,
    "pan" TEXT,
    "gst" TEXT,
    "gstin" TEXT,
    "departmentCode" TEXT,
    "parentDepartment" TEXT,
    "email" TEXT,
    "officialEmail" TEXT,
    "phone" TEXT,
    "officialPhone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "stateId" TEXT,
    "districtId" TEXT,
    "talukaId" TEXT,
    "villageId" TEXT,
    "district" TEXT,
    "taluka" TEXT,
    "onboardingStatus" "OrganizationOnboardingStatus" NOT NULL DEFAULT 'REGISTERED',
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'UPLOADED',
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
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'UPLOADED',
    "remarks" TEXT,
    "uploadedBy" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRCompanyProfile" (
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
    "preferredDistricts" TEXT[],
    "preferredTalukas" TEXT[],
    "preferredSectors" TEXT[],
    "preferredProjectSize" TEXT,
    "preferredBeneficiaryGroups" TEXT[],
    "scheduleVIIFocusAreas" TEXT[],
    "sdgFocusAreas" TEXT[],
    "esgFocusAreas" TEXT[],
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

-- CreateTable
CREATE TABLE "GovernmentDepartmentProfile" (
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
    "allowedDistrictIds" TEXT[],
    "allowedTalukaIds" TEXT[],
    "allowedVillageIds" TEXT[],
    "allowedSectors" TEXT[],
    "canCreateStateLevelRequirement" BOOLEAN NOT NULL DEFAULT false,
    "canCreateDistrictLevelRequirement" BOOLEAN NOT NULL DEFAULT false,
    "canCreateLocalBodyLevelRequirement" BOOLEAN NOT NULL DEFAULT false,
    "requiresDistrictVerification" BOOLEAN NOT NULL DEFAULT false,
    "requirementPermissionSectors" TEXT[],
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentDepartmentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingReview" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewAction" "OnboardingReviewAction" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingReview_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "NgoDocument" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileHash" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "expiryDate" TIMESTAMP(3),
    "issueDate" TIMESTAMP(3),
    "issuingAuthority" TEXT,
    "documentNumber" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "rejectionReason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentDocumentId" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NgoDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NgoContact" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "contactType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "mobile" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NgoContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceMember" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "memberType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "panNumber" TEXT,
    "aadhaarMasked" TEXT,
    "tenureStartDate" TIMESTAMP(3),
    "tenureEndDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "idProofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationMethod" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "cancelledChequeUrl" TEXT,
    "bankStatementUrl" TEXT,
    "verificationNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskScore" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "legalRegistrationScore" INTEGER NOT NULL DEFAULT 0,
    "identitySignatoryScore" INTEGER NOT NULL DEFAULT 0,
    "financialScore" INTEGER NOT NULL DEFAULT 0,
    "complianceScore" INTEGER NOT NULL DEFAULT 0,
    "governanceScore" INTEGER NOT NULL DEFAULT 0,
    "documentQualityScore" INTEGER NOT NULL DEFAULT 0,
    "paymentBankScore" INTEGER NOT NULL DEFAULT 0,
    "scoreBreakdown" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedById" TEXT,

    CONSTRAINT "RiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskFlag" (
    "id" TEXT NOT NULL,
    "riskScoreId" TEXT NOT NULL,
    "flagType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "ngoId" TEXT,
    "companyId" TEXT,
    "projectId" TEXT,
    "bankAccountId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "purpose" TEXT NOT NULL,
    "description" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "gatewayName" TEXT,
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "paymentOrderId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "gatewayTransactionId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL,
    "paymentMethod" TEXT,
    "paymentDetails" JSONB,
    "utrNumber" TEXT,
    "failureReason" TEXT,
    "failureCode" TEXT,
    "processedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentWebhookLog" (
    "id" TEXT NOT NULL,
    "paymentOrderId" TEXT,
    "gatewayName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "webhookPayload" JSONB NOT NULL,
    "webhookSignature" TEXT,
    "isSignatureValid" BOOLEAN,
    "processedAt" TIMESTAMP(3),
    "processingStatus" TEXT,
    "processingError" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundRelease" (
    "id" TEXT NOT NULL,
    "paymentOrderId" TEXT NOT NULL,
    "ngoId" TEXT,
    "projectId" TEXT,
    "milestoneId" TEXT,
    "bankAccountId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "FundReleaseStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeneficiaryProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "organizationId" TEXT,
    "userId" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "agencyType" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "village" TEXT,
    "city" TEXT,
    "address" TEXT NOT NULL,
    "pincode" TEXT,
    "contactPerson" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "designation" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiaryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRRequirement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "beneficiaryProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "CSRCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "village" TEXT,
    "city" TEXT,
    "address" TEXT,
    "geoLatitude" DOUBLE PRECISION,
    "geoLongitude" DOUBLE PRECISION,
    "estimatedCost" DECIMAL(65,30) NOT NULL,
    "beneficiaryCount" INTEGER NOT NULL,
    "expectedImpact" TEXT NOT NULL,
    "priorityLevel" "PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "completionTimeline" TEXT,
    "contactPersonName" TEXT,
    "contactPersonPhone" TEXT,
    "contactPersonEmail" TEXT,
    "agencyType" TEXT,
    "sdgGoals" TEXT[],
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" "CSRRequirementStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationRemarks" TEXT,
    "rejectionReason" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "fieldVerificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSRRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRRequirementDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "documentCategory" TEXT NOT NULL,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSRRequirementDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NGOApplication" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "proposedPlan" TEXT NOT NULL,
    "proposedTimeline" TEXT NOT NULL,
    "estimatedCost" DECIMAL(65,30) NOT NULL,
    "teamDetails" TEXT,
    "pastExperience" TEXT,
    "proposalDocumentUrl" TEXT,
    "remarks" TEXT,
    "status" "NGOApplicationStatus" NOT NULL DEFAULT 'NGO_APPLIED',
    "rejectionReason" TEXT,
    "matchScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NGOApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInterest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fundingAmount" DECIMAL(65,30) NOT NULL,
    "fundingType" TEXT NOT NULL,
    "preferredNgoId" TEXT,
    "focusAlignmentNotes" TEXT,
    "discussionMessage" TEXT,
    "expectedTimeline" TEXT,
    "companyRemarks" TEXT,
    "status" "CompanyInterestStatus" NOT NULL DEFAULT 'INTEREST_SUBMITTED',
    "selectedNgoId" TEXT,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "beneficiaryProfileId" TEXT,
    "fundingAmount" DECIMAL(65,30) NOT NULL,
    "milestonePlan" JSONB,
    "expectedStartDate" TIMESTAMP(3),
    "expectedCompletionDate" TIMESTAMP(3),
    "termsAndConditions" TEXT,
    "signedDocumentUrl" TEXT,
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT_GENERATED',
    "rejectionReason" TEXT,
    "revisionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRFundMilestone" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "milestoneName" TEXT NOT NULL,
    "milestonePercentage" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "releaseDate" TIMESTAMP(3),
    "utilizationProofUrl" TEXT,
    "invoiceUrl" TEXT,
    "adminRemarks" TEXT,
    "status" "CSRFundMilestoneStatus" NOT NULL DEFAULT 'FM_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSRFundMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRProject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ngoId" TEXT,
    "beneficiaryProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "approvedBudget" DECIMAL(65,30) NOT NULL,
    "committedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "releasedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "utilizedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "projectStatus" "CSRRequirementStatus" NOT NULL DEFAULT 'AGREEMENT_SIGNED',
    "startDate" TIMESTAMP(3),
    "expectedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "agreementDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSRProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRFundRelease" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrProjectId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ngoId" TEXT,
    "trancheNumber" INTEGER NOT NULL,
    "trancheName" TEXT NOT NULL,
    "approvedAmount" DECIMAL(65,30) NOT NULL,
    "releasedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "releaseDate" TIMESTAMP(3),
    "paymentReference" TEXT,
    "status" "CSRFundMilestoneStatus" NOT NULL DEFAULT 'FM_PENDING',
    "utilizationCertificateId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSRFundRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetHandover" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrProjectId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "beneficiaryProfileId" TEXT NOT NULL,
    "assetDescription" TEXT NOT NULL,
    "handoverDate" TIMESTAMP(3),
    "confirmationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "confirmedById" TEXT,
    "handoverCertificate" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetHandover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInspection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrProjectId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "districtOfficerId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geoTaggedImages" TEXT[],
    "remarks" TEXT,
    "issuesFound" TEXT,
    "actionRequired" TEXT,
    "nextVisitDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactMetric" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrProjectId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "studentsBenefited" INTEGER NOT NULL DEFAULT 0,
    "patientsBenefited" INTEGER NOT NULL DEFAULT 0,
    "villagesBenefited" INTEGER NOT NULL DEFAULT 0,
    "householdsBenefited" INTEGER NOT NULL DEFAULT 0,
    "womenBeneficiaries" INTEGER NOT NULL DEFAULT 0,
    "farmersBenefited" INTEGER NOT NULL DEFAULT 0,
    "otherMetrics" JSONB,
    "sdgMapping" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "submittedByNgoId" TEXT NOT NULL,
    "progressTitle" TEXT NOT NULL,
    "progressDescription" TEXT NOT NULL,
    "physicalProgressPercent" INTEGER NOT NULL DEFAULT 0,
    "financialUtilPercent" INTEGER NOT NULL DEFAULT 0,
    "photoUrls" TEXT[],
    "videoUrls" TEXT[],
    "geoLatitude" DOUBLE PRECISION,
    "geoLongitude" DOUBLE PRECISION,
    "challenges" TEXT,
    "nextSteps" TEXT,
    "status" "ProgressReportStatus" NOT NULL DEFAULT 'PR_SUBMITTED',
    "verificationRemarks" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletionReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "submittedByNgoId" TEXT NOT NULL,
    "workCompletedSummary" TEXT NOT NULL,
    "finalCost" DECIMAL(65,30) NOT NULL,
    "fundUtilizationSummary" TEXT NOT NULL,
    "beforePhotoUrls" TEXT[],
    "afterPhotoUrls" TEXT[],
    "beneficiaryCount" INTEGER NOT NULL,
    "outcomeIndicators" JSONB,
    "certificateUrls" TEXT[],
    "beneficiaryFeedback" TEXT,
    "inspectionReportUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompletionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactReport" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "csrRequirementId" TEXT NOT NULL,
    "projectSummary" TEXT NOT NULL,
    "companyContribution" TEXT NOT NULL,
    "ngoExecutionSummary" TEXT NOT NULL,
    "beneficiaryReach" INTEGER NOT NULL,
    "beforeAfterComparison" JSONB,
    "fundUtilization" JSONB,
    "impactScore" INTEGER NOT NULL DEFAULT 0,
    "timelyCompletionScore" INTEGER NOT NULL DEFAULT 0,
    "fundUtilAccuracyScore" INTEGER NOT NULL DEFAULT 0,
    "beneficiaryFeedbackScore" INTEGER NOT NULL DEFAULT 0,
    "govVerificationScore" INTEGER NOT NULL DEFAULT 0,
    "socialImpactScore" INTEGER NOT NULL DEFAULT 0,
    "documentationScore" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateEnquiry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "trackingId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "preferredDistricts" TEXT[],
    "indicativeBudget" DECIMAL(15,2),
    "contactPersonName" TEXT NOT NULL,
    "contactPersonDesignation" TEXT,
    "mobile" TEXT NOT NULL,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "mca21Cin" TEXT NOT NULL,
    "proposedCsrWork" VARCHAR(2000) NOT NULL,
    "assignedRelationshipManagerId" TEXT,
    "status" "CorporateEnquiryStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstResponseDueAt" TIMESTAMP(3),
    "firstContactedAt" TIMESTAMP(3),
    "currentEscalationLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateEnquiryInteraction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "corporateEnquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "attachmentUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorporateEnquiryInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeasibilityAssessment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "reportReference" TEXT NOT NULL,
    "corporateEnquiryId" TEXT,
    "governmentPitchId" TEXT,
    "relationshipManagerId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "cin" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "contactSummary" TEXT NOT NULL,
    "proposedLocationDistrict" TEXT NOT NULL,
    "indicativeBudget" DECIMAL(15,2) NOT NULL,
    "developmentNeedAddressed" TEXT NOT NULL,
    "dateOfFirstContact" TIMESTAMP(3) NOT NULL,
    "summaryOfInteraction" TEXT NOT NULL,
    "feasibilityResult" "FeasibilityResult" NOT NULL,
    "recommendation" TEXT NOT NULL,
    "suggestedNodalOfficerDomain" TEXT NOT NULL,
    "conditionText" TEXT,
    "submittedToJsAt" TIMESTAMP(3),
    "jsDecisionById" TEXT,
    "jsDecisionAt" TIMESTAMP(3),
    "jsDecisionRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeasibilityAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeasibilityChecklistItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "assessmentId" TEXT NOT NULL,
    "itemNumber" INTEGER NOT NULL,
    "dimension" TEXT NOT NULL,
    "checkText" TEXT NOT NULL,
    "isCritical" BOOLEAN NOT NULL,
    "answer" "ChecklistAnswer" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeasibilityChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentPitch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "pitchReferenceId" TEXT NOT NULL,
    "officialName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "officeName" TEXT NOT NULL,
    "serviceClass" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "exactLocation" TEXT NOT NULL,
    "csrRequirement" VARCHAR(2000) NOT NULL,
    "estimatedCost" DECIMAL(15,2) NOT NULL,
    "govtFundDeclaration" BOOLEAN NOT NULL,
    "certificationType" TEXT NOT NULL,
    "hodCertificationDocument" TEXT,
    "status" "GovernmentPitchStatus" NOT NULL DEFAULT 'DRAFT',
    "assignedRelationshipManagerId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "verificationDueAt" TIMESTAMP(3),
    "jsApprovalDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentPitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentPitchPhoto" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "governmentPitchId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "capturedAt" TIMESTAMP(3),
    "isGeoTagged" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernmentPitchPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporatePitchInterest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "interestTrackingId" TEXT NOT NULL,
    "governmentPitchId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "mca21Cin" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "contactPersonDesignation" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "indicativeBudget" DECIMAL(15,2),
    "preferredStartTimeline" TEXT NOT NULL,
    "implementationMode" TEXT NOT NULL,
    "messageToGovernment" VARCHAR(1000),
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'INTERESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporatePitchInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodalOfficerAppointment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "corporateEnquiryId" TEXT,
    "governmentPitchId" TEXT,
    "assessmentId" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "nodalOfficerUserId" TEXT NOT NULL,
    "nodalOfficerName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "appointmentLetterUrl" TEXT,
    "appointedByJsId" TEXT NOT NULL,
    "appointedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectorCc" BOOLEAN NOT NULL DEFAULT true,
    "zpCeoCc" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NodalOfficerAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardMou" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "mouReferenceId" TEXT NOT NULL,
    "corporateEnquiryId" TEXT,
    "governmentPitchId" TEXT,
    "projectId" TEXT,
    "districtDepartmentName" TEXT NOT NULL,
    "nodalOfficerName" TEXT NOT NULL,
    "corporateName" TEXT NOT NULL,
    "cin" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "scheduleVIIClause" TEXT NOT NULL,
    "projectLocation" TEXT NOT NULL,
    "deliverables" JSONB NOT NULL,
    "timelineMonths" INTEGER NOT NULL,
    "financialContribution" DECIMAL(15,2) NOT NULL,
    "governmentContribution" DECIMAL(15,2),
    "implementationMode" TEXT NOT NULL,
    "implementingAgencyName" TEXT,
    "ownershipAfterCompletion" TEXT NOT NULL,
    "maintenanceResponsibility" TEXT NOT NULL,
    "signedDocumentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandardMou_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConvergenceProject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "projectId" TEXT NOT NULL,
    "corporateEnquiryId" TEXT,
    "governmentPitchId" TEXT,
    "mouId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "taluka" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "corporateName" TEXT NOT NULL,
    "nodalOfficerUserId" TEXT NOT NULL,
    "implementingAgencyUserId" TEXT,
    "approvedBudget" DECIMAL(15,2) NOT NULL,
    "utilizedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "physicalProgressPercent" INTEGER NOT NULL DEFAULT 0,
    "financialProgressPercent" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ONBOARDED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConvergenceProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDeliverableMilestone" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "convergenceProjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workType" TEXT NOT NULL,
    "status" "SimpleMilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "fundsUtilized" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "geoTaggedPhotoUrls" TEXT[],
    "verifiedByNodalOfficerId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDeliverableMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UtilizationCertificate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "convergenceProjectId" TEXT,
    "milestoneId" TEXT,
    "csrFundReleaseId" TEXT,
    "csrProjectId" TEXT,
    "csrRequirementId" TEXT,
    "ngoId" TEXT,
    "verifiedById" TEXT,
    "uploadedByUserId" TEXT NOT NULL,
    "certificateDocumentUrl" TEXT NOT NULL,
    "amountUtilized" DECIMAL(15,2) NOT NULL,
    "remarks" TEXT,
    "invoiceDocuments" TEXT[],
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedByNodalOfficerId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "UtilizationCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grievance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "grievanceId" TEXT NOT NULL,
    "convergenceProjectId" TEXT NOT NULL,
    "raisedByUserId" TEXT NOT NULL,
    "raisedByType" TEXT NOT NULL,
    "issueTitle" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'RAISED',
    "level1DueAt" TIMESTAMP(3),
    "level2DueAt" TIMESTAMP(3),
    "assignedNodalOfficerId" TEXT,
    "assignedStateCellUserId" TEXT,
    "finalAuthorityUserId" TEXT,
    "resolutionText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrievanceActionLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "grievanceId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrievanceActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLAEscalation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "stage" "SLAStage" NOT NULL,
    "responsibleUserId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "escalatedToUserId" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLAEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "NGO_registrationNumber_key" ON "NGO"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NGO_pan_key" ON "NGO"("pan");

-- CreateIndex
CREATE INDEX "NGO_tenantId_idx" ON "NGO"("tenantId");

-- CreateIndex
CREATE INDEX "NGO_organizationId_idx" ON "NGO"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cin_key" ON "Company"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "Company_gst_key" ON "Company"("gst");

-- CreateIndex
CREATE UNIQUE INDEX "Company_pan_key" ON "Company"("pan");

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE INDEX "Company_organizationId_idx" ON "Company"("organizationId");

-- CreateIndex
CREATE INDEX "Project_tenantId_idx" ON "Project"("tenantId");

-- CreateIndex
CREATE INDEX "Milestone_tenantId_idx" ON "Milestone"("tenantId");

-- CreateIndex
CREATE INDEX "Chat_tenantId_idx" ON "Chat"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_ngoId_companyId_projectId_key" ON "Chat"("ngoId", "companyId", "projectId");

-- CreateIndex
CREATE INDEX "Message_tenantId_idx" ON "Message"("tenantId");

-- CreateIndex
CREATE INDEX "Document_tenantId_idx" ON "Document"("tenantId");

-- CreateIndex
CREATE INDEX "Document_organizationId_idx" ON "Document"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_companyId_projectId_key" ON "MatchScore"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "Report_tenantId_idx" ON "Report"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingApplication_ngoId_key" ON "OnboardingApplication"("ngoId");

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
CREATE UNIQUE INDEX "CSRCompanyProfile_organizationId_key" ON "CSRCompanyProfile"("organizationId");

-- CreateIndex
CREATE INDEX "CSRCompanyProfile_tenantId_idx" ON "CSRCompanyProfile"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentDepartmentProfile_organizationId_key" ON "GovernmentDepartmentProfile"("organizationId");

-- CreateIndex
CREATE INDEX "GovernmentDepartmentProfile_tenantId_idx" ON "GovernmentDepartmentProfile"("tenantId");

-- CreateIndex
CREATE INDEX "OnboardingReview_tenantId_idx" ON "OnboardingReview"("tenantId");

-- CreateIndex
CREATE INDEX "OnboardingReview_organizationId_idx" ON "OnboardingReview"("organizationId");

-- CreateIndex
CREATE INDEX "OnboardingReview_reviewAction_idx" ON "OnboardingReview"("reviewAction");

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
CREATE INDEX "NgoDocument_ngoId_documentType_idx" ON "NgoDocument"("ngoId", "documentType");

-- CreateIndex
CREATE INDEX "NgoDocument_status_idx" ON "NgoDocument"("status");

-- CreateIndex
CREATE INDEX "NgoDocument_expiryDate_idx" ON "NgoDocument"("expiryDate");

-- CreateIndex
CREATE INDEX "BankAccount_ngoId_idx" ON "BankAccount"("ngoId");

-- CreateIndex
CREATE INDEX "BankAccount_accountNumber_idx" ON "BankAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "RiskScore_ngoId_idx" ON "RiskScore"("ngoId");

-- CreateIndex
CREATE INDEX "RiskScore_riskLevel_idx" ON "RiskScore"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_orderNumber_key" ON "PaymentOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_idempotencyKey_key" ON "PaymentOrder"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PaymentOrder_orderNumber_idx" ON "PaymentOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "PaymentOrder_status_idx" ON "PaymentOrder"("status");

-- CreateIndex
CREATE INDEX "PaymentOrder_gatewayOrderId_idx" ON "PaymentOrder"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_transactionId_key" ON "PaymentTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_transactionId_idx" ON "PaymentTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_utrNumber_idx" ON "PaymentTransaction"("utrNumber");

-- CreateIndex
CREATE INDEX "PaymentWebhookLog_gatewayName_eventType_idx" ON "PaymentWebhookLog"("gatewayName", "eventType");

-- CreateIndex
CREATE INDEX "PaymentWebhookLog_createdAt_idx" ON "PaymentWebhookLog"("createdAt");

-- CreateIndex
CREATE INDEX "FundRelease_status_idx" ON "FundRelease"("status");

-- CreateIndex
CREATE INDEX "FundRelease_ngoId_idx" ON "FundRelease"("ngoId");

-- CreateIndex
CREATE INDEX "FundRelease_projectId_idx" ON "FundRelease"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryProfile_userId_key" ON "BeneficiaryProfile"("userId");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_district_idx" ON "BeneficiaryProfile"("district");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_tenantId_idx" ON "BeneficiaryProfile"("tenantId");

-- CreateIndex
CREATE INDEX "BeneficiaryProfile_organizationId_idx" ON "BeneficiaryProfile"("organizationId");

-- CreateIndex
CREATE INDEX "CSRRequirement_district_idx" ON "CSRRequirement"("district");

-- CreateIndex
CREATE INDEX "CSRRequirement_category_idx" ON "CSRRequirement"("category");

-- CreateIndex
CREATE INDEX "CSRRequirement_status_idx" ON "CSRRequirement"("status");

-- CreateIndex
CREATE INDEX "CSRRequirement_beneficiaryProfileId_idx" ON "CSRRequirement"("beneficiaryProfileId");

-- CreateIndex
CREATE INDEX "CSRRequirement_tenantId_idx" ON "CSRRequirement"("tenantId");

-- CreateIndex
CREATE INDEX "CSRRequirementDocument_csrRequirementId_idx" ON "CSRRequirementDocument"("csrRequirementId");

-- CreateIndex
CREATE INDEX "CSRRequirementDocument_tenantId_idx" ON "CSRRequirementDocument"("tenantId");

-- CreateIndex
CREATE INDEX "NGOApplication_csrRequirementId_idx" ON "NGOApplication"("csrRequirementId");

-- CreateIndex
CREATE INDEX "NGOApplication_ngoId_idx" ON "NGOApplication"("ngoId");

-- CreateIndex
CREATE INDEX "NGOApplication_status_idx" ON "NGOApplication"("status");

-- CreateIndex
CREATE INDEX "NGOApplication_tenantId_idx" ON "NGOApplication"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NGOApplication_csrRequirementId_ngoId_key" ON "NGOApplication"("csrRequirementId", "ngoId");

-- CreateIndex
CREATE INDEX "CompanyInterest_csrRequirementId_idx" ON "CompanyInterest"("csrRequirementId");

-- CreateIndex
CREATE INDEX "CompanyInterest_companyId_idx" ON "CompanyInterest"("companyId");

-- CreateIndex
CREATE INDEX "CompanyInterest_status_idx" ON "CompanyInterest"("status");

-- CreateIndex
CREATE INDEX "CompanyInterest_tenantId_idx" ON "CompanyInterest"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInterest_csrRequirementId_companyId_key" ON "CompanyInterest"("csrRequirementId", "companyId");

-- CreateIndex
CREATE INDEX "Agreement_csrRequirementId_idx" ON "Agreement"("csrRequirementId");

-- CreateIndex
CREATE INDEX "Agreement_status_idx" ON "Agreement"("status");

-- CreateIndex
CREATE INDEX "Agreement_tenantId_idx" ON "Agreement"("tenantId");

-- CreateIndex
CREATE INDEX "CSRFundMilestone_csrRequirementId_idx" ON "CSRFundMilestone"("csrRequirementId");

-- CreateIndex
CREATE INDEX "CSRFundMilestone_status_idx" ON "CSRFundMilestone"("status");

-- CreateIndex
CREATE INDEX "CSRFundMilestone_tenantId_idx" ON "CSRFundMilestone"("tenantId");

-- CreateIndex
CREATE INDEX "CSRProject_csrRequirementId_idx" ON "CSRProject"("csrRequirementId");

-- CreateIndex
CREATE INDEX "CSRProject_beneficiaryProfileId_idx" ON "CSRProject"("beneficiaryProfileId");

-- CreateIndex
CREATE INDEX "CSRProject_companyId_idx" ON "CSRProject"("companyId");

-- CreateIndex
CREATE INDEX "CSRProject_ngoId_idx" ON "CSRProject"("ngoId");

-- CreateIndex
CREATE INDEX "CSRProject_projectStatus_idx" ON "CSRProject"("projectStatus");

-- CreateIndex
CREATE INDEX "CSRProject_tenantId_idx" ON "CSRProject"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CSRProject_csrRequirementId_companyId_key" ON "CSRProject"("csrRequirementId", "companyId");

-- CreateIndex
CREATE INDEX "CSRFundRelease_csrProjectId_idx" ON "CSRFundRelease"("csrProjectId");

-- CreateIndex
CREATE INDEX "CSRFundRelease_csrRequirementId_idx" ON "CSRFundRelease"("csrRequirementId");

-- CreateIndex
CREATE INDEX "CSRFundRelease_companyId_idx" ON "CSRFundRelease"("companyId");

-- CreateIndex
CREATE INDEX "CSRFundRelease_ngoId_idx" ON "CSRFundRelease"("ngoId");

-- CreateIndex
CREATE INDEX "CSRFundRelease_status_idx" ON "CSRFundRelease"("status");

-- CreateIndex
CREATE INDEX "CSRFundRelease_tenantId_idx" ON "CSRFundRelease"("tenantId");

-- CreateIndex
CREATE INDEX "AssetHandover_csrProjectId_idx" ON "AssetHandover"("csrProjectId");

-- CreateIndex
CREATE INDEX "AssetHandover_csrRequirementId_idx" ON "AssetHandover"("csrRequirementId");

-- CreateIndex
CREATE INDEX "AssetHandover_beneficiaryProfileId_idx" ON "AssetHandover"("beneficiaryProfileId");

-- CreateIndex
CREATE INDEX "AssetHandover_confirmationStatus_idx" ON "AssetHandover"("confirmationStatus");

-- CreateIndex
CREATE INDEX "AssetHandover_tenantId_idx" ON "AssetHandover"("tenantId");

-- CreateIndex
CREATE INDEX "ProjectInspection_csrProjectId_idx" ON "ProjectInspection"("csrProjectId");

-- CreateIndex
CREATE INDEX "ProjectInspection_csrRequirementId_idx" ON "ProjectInspection"("csrRequirementId");

-- CreateIndex
CREATE INDEX "ProjectInspection_districtOfficerId_idx" ON "ProjectInspection"("districtOfficerId");

-- CreateIndex
CREATE INDEX "ProjectInspection_visitDate_idx" ON "ProjectInspection"("visitDate");

-- CreateIndex
CREATE INDEX "ProjectInspection_tenantId_idx" ON "ProjectInspection"("tenantId");

-- CreateIndex
CREATE INDEX "ImpactMetric_csrProjectId_idx" ON "ImpactMetric"("csrProjectId");

-- CreateIndex
CREATE INDEX "ImpactMetric_csrRequirementId_idx" ON "ImpactMetric"("csrRequirementId");

-- CreateIndex
CREATE INDEX "ImpactMetric_tenantId_idx" ON "ImpactMetric"("tenantId");

-- CreateIndex
CREATE INDEX "ProgressReport_csrRequirementId_idx" ON "ProgressReport"("csrRequirementId");

-- CreateIndex
CREATE INDEX "ProgressReport_status_idx" ON "ProgressReport"("status");

-- CreateIndex
CREATE INDEX "ProgressReport_tenantId_idx" ON "ProgressReport"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CompletionReport_csrRequirementId_key" ON "CompletionReport"("csrRequirementId");

-- CreateIndex
CREATE INDEX "CompletionReport_tenantId_idx" ON "CompletionReport"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactReport_csrRequirementId_key" ON "ImpactReport"("csrRequirementId");

-- CreateIndex
CREATE INDEX "ImpactReport_tenantId_idx" ON "ImpactReport"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateEnquiry_trackingId_key" ON "CorporateEnquiry"("trackingId");

-- CreateIndex
CREATE INDEX "CorporateEnquiry_trackingId_idx" ON "CorporateEnquiry"("trackingId");

-- CreateIndex
CREATE INDEX "CorporateEnquiry_status_idx" ON "CorporateEnquiry"("status");

-- CreateIndex
CREATE INDEX "CorporateEnquiry_assignedRelationshipManagerId_idx" ON "CorporateEnquiry"("assignedRelationshipManagerId");

-- CreateIndex
CREATE INDEX "CorporateEnquiry_submittedAt_idx" ON "CorporateEnquiry"("submittedAt");

-- CreateIndex
CREATE INDEX "CorporateEnquiry_tenantId_idx" ON "CorporateEnquiry"("tenantId");

-- CreateIndex
CREATE INDEX "CorporateEnquiryInteraction_corporateEnquiryId_idx" ON "CorporateEnquiryInteraction"("corporateEnquiryId");

-- CreateIndex
CREATE INDEX "CorporateEnquiryInteraction_actorUserId_idx" ON "CorporateEnquiryInteraction"("actorUserId");

-- CreateIndex
CREATE INDEX "CorporateEnquiryInteraction_createdAt_idx" ON "CorporateEnquiryInteraction"("createdAt");

-- CreateIndex
CREATE INDEX "CorporateEnquiryInteraction_tenantId_idx" ON "CorporateEnquiryInteraction"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeasibilityAssessment_reportReference_key" ON "FeasibilityAssessment"("reportReference");

-- CreateIndex
CREATE UNIQUE INDEX "FeasibilityAssessment_corporateEnquiryId_key" ON "FeasibilityAssessment"("corporateEnquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "FeasibilityAssessment_governmentPitchId_key" ON "FeasibilityAssessment"("governmentPitchId");

-- CreateIndex
CREATE INDEX "FeasibilityAssessment_corporateEnquiryId_idx" ON "FeasibilityAssessment"("corporateEnquiryId");

-- CreateIndex
CREATE INDEX "FeasibilityAssessment_governmentPitchId_idx" ON "FeasibilityAssessment"("governmentPitchId");

-- CreateIndex
CREATE INDEX "FeasibilityAssessment_relationshipManagerId_idx" ON "FeasibilityAssessment"("relationshipManagerId");

-- CreateIndex
CREATE INDEX "FeasibilityAssessment_feasibilityResult_idx" ON "FeasibilityAssessment"("feasibilityResult");

-- CreateIndex
CREATE INDEX "FeasibilityAssessment_tenantId_idx" ON "FeasibilityAssessment"("tenantId");

-- CreateIndex
CREATE INDEX "FeasibilityChecklistItem_assessmentId_idx" ON "FeasibilityChecklistItem"("assessmentId");

-- CreateIndex
CREATE INDEX "FeasibilityChecklistItem_tenantId_idx" ON "FeasibilityChecklistItem"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeasibilityChecklistItem_assessmentId_itemNumber_key" ON "FeasibilityChecklistItem"("assessmentId", "itemNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentPitch_pitchReferenceId_key" ON "GovernmentPitch"("pitchReferenceId");

-- CreateIndex
CREATE INDEX "GovernmentPitch_pitchReferenceId_idx" ON "GovernmentPitch"("pitchReferenceId");

-- CreateIndex
CREATE INDEX "GovernmentPitch_status_idx" ON "GovernmentPitch"("status");

-- CreateIndex
CREATE INDEX "GovernmentPitch_district_idx" ON "GovernmentPitch"("district");

-- CreateIndex
CREATE INDEX "GovernmentPitch_assignedRelationshipManagerId_idx" ON "GovernmentPitch"("assignedRelationshipManagerId");

-- CreateIndex
CREATE INDEX "GovernmentPitch_tenantId_idx" ON "GovernmentPitch"("tenantId");

-- CreateIndex
CREATE INDEX "GovernmentPitchPhoto_governmentPitchId_idx" ON "GovernmentPitchPhoto"("governmentPitchId");

-- CreateIndex
CREATE INDEX "GovernmentPitchPhoto_tenantId_idx" ON "GovernmentPitchPhoto"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CorporatePitchInterest_interestTrackingId_key" ON "CorporatePitchInterest"("interestTrackingId");

-- CreateIndex
CREATE INDEX "CorporatePitchInterest_governmentPitchId_idx" ON "CorporatePitchInterest"("governmentPitchId");

-- CreateIndex
CREATE INDEX "CorporatePitchInterest_interestTrackingId_idx" ON "CorporatePitchInterest"("interestTrackingId");

-- CreateIndex
CREATE INDEX "CorporatePitchInterest_mca21Cin_idx" ON "CorporatePitchInterest"("mca21Cin");

-- CreateIndex
CREATE INDEX "CorporatePitchInterest_tenantId_idx" ON "CorporatePitchInterest"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NodalOfficerAppointment_corporateEnquiryId_key" ON "NodalOfficerAppointment"("corporateEnquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "NodalOfficerAppointment_governmentPitchId_key" ON "NodalOfficerAppointment"("governmentPitchId");

-- CreateIndex
CREATE UNIQUE INDEX "NodalOfficerAppointment_assessmentId_key" ON "NodalOfficerAppointment"("assessmentId");

-- CreateIndex
CREATE INDEX "NodalOfficerAppointment_district_idx" ON "NodalOfficerAppointment"("district");

-- CreateIndex
CREATE INDEX "NodalOfficerAppointment_nodalOfficerUserId_idx" ON "NodalOfficerAppointment"("nodalOfficerUserId");

-- CreateIndex
CREATE INDEX "NodalOfficerAppointment_appointedByJsId_idx" ON "NodalOfficerAppointment"("appointedByJsId");

-- CreateIndex
CREATE INDEX "NodalOfficerAppointment_tenantId_idx" ON "NodalOfficerAppointment"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "StandardMou_mouReferenceId_key" ON "StandardMou"("mouReferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "StandardMou_corporateEnquiryId_key" ON "StandardMou"("corporateEnquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "StandardMou_governmentPitchId_key" ON "StandardMou"("governmentPitchId");

-- CreateIndex
CREATE UNIQUE INDEX "StandardMou_projectId_key" ON "StandardMou"("projectId");

-- CreateIndex
CREATE INDEX "StandardMou_mouReferenceId_idx" ON "StandardMou"("mouReferenceId");

-- CreateIndex
CREATE INDEX "StandardMou_status_idx" ON "StandardMou"("status");

-- CreateIndex
CREATE INDEX "StandardMou_tenantId_idx" ON "StandardMou"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ConvergenceProject_projectId_key" ON "ConvergenceProject"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ConvergenceProject_corporateEnquiryId_key" ON "ConvergenceProject"("corporateEnquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "ConvergenceProject_governmentPitchId_key" ON "ConvergenceProject"("governmentPitchId");

-- CreateIndex
CREATE UNIQUE INDEX "ConvergenceProject_mouId_key" ON "ConvergenceProject"("mouId");

-- CreateIndex
CREATE INDEX "ConvergenceProject_projectId_idx" ON "ConvergenceProject"("projectId");

-- CreateIndex
CREATE INDEX "ConvergenceProject_status_idx" ON "ConvergenceProject"("status");

-- CreateIndex
CREATE INDEX "ConvergenceProject_district_idx" ON "ConvergenceProject"("district");

-- CreateIndex
CREATE INDEX "ConvergenceProject_nodalOfficerUserId_idx" ON "ConvergenceProject"("nodalOfficerUserId");

-- CreateIndex
CREATE INDEX "ConvergenceProject_implementingAgencyUserId_idx" ON "ConvergenceProject"("implementingAgencyUserId");

-- CreateIndex
CREATE INDEX "ConvergenceProject_tenantId_idx" ON "ConvergenceProject"("tenantId");

-- CreateIndex
CREATE INDEX "ProjectDeliverableMilestone_convergenceProjectId_idx" ON "ProjectDeliverableMilestone"("convergenceProjectId");

-- CreateIndex
CREATE INDEX "ProjectDeliverableMilestone_status_idx" ON "ProjectDeliverableMilestone"("status");

-- CreateIndex
CREATE INDEX "ProjectDeliverableMilestone_tenantId_idx" ON "ProjectDeliverableMilestone"("tenantId");

-- CreateIndex
CREATE INDEX "UtilizationCertificate_convergenceProjectId_idx" ON "UtilizationCertificate"("convergenceProjectId");

-- CreateIndex
CREATE INDEX "UtilizationCertificate_milestoneId_idx" ON "UtilizationCertificate"("milestoneId");

-- CreateIndex
CREATE INDEX "UtilizationCertificate_uploadedByUserId_idx" ON "UtilizationCertificate"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "UtilizationCertificate_verificationStatus_idx" ON "UtilizationCertificate"("verificationStatus");

-- CreateIndex
CREATE INDEX "UtilizationCertificate_tenantId_idx" ON "UtilizationCertificate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Grievance_grievanceId_key" ON "Grievance"("grievanceId");

-- CreateIndex
CREATE INDEX "Grievance_grievanceId_idx" ON "Grievance"("grievanceId");

-- CreateIndex
CREATE INDEX "Grievance_convergenceProjectId_idx" ON "Grievance"("convergenceProjectId");

-- CreateIndex
CREATE INDEX "Grievance_status_idx" ON "Grievance"("status");

-- CreateIndex
CREATE INDEX "Grievance_raisedByUserId_idx" ON "Grievance"("raisedByUserId");

-- CreateIndex
CREATE INDEX "Grievance_assignedNodalOfficerId_idx" ON "Grievance"("assignedNodalOfficerId");

-- CreateIndex
CREATE INDEX "Grievance_tenantId_idx" ON "Grievance"("tenantId");

-- CreateIndex
CREATE INDEX "GrievanceActionLog_grievanceId_idx" ON "GrievanceActionLog"("grievanceId");

-- CreateIndex
CREATE INDEX "GrievanceActionLog_actorUserId_idx" ON "GrievanceActionLog"("actorUserId");

-- CreateIndex
CREATE INDEX "GrievanceActionLog_tenantId_idx" ON "GrievanceActionLog"("tenantId");

-- CreateIndex
CREATE INDEX "SLAEscalation_entityType_entityId_idx" ON "SLAEscalation"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SLAEscalation_stage_idx" ON "SLAEscalation"("stage");

-- CreateIndex
CREATE INDEX "SLAEscalation_responsibleUserId_idx" ON "SLAEscalation"("responsibleUserId");

-- CreateIndex
CREATE INDEX "SLAEscalation_isResolved_idx" ON "SLAEscalation"("isResolved");

-- CreateIndex
CREATE INDEX "SLAEscalation_dueAt_idx" ON "SLAEscalation"("dueAt");

-- CreateIndex
CREATE INDEX "SLAEscalation_tenantId_idx" ON "SLAEscalation"("tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingApplication" ADD CONSTRAINT "OnboardingApplication_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingApplication" ADD CONSTRAINT "OnboardingApplication_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingStatusHistory" ADD CONSTRAINT "OnboardingStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "OnboardingApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingStatusHistory" ADD CONSTRAINT "OnboardingStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingQuery" ADD CONSTRAINT "OnboardingQuery_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "OnboardingApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingQuery" ADD CONSTRAINT "OnboardingQuery_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryResponse" ADD CONSTRAINT "QueryResponse_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "OnboardingQuery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueryResponse" ADD CONSTRAINT "QueryResponse_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCheck" ADD CONSTRAINT "VerificationCheck_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "OnboardingApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationCheck" ADD CONSTRAINT "VerificationCheck_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantFeature" ADD CONSTRAINT "TenantFeature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationDocument" ADD CONSTRAINT "OrganizationDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRCompanyProfile" ADD CONSTRAINT "CSRCompanyProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentDepartmentProfile" ADD CONSTRAINT "GovernmentDepartmentProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingReview" ADD CONSTRAINT "OnboardingReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "NgoDocument" ADD CONSTRAINT "NgoDocument_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgoDocument" ADD CONSTRAINT "NgoDocument_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "NgoDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgoDocument" ADD CONSTRAINT "NgoDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgoDocument" ADD CONSTRAINT "NgoDocument_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NgoContact" ADD CONSTRAINT "NgoContact_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceMember" ADD CONSTRAINT "GovernanceMember_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_calculatedById_fkey" FOREIGN KEY ("calculatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFlag" ADD CONSTRAINT "RiskFlag_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFlag" ADD CONSTRAINT "RiskFlag_riskScoreId_fkey" FOREIGN KEY ("riskScoreId") REFERENCES "RiskScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentOrderId_fkey" FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentWebhookLog" ADD CONSTRAINT "PaymentWebhookLog_paymentOrderId_fkey" FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundRelease" ADD CONSTRAINT "FundRelease_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundRelease" ADD CONSTRAINT "FundRelease_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundRelease" ADD CONSTRAINT "FundRelease_paymentOrderId_fkey" FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeneficiaryProfile" ADD CONSTRAINT "BeneficiaryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRRequirement" ADD CONSTRAINT "CSRRequirement_beneficiaryProfileId_fkey" FOREIGN KEY ("beneficiaryProfileId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRRequirementDocument" ADD CONSTRAINT "CSRRequirementDocument_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGOApplication" ADD CONSTRAINT "NGOApplication_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NGOApplication" ADD CONSTRAINT "NGOApplication_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInterest" ADD CONSTRAINT "CompanyInterest_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInterest" ADD CONSTRAINT "CompanyInterest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRFundMilestone" ADD CONSTRAINT "CSRFundMilestone_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_beneficiaryProfileId_fkey" FOREIGN KEY ("beneficiaryProfileId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHandover" ADD CONSTRAINT "AssetHandover_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHandover" ADD CONSTRAINT "AssetHandover_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHandover" ADD CONSTRAINT "AssetHandover_beneficiaryProfileId_fkey" FOREIGN KEY ("beneficiaryProfileId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInspection" ADD CONSTRAINT "ProjectInspection_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInspection" ADD CONSTRAINT "ProjectInspection_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletionReport" ADD CONSTRAINT "CompletionReport_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactReport" ADD CONSTRAINT "ImpactReport_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateEnquiry" ADD CONSTRAINT "CorporateEnquiry_assignedRelationshipManagerId_fkey" FOREIGN KEY ("assignedRelationshipManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateEnquiryInteraction" ADD CONSTRAINT "CorporateEnquiryInteraction_corporateEnquiryId_fkey" FOREIGN KEY ("corporateEnquiryId") REFERENCES "CorporateEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateEnquiryInteraction" ADD CONSTRAINT "CorporateEnquiryInteraction_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeasibilityAssessment" ADD CONSTRAINT "FeasibilityAssessment_corporateEnquiryId_fkey" FOREIGN KEY ("corporateEnquiryId") REFERENCES "CorporateEnquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeasibilityAssessment" ADD CONSTRAINT "FeasibilityAssessment_governmentPitchId_fkey" FOREIGN KEY ("governmentPitchId") REFERENCES "GovernmentPitch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeasibilityAssessment" ADD CONSTRAINT "FeasibilityAssessment_relationshipManagerId_fkey" FOREIGN KEY ("relationshipManagerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeasibilityAssessment" ADD CONSTRAINT "FeasibilityAssessment_jsDecisionById_fkey" FOREIGN KEY ("jsDecisionById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeasibilityChecklistItem" ADD CONSTRAINT "FeasibilityChecklistItem_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "FeasibilityAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentPitch" ADD CONSTRAINT "GovernmentPitch_assignedRelationshipManagerId_fkey" FOREIGN KEY ("assignedRelationshipManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentPitchPhoto" ADD CONSTRAINT "GovernmentPitchPhoto_governmentPitchId_fkey" FOREIGN KEY ("governmentPitchId") REFERENCES "GovernmentPitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporatePitchInterest" ADD CONSTRAINT "CorporatePitchInterest_governmentPitchId_fkey" FOREIGN KEY ("governmentPitchId") REFERENCES "GovernmentPitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodalOfficerAppointment" ADD CONSTRAINT "NodalOfficerAppointment_corporateEnquiryId_fkey" FOREIGN KEY ("corporateEnquiryId") REFERENCES "CorporateEnquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodalOfficerAppointment" ADD CONSTRAINT "NodalOfficerAppointment_governmentPitchId_fkey" FOREIGN KEY ("governmentPitchId") REFERENCES "GovernmentPitch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodalOfficerAppointment" ADD CONSTRAINT "NodalOfficerAppointment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "FeasibilityAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodalOfficerAppointment" ADD CONSTRAINT "NodalOfficerAppointment_nodalOfficerUserId_fkey" FOREIGN KEY ("nodalOfficerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodalOfficerAppointment" ADD CONSTRAINT "NodalOfficerAppointment_appointedByJsId_fkey" FOREIGN KEY ("appointedByJsId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardMou" ADD CONSTRAINT "StandardMou_corporateEnquiryId_fkey" FOREIGN KEY ("corporateEnquiryId") REFERENCES "CorporateEnquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardMou" ADD CONSTRAINT "StandardMou_governmentPitchId_fkey" FOREIGN KEY ("governmentPitchId") REFERENCES "GovernmentPitch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvergenceProject" ADD CONSTRAINT "ConvergenceProject_corporateEnquiryId_fkey" FOREIGN KEY ("corporateEnquiryId") REFERENCES "CorporateEnquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvergenceProject" ADD CONSTRAINT "ConvergenceProject_governmentPitchId_fkey" FOREIGN KEY ("governmentPitchId") REFERENCES "GovernmentPitch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvergenceProject" ADD CONSTRAINT "ConvergenceProject_mouId_fkey" FOREIGN KEY ("mouId") REFERENCES "StandardMou"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvergenceProject" ADD CONSTRAINT "ConvergenceProject_nodalOfficerUserId_fkey" FOREIGN KEY ("nodalOfficerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvergenceProject" ADD CONSTRAINT "ConvergenceProject_implementingAgencyUserId_fkey" FOREIGN KEY ("implementingAgencyUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDeliverableMilestone" ADD CONSTRAINT "ProjectDeliverableMilestone_convergenceProjectId_fkey" FOREIGN KEY ("convergenceProjectId") REFERENCES "ConvergenceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDeliverableMilestone" ADD CONSTRAINT "ProjectDeliverableMilestone_verifiedByNodalOfficerId_fkey" FOREIGN KEY ("verifiedByNodalOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_convergenceProjectId_fkey" FOREIGN KEY ("convergenceProjectId") REFERENCES "ConvergenceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ProjectDeliverableMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_csrFundReleaseId_fkey" FOREIGN KEY ("csrFundReleaseId") REFERENCES "CSRFundRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_verifiedByNodalOfficerId_fkey" FOREIGN KEY ("verifiedByNodalOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_convergenceProjectId_fkey" FOREIGN KEY ("convergenceProjectId") REFERENCES "ConvergenceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_raisedByUserId_fkey" FOREIGN KEY ("raisedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_assignedNodalOfficerId_fkey" FOREIGN KEY ("assignedNodalOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_assignedStateCellUserId_fkey" FOREIGN KEY ("assignedStateCellUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_finalAuthorityUserId_fkey" FOREIGN KEY ("finalAuthorityUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceActionLog" ADD CONSTRAINT "GrievanceActionLog_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceActionLog" ADD CONSTRAINT "GrievanceActionLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAEscalation" ADD CONSTRAINT "SLAEscalation_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAEscalation" ADD CONSTRAINT "SLAEscalation_escalatedToUserId_fkey" FOREIGN KEY ("escalatedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
