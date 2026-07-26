ALTER TABLE "CSRCompanyProfile"
  ADD COLUMN "currentYearCsrBudget" DECIMAL(15,2),
  ADD COLUMN "averageNetProfit" DECIMAL(15,2),
  ADD COLUMN "csrObligationAmount" DECIMAL(15,2),
  ADD COLUMN "unspentCsrAmount" DECIMAL(15,2),
  ADD COLUMN "financialYear" TEXT,
  ADD COLUMN "csrApplicable" BOOLEAN,
  ADD COLUMN "preferredDivisions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "preferredCities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "preferredTalukas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
