-- Migration: Canonical Access Control Engine
-- Create Enums
CREATE TYPE "RoleType" AS ENUM ('SYSTEM', 'CUSTOM');
CREATE TYPE "RoleScope" AS ENUM ('GLOBAL', 'ORGANIZATION', 'DISTRICT', 'PROJECT', 'ASSIGNED_RESOURCE');
CREATE TYPE "RoleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'REVOKED');

-- Alter User table: add tokenVersion
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 1;

-- Alter Role table: add code, displayName, type, defaultScope, status, version
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "type" "RoleType" NOT NULL DEFAULT 'CUSTOM';
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "defaultScope" "RoleScope" NOT NULL DEFAULT 'ORGANIZATION';
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "status" "RoleStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- Create Unique Index on Role.code
CREATE UNIQUE INDEX IF NOT EXISTS "Role_code_key" ON "Role"("code");
CREATE INDEX IF NOT EXISTS "Role_code_idx" ON "Role"("code");

-- Alter Permission table: add riskLevel, isDelegable, dependencies
ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW';
ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "isDelegable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Permission" ADD COLUMN IF NOT EXISTS "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create UserRoleAssignment table
CREATE TABLE IF NOT EXISTS "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "organizationId" TEXT,
    "districtCode" TEXT,
    "projectId" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys & Indexes for UserRoleAssignment
ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT IF EXISTS "UserRoleAssignment_userId_fkey";
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT IF EXISTS "UserRoleAssignment_roleId_fkey";
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT IF EXISTS "UserRoleAssignment_organizationId_fkey";
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT IF EXISTS "UserRoleAssignment_projectId_fkey";
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT IF EXISTS "UserRoleAssignment_assignedById_fkey";
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "UserRoleAssignment_userId_status_idx" ON "UserRoleAssignment"("userId", "status");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_roleId_idx" ON "UserRoleAssignment"("roleId");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_organizationId_idx" ON "UserRoleAssignment"("organizationId");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_districtCode_idx" ON "UserRoleAssignment"("districtCode");
CREATE INDEX IF NOT EXISTS "UserRoleAssignment_projectId_idx" ON "UserRoleAssignment"("projectId");

-- Sequence Alignment Statement
SELECT setval(' "Role_id_seq" ', COALESCE((SELECT MAX(id) FROM "Role"), 1), true);
