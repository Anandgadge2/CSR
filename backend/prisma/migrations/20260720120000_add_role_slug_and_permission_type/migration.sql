-- Phase 0: dynamic-role foundation
-- All changes are ADDITIVE and non-destructive.

-- 1. Permission.type — distinguishes ACTION permissions from PAGE-visibility permissions
DO $$ BEGIN
  CREATE TYPE "PermissionType" AS ENUM ('ACTION', 'PAGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Permission"
  ADD COLUMN IF NOT EXISTS "type" "PermissionType" NOT NULL DEFAULT 'ACTION';

-- 2. OrganizationRole.slug — stable machine key for business-logic role checks.
--    Indexed but intentionally NOT globally unique (org-scoped roles reuse slugs).
ALTER TABLE "OrganizationRole"
  ADD COLUMN IF NOT EXISTS "slug" TEXT;

CREATE INDEX IF NOT EXISTS "OrganizationRole_slug_idx" ON "OrganizationRole" ("slug");

-- 3. OrganizationRole.isProtected — protected roles (Super Admin) bypass checks,
--    may be renamed but never deleted or stripped of permissions.
ALTER TABLE "OrganizationRole"
  ADD COLUMN IF NOT EXISTS "isProtected" BOOLEAN NOT NULL DEFAULT false;

-- 4. OrganizationRole.numericId — stable auto-increment identifier used for
--    dashboard routing. Backfilled for existing rows via an owned sequence.
CREATE SEQUENCE IF NOT EXISTS "OrganizationRole_numericId_seq";

ALTER TABLE "OrganizationRole"
  ADD COLUMN IF NOT EXISTS "numericId" INTEGER NOT NULL DEFAULT nextval('"OrganizationRole_numericId_seq"');

ALTER SEQUENCE "OrganizationRole_numericId_seq" OWNED BY "OrganizationRole"."numericId";

CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationRole_numericId_key" ON "OrganizationRole" ("numericId");
