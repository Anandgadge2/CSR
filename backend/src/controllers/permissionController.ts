import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { isSuperAdmin } from "../services/roleResolver";
import { computeUserPermissions } from "../services/permissionService";
import { successResponse } from "../utils/apiResponse";

/**
 * Get current user's permissions dynamically from database.
 * 100 % DB-driven — delegates to the shared computeUserPermissions service
 * (the same logic the login handler folds into its response to save a
 * round-trip).
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

    const payload = await computeUserPermissions({
      userId: req.user.id,
      role: req.user.role,
      roleId: req.user.roleId,
      organizationId: req.user.organizationId,
    });

    return successResponse(res, payload);
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
    if (isSuperAdmin({ role: req.user.role, roleId: req.user.roleId })) {
      const allPerms = await prisma.permission.findMany({
        where: { module },
        select: { key: true },
      });
      allPerms.forEach((p) => permissionSet.add(p.key));
      return successResponse(res, { module, permissions: Array.from(permissionSet) });
    }

    if (req.user.roleId) {
      const userRole = await prisma.role.findUnique({
        where: { id: Number(req.user.roleId) },
        include: { rolePermissions: { include: { permission: true } } }
      });
      if (userRole) {
        userRole.rolePermissions.forEach((rp: any) => {
          if (rp.permission.module === module) {
            permissionSet.add(rp.permission.key);
          }
        });
      }
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

    // Admin bypass (recognised on either axis: enum bucket OR slug).
    if (isSuperAdmin({ role: req.user.role, roleSlug: req.user.roleSlug })) {
      return successResponse(res, { hasPermission: true, permission });
    }

    if (req.user.roleId) {
      const rp = await prisma.rolePermission.findFirst({
        where: { roleId: Number(req.user.roleId), permission: { key: permission } }
      });
      if (rp) return successResponse(res, { hasPermission: true, permission });
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
