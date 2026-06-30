-- CreateTable
CREATE TABLE "ConvergenceProjectInspection" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "convergenceProjectId" TEXT NOT NULL,
    "districtOfficerId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geoTaggedImages" TEXT[],
    "remarks" TEXT,
    "issuesFound" TEXT,
    "actionRequired" TEXT,
    "nextVisitDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConvergenceProjectInspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConvergenceProjectInspection_convergenceProjectId_idx" ON "ConvergenceProjectInspection"("convergenceProjectId");

-- CreateIndex
CREATE INDEX "ConvergenceProjectInspection_districtOfficerId_idx" ON "ConvergenceProjectInspection"("districtOfficerId");

-- CreateIndex
CREATE INDEX "ConvergenceProjectInspection_tenantId_idx" ON "ConvergenceProjectInspection"("tenantId");

-- AddForeignKey
ALTER TABLE "ConvergenceProjectInspection" ADD CONSTRAINT "ConvergenceProjectInspection_convergenceProjectId_fkey" FOREIGN KEY ("convergenceProjectId") REFERENCES "ConvergenceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConvergenceProjectInspection" ADD CONSTRAINT "ConvergenceProjectInspection_districtOfficerId_fkey" FOREIGN KEY ("districtOfficerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
