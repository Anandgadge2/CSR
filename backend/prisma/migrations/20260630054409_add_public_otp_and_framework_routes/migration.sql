-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "verificationToken" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_verificationToken_key" ON "OtpVerification"("verificationToken");

-- CreateIndex
CREATE INDEX "OtpVerification_purpose_channel_target_idx" ON "OtpVerification"("purpose", "channel", "target");

-- CreateIndex
CREATE INDEX "OtpVerification_expiresAt_idx" ON "OtpVerification"("expiresAt");
