import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "../utils/apiResponse";
import {
  PERMISSIONS,
  PAGE_PERMISSIONS,
  PAGE_REGISTRY,
  SEED_ROLE_PERMISSIONS,
  resolveSeedRolePermissionKeys
} from "../config/platformAccess";

const SYSTEM_ROLES_ARRAY = [
  { id: 1, name: "SUPER_ADMIN", description: "Super Administrator" },
  { id: 2, name: "PLANNING_SECRETARY", description: "Planning Secretary" },
  { id: 3, name: "JOINT_SECRETARY", description: "Joint Secretary" },
  { id: 4, name: "DISTRICT_NODAL_OFFICER", description: "District Nodal Officer" },
  { id: 5, name: "DISTRICT_NODAL_CONSULTANT", description: "District Nodal Consultant" },
  { id: 6, name: "RELATIONSHIP_MANAGER", description: "Relationship Manager" },
  { id: 7, name: "GOVERNMENT_OFFICER", description: "Government Department Officer" },
  { id: 8, name: "COMPANY_ADMIN", description: "CSR Corporate Admin" },
  { id: 9, name: "NGO_ADMIN", description: "Implementing Agency / NGO Admin" },
];

/**
 * Auto-seed permissions and system role mappings if missing or empty in database.
 */
let isSeeded = false;

export const ensurePermissionsSeeded = async () => {
  if (isSeeded) return;
  try {
    const allDefs = [
      ...PERMISSIONS.map(([key, description, module]) => ({ key, description, module })),
      ...PAGE_PERMISSIONS.map(([key, description, module]) => ({ key, description, module }))
    ];

    await prisma.permission.createMany({
      data: allDefs,
      skipDuplicates: true,
    });

    for (const sysRole of SYSTEM_ROLES_ARRAY) {
      let roleRecord = await prisma.role.findFirst({
        where: { name: sysRole.name }
      });

      if (!roleRecord) {
        try {
          roleRecord = await prisma.role.create({
            data: {
              id: sysRole.id,
              name: sysRole.name,
              description: sysRole.description,
              isSystemRole: true,
              isProtected: true
            }
          });
        } catch {
          roleRecord = await prisma.role.findFirst({ where: { name: sysRole.name } });
        }
      }

      if (roleRecord) {
        const rolePermKeys = resolveSeedRolePermissionKeys(sysRole.name);
        if (rolePermKeys.length > 0) {
          const permsInDb = await prisma.permission.findMany({
            where: { key: { in: rolePermKeys as string[] } },
            select: { id: true }
          });

          if (permsInDb.length > 0) {
            await prisma.rolePermission.createMany({
              data: permsInDb.map((p) => ({
                roleId: roleRecord.id,
                permissionId: p.id,
              })),
              skipDuplicates: true,
            });
          }
        }
      }
    }
    isSeeded = true;
  } catch (err) {
    console.error("[RBAC Engine] Error seeding permissions:", err);
  }
};

/**
 * Get all roles with search, filter, and pagination
 */
export const getRoles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await ensurePermissionsSeeded();

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
      isPermanent: r.name === "SUPER_ADMIN" || r.id === 1,
      status: "ACTIVE",
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
    await ensurePermissionsSeeded();

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
      isPermanent: roleData.name === "SUPER_ADMIN" || roleData.id === 1,
      status: "ACTIVE",
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
    await ensurePermissionsSeeded();

    const permissions = await prisma.permission.findMany({
      orderBy: { module: "asc" }
    });

    const groupMap = new Map<string, any[]>();
    permissions.forEach(p => {
      const moduleName = p.module ? (p.module.charAt(0).toUpperCase() + p.module.slice(1)) : "General";
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
      description: null,
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
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const pages = PAGE_REGISTRY.map(([slug, label, route, group]) => ({
      slug,
      label,
      route,
      group,
      permissionKey: `page:${slug}:view`
    }));
    return successResponse(res, { pages }, "Pages fetched successfully");
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
    const { name, description, organizationId, permissions = [] } = req.body;

    if (!name) {
      return validationErrorResponse(res, "Role name is required");
    }

    const existingRole = await prisma.role.findFirst({
      where: { name, organizationId: organizationId || null }
    });

    if (existingRole) {
      return validationErrorResponse(res, "Role name already exists");
    }

    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
        organizationId: organizationId || null,
        isSystemRole: false,
        isProtected: false
      }
    });

    if (Array.isArray(permissions) && permissions.length > 0) {
      const permsInDb = await prisma.permission.findMany({
        where: { key: { in: permissions } },
        select: { id: true }
      });

      await prisma.rolePermission.createMany({
        data: permsInDb.map(p => ({
          roleId: role.id,
          permissionId: p.id
        }))
      });
    }

    return successResponse(res, role, "Role created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update role and save permissions matrix
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

    const { name, description, permissions } = req.body;

    const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existingRole) {
      return notFoundResponse(res, "Role not found");
    }

    const isSuperAdminRole = existingRole.name === "SUPER_ADMIN" || existingRole.id === 1;

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(name && !existingRole.isSystemRole && !existingRole.isProtected ? { name } : {}),
        ...(description !== undefined ? { description } : {})
      }
    });

    if (Array.isArray(permissions) && !isSuperAdminRole) {
      await prisma.rolePermission.deleteMany({ where: { roleId } });
      const permsInDb = await prisma.permission.findMany({
        where: { key: { in: permissions } },
        select: { id: true }
      });
      if (permsInDb.length > 0) {
        await prisma.rolePermission.createMany({
          data: permsInDb.map(p => ({
            roleId,
            permissionId: p.id
          }))
        });
      }
    }

    return successResponse(res, updatedRole, "Role updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Clone role
 */
export const cloneRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) return validationErrorResponse(res, "Invalid role ID");

    const { newName, newDescription } = req.body;
    if (!newName) return validationErrorResponse(res, "New role name is required");

    const sourceRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } }
    });

    if (!sourceRole) return notFoundResponse(res, "Source role not found");

    const cloned = await prisma.role.create({
      data: {
        name: newName,
        description: newDescription || sourceRole.description,
        isSystemRole: false,
        isProtected: false
      }
    });

    const permIds = sourceRole.rolePermissions.map(rp => rp.permissionId);
    if (permIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permIds.map(permissionId => ({
          roleId: cloned.id,
          permissionId
        }))
      });
    }

    return successResponse(res, cloned, "Role cloned successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete custom role
 */
export const deleteRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) return validationErrorResponse(res, "Invalid role ID");

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return notFoundResponse(res, "Role not found");
    if (role.isProtected || role.isSystemRole) {
      return validationErrorResponse(res, "System roles cannot be deleted");
    }

    await prisma.rolePermission.deleteMany({ where: { roleId } });
    await prisma.role.delete({ where: { id: roleId } });

    return successResponse(res, null, "Role deleted successfully");
  } catch (error) {
    next(error);
  }
};
