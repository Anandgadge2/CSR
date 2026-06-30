-- AlterTable
ALTER TABLE "CorporatePitchInterest" ADD COLUMN     "coordinationNotes" TEXT,
ADD COLUMN     "dialogueInitiated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nodalOfficerRecommended" TEXT;
