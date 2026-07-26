ALTER TABLE "Organization"
  ADD COLUMN "registeredOfficeAddress" TEXT,
  ADD COLUMN "corporateOfficeAddress" TEXT,
  ADD COLUMN "officialEmailDomain" TEXT,
  ADD COLUMN "yearOfIncorporation" INTEGER,
  ADD COLUMN "companyType" TEXT,
  ADD COLUMN "mcaVerificationStatus" TEXT,
  ADD COLUMN "companyStatus" TEXT;
