import { z } from "zod";
import { SYSTEM_ROLE_TEMPLATE_MAP } from "../types/role";

const PROTECTED_SYSTEM_CODES = new Set(
  Object.values(SYSTEM_ROLE_TEMPLATE_MAP).map((t) => t.code.toUpperCase())
);

export const RoleScopeEnum = z.enum([
  "GLOBAL",
  "ORGANIZATION",
  "DISTRICT",
  "PROJECT",
  "ASSIGNED_RESOURCE"
]);

export const RoleStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

export const CreateRoleSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_]+$/, "Role code must contain only uppercase letters, numbers, and underscores")
    .refine((code) => !PROTECTED_SYSTEM_CODES.has(code.toUpperCase()), {
      message: "System role codes are reserved and cannot be used for custom roles"
    }),
  name: z.string().min(2).max(100),
  displayName: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  defaultScope: RoleScopeEnum.default("ORGANIZATION"),
  organizationId: z.string().uuid().optional().nullable(),
  permissions: z
    .array(z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/))
    .refine((perms) => new Set(perms).size === perms.length, {
      message: "Duplicate permission keys are not allowed"
    })
    .optional()
});

export const PatchRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  displayName: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  defaultScope: RoleScopeEnum.optional(),
  version: z.number().int().positive({ message: "Version is required for optimistic locking" }),
  reason: z.string().max(300).optional()
});

export const UpdatePermissionsSchema = z.object({
  version: z.number().int().positive({ message: "Role version is required for optimistic locking" }),
  permissions: z
    .array(z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/))
    .refine((perms) => new Set(perms).size === perms.length, {
      message: "Duplicate permission keys are not allowed"
    }),
  reason: z.string().max(300).optional()
});

export const CloneRoleSchema = z.object({
  newCode: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_]+$/)
    .refine((code) => !PROTECTED_SYSTEM_CODES.has(code.toUpperCase()), {
      message: "System role codes are reserved"
    }),
  newName: z.string().min(2).max(100),
  newDisplayName: z.string().min(2).max(100).optional()
});

export const ImpactPreviewSchema = z.object({
  permissionsToAdd: z.array(z.string()).optional().default([]),
  permissionsToRemove: z.array(z.string()).optional().default([])
});

export const CreateAssignmentSchema = z.object({
  userId: z.string().uuid("Invalid User ID format"),
  roleId: z.number().int().positive(),
  organizationId: z.string().uuid().optional().nullable(),
  districtCode: z.string().max(50).optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable()
});

export const PatchAssignmentSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED", "REVOKED"]).optional(),
  validUntil: z.string().datetime().optional().nullable(),
  reason: z.string().max(300).optional()
});
