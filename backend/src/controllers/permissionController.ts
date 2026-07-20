import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Role } from "../types/role";
import { successResponse } from "../utils/apiResponse";

/**
 * Get current user's permissions dynamically from database.
 * 100 % DB-driven — no hardcoded fallback map.
 */
export const getCurrentUserPermissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId;

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
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    userOrgRoles.forEach((assignment: any) => {
      assignment.role.rolePermissions.forEach((rolePermission: any) => {
        permissionSet.add(rolePermission.permission.key);
      });
    });

    // Build role list
    const roles: { id: string; numericId: number; name: string; scope: string; isSystemRole: boolean }[] = [];

    if (user?.roleRelation) {
      roles.push({
        id: user.roleRelation.id,
        numericId: (user.roleRelation as any).numericId,
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
          name: assignment.role.name,
          scope: assignment.role.scope,
          isSystemRole: assignment.role.isSystemRole,
        });
      }
    });

    const isAdmin = userRole === Role.SUPER_ADMIN;

    // SUPER_ADMIN gets all permissions
    if (isAdmin) {
      const allPerms = await prisma.permission.findMany({ select: { key: true } });
      allPerms.forEach((p) => permissionSet.add(p.key));
    }

    return successResponse(res, {
      permissions: Array.from(permissionSet),
      roles: roles.map((r) => r.name),
      roleDetails: roles,
      isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permissions for a specific module
 */
export const getModulePermissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { module } = req.params;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const permissionSet = new Set<string>();

    // SUPER_ADMIN gets all module permissions
    if (req.user.role === Role.SUPER_ADMIN) {
      const allPerms = await prisma.permission.findMany({
        where: { module },
        select: { key: true },
      });
      allPerms.forEach((p) => permissionSet.add(p.key));
      return successResponse(res, { module, permissions: Array.from(permissionSet) });
    }

    // User.roleRelation permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        roleRelation: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (user?.roleRelation) {
      user.roleRelation.rolePermissions.forEach((rp) => {
        if (rp.permission.module === module) {
          permissionSet.add(rp.permission.key);
        }
      });
    }

    // UserOrganizationRole permissions
    const userOrgRoles = await prisma.userOrganizationRole.findMany({
      where: {
        userId,
        organizationId: organizationId || undefined,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    userOrgRoles.forEach((assignment: any) => {
      assignment.role.rolePermissions.forEach((rolePermission: any) => {
        if (rolePermission.permission.module === module) {
          permissionSet.add(rolePermission.permission.key);
        }
      });
    });

    return successResponse(res, {
      module,
      permissions: Array.from(permissionSet),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has specific permission
 * POST /api/auth/check-permission
 */
export const checkUserPermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { permission } = req.body;
    if (!permission) {
      return res.status(400).json({ error: "Permission key is required" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin bypass
    if (userRole === Role.SUPER_ADMIN) {
      return successResponse(res, { hasPermission: true, permission });
    }

    // Check via User.roleRelation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        roleRelation: {
          select: {
            rolePermissions: {
              where: { permission: { key: permission } },
              select: { permissionId: true },
            },
          },
        },
      },
    });

    if (user?.roleRelation && user.roleRelation.rolePermissions.length > 0) {
      return successResponse(res, { hasPermission: true, permission });
    }

    // Check via UserOrganizationRole
    const organizationId = req.user.organizationId;
    const userOrgRoles = await prisma.userOrganizationRole.findMany({
      where: {
        userId,
        organizationId: organizationId || undefined,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              where: {
                permission: {
                  key: permission,
                },
              },
            },
          },
        },
      },
    });

    const hasPermission = userOrgRoles.some(
      (assignment: any) => assignment.role.rolePermissions.length > 0
    );

    return successResponse(res, { hasPermission, permission });
  } catch (error) {
    next(error);
  }
};
