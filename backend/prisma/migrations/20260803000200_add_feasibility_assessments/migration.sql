CREATE TABLE "FeasibilityAssessment" (
  "id" TEXT NOT NULL,
  "enquiryId" TEXT NOT NULL,
  "checklist" JSONB NOT NULL,
  "recommendation" TEXT NOT NULL,
  "executiveSummary" TEXT,
  "assessedByUserId" TEXT NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED_TO_JS',
  "jsDecision" TEXT,
  "jsDecisionReason" TEXT,
  "jsDecidedByUserId" TEXT,
  "jsDecidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeasibilityAssessment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FeasibilityAssessment_enquiryId_key" ON "FeasibilityAssessment"("enquiryId");
CREATE INDEX "FeasibilityAssessment_status_idx" ON "FeasibilityAssessment"("status");
CREATE INDEX "FeasibilityAssessment_assessedByUserId_idx" ON "FeasibilityAssessment"("assessedByUserId");
CREATE INDEX "FeasibilityAssessment_submittedAt_idx" ON "FeasibilityAssessment"("submittedAt");
