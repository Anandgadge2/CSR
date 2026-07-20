import prisma from "../config/db";
import { Role } from "../types/role";

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
