import prisma from "../config/db";
import { Role } from "../types/role";
import { isSuperAdmin } from "./roleResolver";

/**
 * Single source of truth for permission resolution, shared by the
 * checkPermission middleware and the workflow engine.
 *
 * Resolution is 100 % database-driven:
 * 1. SUPER_ADMIN enum bypass
 * 2. User.roleId → OrganizationRole → OrganizationRolePermission
 * 3. UserOrganizationRole → OrganizationRole → OrganizationRolePermission
 */
export async function resolveUserPermission(
  userId: string,
  permissionKey: string,
  options?: { role?: string | null; organizationId?: string | null }
): Promise<boolean> {
  const role = options?.role;

  // 1. SUPER_ADMIN always passes
  if (role === Role.SUPER_ADMIN) return true;

  // 2. Check via User.roleId → OrganizationRole → permissions
  const userDirect = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      roleRelation: {
        select: {
          status: true,
          rolePermissions: {
            where: { permission: { key: permissionKey } },
            select: { permissionId: true },
          },
        },
      },
    },
  });

  if (!userDirect) return false;
  if (userDirect.role === Role.SUPER_ADMIN) return true;

  if (
    userDirect.roleRelation &&
    userDirect.roleRelation.status === "ACTIVE" &&
    userDirect.roleRelation.rolePermissions.length > 0
  ) {
    return true;
  }

  // 3. Check via UserOrganizationRole → OrganizationRole → permissions
  const count = await prisma.userOrganizationRole.count({
    where: {
      userId,
      ...(options?.organizationId
        ? { organizationId: options.organizationId }
        : {}),
      role: {
        status: "ACTIVE",
        rolePermissions: { some: { permission: { key: permissionKey } } },
      },
    },
  });

  return count > 0;
}

/**
 * Shape returned to clients describing everything they need to gate UI:
 * the flat permission-key set, the role names/details, and the admin flag.
 */
export interface UserPermissionPayload {
  permissions: string[];
  roles: string[];
  roleDetails: {
    id: string;
    numericId: number;
    slug: string | null;
    name: string;
    scope: string;
    isSystemRole: boolean;
  }[];
  isAdmin: boolean;
}

/**
 * Compute a user's FULL effective permission set from both role axes:
 *   1. User.roleId → OrganizationRole.rolePermissions
 *   2. UserOrganizationRole assignments → role.rolePermissions
 *
 * Super Admin (enum bucket OR "super-admin" slug) short-circuits to every
 * permission. This is the single source of truth shared by the login handler
 * (which folds the result into the login response to eliminate the extra
 * /auth/permissions round-trip) and GET /auth/permissions (re-fetch after a
 * role/permission change).
 */
export async function computeUserPermissions(principal: {
  userId: string;
  role?: string | null;
  roleSlug?: string | null;
  organizationId?: string | null;
}): Promise<UserPermissionPayload> {
  const { userId, role, roleSlug, organizationId } = principal;
  const permissionSet = new Set<string>();

  // 1. Permissions from User.roleId → OrganizationRole
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roleRelation: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  });

  if (user?.roleRelation) {
    user.roleRelation.rolePermissions.forEach((rp) => {
      permissionSet.add(rp.permission.key);
    });
  }

  // 2. Permissions from UserOrganizationRole assignments
  const userOrgRoles = await prisma.userOrganizationRole.findMany({
    where: {
      userId,
      organizationId: organizationId || undefined,
    },
    include: {
      role: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  });

  userOrgRoles.forEach((assignment: any) => {
    assignment.role.rolePermissions.forEach((rolePermission: any) => {
      permissionSet.add(rolePermission.permission.key);
    });
  });

  // Build role list (dedup across both axes)
  const roles: UserPermissionPayload["roleDetails"] = [];

  if (user?.roleRelation) {
    roles.push({
      id: user.roleRelation.id,
      numericId: (user.roleRelation as any).numericId,
      slug: (user.roleRelation as any).slug ?? null,
      name: user.roleRelation.name,
      scope: user.roleRelation.scope,
      isSystemRole: user.roleRelation.isSystemRole,
    });
  }

  userOrgRoles.forEach((assignment) => {
    if (!roles.some((r) => r.id === assignment.role.id)) {
      roles.push({
        id: assignment.role.id,
        numericId: (assignment.role as any).numericId,
        slug: (assignment.role as any).slug ?? null,
        name: assignment.role.name,
        scope: assignment.role.scope,
        isSystemRole: assignment.role.isSystemRole,
      });
    }
  });

  // Super Admin recognised on EITHER axis → gets every permission.
  const isAdmin = isSuperAdmin({ role, roleSlug });
  if (isAdmin) {
    const allPerms = await prisma.permission.findMany({ select: { key: true } });
    allPerms.forEach((p) => permissionSet.add(p.key));
  }

  return {
    permissions: Array.from(permissionSet),
    roles: roles.map((r) => r.name),
    roleDetails: roles,
    isAdmin,
  };
}
