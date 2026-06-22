CREATE TABLE "CSRProject" (
  "id" TEXT NOT NULL,
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

CREATE TABLE "CSRFundRelease" (
  "id" TEXT NOT NULL,
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

CREATE TABLE "UtilizationCertificate" (
  "id" TEXT NOT NULL,
  "csrFundReleaseId" TEXT,
  "csrProjectId" TEXT,
  "csrRequirementId" TEXT NOT NULL,
  "ngoId" TEXT NOT NULL,
  "utilizedAmount" DECIMAL(65,30) NOT NULL,
  "certificateDocument" TEXT,
  "invoiceDocuments" TEXT[],
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verificationStatus" "CSRFundMilestoneStatus" NOT NULL DEFAULT 'UTILIZATION_SUBMITTED',
  "verifiedById" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UtilizationCertificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssetHandover" (
  "id" TEXT NOT NULL,
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

CREATE TABLE "ProjectInspection" (
  "id" TEXT NOT NULL,
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

CREATE TABLE "ImpactMetric" (
  "id" TEXT NOT NULL,
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

CREATE UNIQUE INDEX "CSRProject_csrRequirementId_companyId_key" ON "CSRProject"("csrRequirementId", "companyId");
CREATE INDEX "CSRProject_csrRequirementId_idx" ON "CSRProject"("csrRequirementId");
CREATE INDEX "CSRProject_beneficiaryProfileId_idx" ON "CSRProject"("beneficiaryProfileId");
CREATE INDEX "CSRProject_companyId_idx" ON "CSRProject"("companyId");
CREATE INDEX "CSRProject_ngoId_idx" ON "CSRProject"("ngoId");
CREATE INDEX "CSRProject_projectStatus_idx" ON "CSRProject"("projectStatus");

CREATE INDEX "CSRFundRelease_csrProjectId_idx" ON "CSRFundRelease"("csrProjectId");
CREATE INDEX "CSRFundRelease_csrRequirementId_idx" ON "CSRFundRelease"("csrRequirementId");
CREATE INDEX "CSRFundRelease_companyId_idx" ON "CSRFundRelease"("companyId");
CREATE INDEX "CSRFundRelease_ngoId_idx" ON "CSRFundRelease"("ngoId");
CREATE INDEX "CSRFundRelease_status_idx" ON "CSRFundRelease"("status");

CREATE INDEX "UtilizationCertificate_csrFundReleaseId_idx" ON "UtilizationCertificate"("csrFundReleaseId");
CREATE INDEX "UtilizationCertificate_csrProjectId_idx" ON "UtilizationCertificate"("csrProjectId");
CREATE INDEX "UtilizationCertificate_csrRequirementId_idx" ON "UtilizationCertificate"("csrRequirementId");
CREATE INDEX "UtilizationCertificate_ngoId_idx" ON "UtilizationCertificate"("ngoId");
CREATE INDEX "UtilizationCertificate_verificationStatus_idx" ON "UtilizationCertificate"("verificationStatus");

CREATE INDEX "AssetHandover_csrProjectId_idx" ON "AssetHandover"("csrProjectId");
CREATE INDEX "AssetHandover_csrRequirementId_idx" ON "AssetHandover"("csrRequirementId");
CREATE INDEX "AssetHandover_beneficiaryProfileId_idx" ON "AssetHandover"("beneficiaryProfileId");
CREATE INDEX "AssetHandover_confirmationStatus_idx" ON "AssetHandover"("confirmationStatus");

CREATE INDEX "ProjectInspection_csrProjectId_idx" ON "ProjectInspection"("csrProjectId");
CREATE INDEX "ProjectInspection_csrRequirementId_idx" ON "ProjectInspection"("csrRequirementId");
CREATE INDEX "ProjectInspection_districtOfficerId_idx" ON "ProjectInspection"("districtOfficerId");
CREATE INDEX "ProjectInspection_visitDate_idx" ON "ProjectInspection"("visitDate");

CREATE INDEX "ImpactMetric_csrProjectId_idx" ON "ImpactMetric"("csrProjectId");
CREATE INDEX "ImpactMetric_csrRequirementId_idx" ON "ImpactMetric"("csrRequirementId");

ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_beneficiaryProfileId_fkey" FOREIGN KEY ("beneficiaryProfileId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CSRProject" ADD CONSTRAINT "CSRProject_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CSRFundRelease" ADD CONSTRAINT "CSRFundRelease_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_csrFundReleaseId_fkey" FOREIGN KEY ("csrFundReleaseId") REFERENCES "CSRFundRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UtilizationCertificate" ADD CONSTRAINT "UtilizationCertificate_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "NGO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AssetHandover" ADD CONSTRAINT "AssetHandover_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssetHandover" ADD CONSTRAINT "AssetHandover_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssetHandover" ADD CONSTRAINT "AssetHandover_beneficiaryProfileId_fkey" FOREIGN KEY ("beneficiaryProfileId") REFERENCES "BeneficiaryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectInspection" ADD CONSTRAINT "ProjectInspection_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectInspection" ADD CONSTRAINT "ProjectInspection_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_csrProjectId_fkey" FOREIGN KEY ("csrProjectId") REFERENCES "CSRProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImpactMetric" ADD CONSTRAINT "ImpactMetric_csrRequirementId_fkey" FOREIGN KEY ("csrRequirementId") REFERENCES "CSRRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
