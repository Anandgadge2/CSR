import prisma from "../config/db";
import { ROLE_ID, getRoleId } from "../types/role";
import { isSuperAdmin } from "./roleResolver";

export async function resolveUserPermission(
  userId: string,
  permissionKey: string,
  options?: { role?: string | number | null; organizationId?: string | null }
): Promise<boolean> {
  const roleId = getRoleId(options?.role);
  if (roleId === ROLE_ID.SUPER_ADMIN) return true;

  const userDirect = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roleId: true,
      role: {
        select: {
          rolePermissions: {
            where: { permission: { key: permissionKey } },
            select: { permissionId: true },
          },
        },
      },
    },
  });

  if (!userDirect) return false;
  if (getRoleId(userDirect.roleId) === ROLE_ID.SUPER_ADMIN) return true;

  if (userDirect.role && userDirect.role.rolePermissions.length > 0) {
    return true;
  }

  const count = await prisma.userOrganizationRole.count({
    where: {
      userId,
      ...(options?.organizationId ? { organizationId: options.organizationId } : {}),
      role: {
        rolePermissions: { some: { permission: { key: permissionKey } } },
      },
    },
  });

  return count > 0;
}

export interface UserPermissionPayload {
  permissions: string[];
  roles: string[];
  roleDetails: {
    id: number;
    numericId: number;
    name: string;
    isSystemRole: boolean;
  }[];
  isAdmin: boolean;
}

export async function computeUserPermissions(principal: {
  userId: string;
  role?: string | number | null;
  roleId?: number | string | null;
  organizationId?: string | null;
}): Promise<UserPermissionPayload> {
  const { userId, role, roleId, organizationId } = principal;
  const permissionSet = new Set<string>();

  // Baseline permissions for all authenticated users
  permissionSet.add("page:dashboard:view");
  permissionSet.add("dashboard:view");
  permissionSet.add("page:profile:view");
  permissionSet.add("page:settings:view");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roleId: true,
      role: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  });

  if (user?.role) {
    user.role.rolePermissions.forEach((rp) => {
      permissionSet.add(rp.permission.key);
    });
  }

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

  const roles: UserPermissionPayload["roleDetails"] = [];

  if (user?.role) {
    roles.push({
      id: user.role.id,
      numericId: user.role.id,
      name: user.role.name,
      isSystemRole: user.role.isSystemRole,
    });
  }

  userOrgRoles.forEach((assignment: any) => {
    if (!roles.some((r) => r.id === assignment.role.id)) {
      roles.push({
        id: assignment.role.id,
        numericId: assignment.role.id,
        name: assignment.role.name,
        isSystemRole: assignment.role.isSystemRole,
      });
    }
  });

  const isAdmin = isSuperAdmin({ role: roleId ?? role ?? user?.roleId });
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
