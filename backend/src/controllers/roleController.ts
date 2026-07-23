import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "../utils/apiResponse";

/**
 * Get all roles with search, filter, and pagination
 */
export const getRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      isSystemRole,
      organizationId,
      page = 1,
      limit = 100
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ];
    }
    if (isSystemRole !== undefined) {
      where.isSystemRole = isSystemRole === "true";
    }
    if (organizationId) {
      where.organizationId = String(organizationId);
    }

    const [rolesList, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          rolePermissions: {
            include: { permission: true }
          },
          _count: {
            select: { users: true }
          }
        },
        orderBy: { id: "asc" }
      }),
      prisma.role.count({ where })
    ]);

    const roles = rolesList.map(r => ({
      ...r,
      permissions: r.rolePermissions.map(rp => rp.permission.key)
    }));

    return successResponse(res, {
      roles,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber)
      }
    }, "Roles fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) {
      return validationErrorResponse(res, "Invalid role ID");
    }

    const roleData = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: { permission: true }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    if (!roleData) {
      return notFoundResponse(res, "Role not found");
    }

    const role = {
      ...roleData,
      permissions: roleData.rolePermissions.map(rp => rp.permission.key)
    };

    return successResponse(res, role, "Role fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get permission groups
 */
export const getPermissionGroups = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: { module: "asc" }
    });

    const groupMap = new Map<string, any[]>();
    permissions.forEach(p => {
      const moduleName = p.module || "General";
      if (!groupMap.has(moduleName)) {
        groupMap.set(moduleName, []);
      }
      groupMap.get(moduleName)!.push({
        id: p.id,
        key: p.key,
        name: p.key,
        description: p.description,
        module: p.module
      });
    });

    const groups = Array.from(groupMap.entries()).map(([name, perms]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name,
      permissions: perms
    }));

    return successResponse(res, groups, "Permission groups fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Get pages definition
 */
export const getPages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    return successResponse(res, { pages: [] }, "Pages fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Create custom dynamic role
 */
export const createRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, organizationId, permissionKeys = [] } = req.body;

    if (!name) {
      return validationErrorResponse(res, "Role name is required");
    }

    const existingRole = await prisma.role.findFirst({
      where: { name, organizationId: organizationId || null }
    });

    if (existingRole) {
      return validationErrorResponse(res, "Role name already exists in this scope");
    }

    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } }
    });

    const roleData = await prisma.role.create({
      data: {
        name,
        description,
        isSystemRole: false,
        organizationId: organizationId || null,
        rolePermissions: {
          create: permissions.map(p => ({ permissionId: p.id }))
        }
      },
      include: {
        rolePermissions: { include: { permission: true } }
      }
    });

    const role = {
      ...roleData,
      permissions: roleData.rolePermissions.map(rp => rp.permission.key)
    };

    return successResponse(res, role, "Role created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 */
export const updateRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) {
      return validationErrorResponse(res, "Invalid role ID");
    }

    const { name, description, permissionKeys } = req.body;

    const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existingRole) {
      return notFoundResponse(res, "Role not found");
    }

    if (existingRole.isProtected) {
      return validationErrorResponse(res, "Protected system roles cannot be modified");
    }

    if (Array.isArray(permissionKeys)) {
      await prisma.rolePermission.deleteMany({ where: { roleId } });
      const permissions = await prisma.permission.findMany({
        where: { key: { in: permissionKeys } }
      });
      await prisma.rolePermission.createMany({
        data: permissions.map(p => ({ roleId, permissionId: p.id }))
      });
    }

    const updatedRoleData = await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {})
      },
      include: {
        rolePermissions: { include: { permission: true } }
      }
    });

    const updatedRole = {
      ...updatedRoleData,
      permissions: updatedRoleData.rolePermissions.map(rp => rp.permission.key)
    };

    return successResponse(res, updatedRole, "Role updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 */
export const deleteRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) {
      return validationErrorResponse(res, "Invalid role ID");
    }

    const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existingRole) {
      return notFoundResponse(res, "Role not found");
    }

    if (existingRole.isProtected || existingRole.isSystemRole) {
      return validationErrorResponse(res, "System roles cannot be deleted");
    }

    await prisma.role.delete({ where: { id: roleId } });

    return successResponse(res, "Role deleted successfully");
  } catch (error) {
    next(error);
  }
};
