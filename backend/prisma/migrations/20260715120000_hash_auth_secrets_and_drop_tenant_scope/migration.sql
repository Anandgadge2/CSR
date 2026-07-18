-- Rename auth secret columns to reflect that only hashes are stored (no plaintext OTP / refresh token at rest).
ALTER TABLE "User" RENAME COLUMN "otpCode" TO "otpCodeHash";
ALTER TABLE "User" RENAME COLUMN "refreshToken" TO "refreshTokenHash";

-- Drop the unused TENANT value from RoleScope. Postgres cannot remove an enum
-- value in place, so recreate the type. Any existing TENANT rows are remapped
-- to ORGANIZATION (the scope now used for org-bound system roles).
ALTER TYPE "RoleScope" RENAME TO "RoleScope_old";
CREATE TYPE "RoleScope" AS ENUM ('GLOBAL', 'ORGANIZATION');
ALTER TABLE "OrganizationRole"
  ALTER COLUMN "scope" TYPE "RoleScope"
  USING (
    CASE "scope"::text
      WHEN 'TENANT' THEN 'ORGANIZATION'
      ELSE "scope"::text
    END
  )::"RoleScope";
DROP TYPE "RoleScope_old";
