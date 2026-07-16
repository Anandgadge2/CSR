import { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db";
import { OrganizationKind, OrganizationOnboardingStatus, OrganizationStatus, Role, RoleScope, TenantStatus } from "@prisma/client";
import { TenantAwareRequest } from "../middlewares/tenantMiddleware";
import { TENANT_FEATURES } from "../config/platformAccess";

const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  accountStatus: true,
  isVerified: true,
  tenantId: true,
  organizationId: true,
  ngoId: true,
  companyId: true,
  assignedDistrict: true,
  isSystemSeeded: true,
  createdAt: true,
  updatedAt: true
} as const;

const audit = async (req: TenantAwareRequest, action: string, entityType: string, entityId: string | null, details: Record<string, unknown>) => {
  await prisma.auditLog.create({
    data: {
      tenantId: req.tenantContext?.tenantId || null,
      userId: req.user?.id,
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      action,
      entityType,
      entityId,
      details: details as any,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || null
    }
  });
};

export const listTenants = async (_req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { _count: { select: { organizations: true, features: true } } },
      orderBy: { createdAt: "desc" }
    });
    return res.json(tenants);
  } catch (error) {
    return next(error);
  }
};

export const createTenant = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { name, code, state, domain, logo, primaryColor, secondaryColor, configJson } = req.body;
    const tenant = await prisma.tenant.create({
      data: {
        name,
        code,
        state,
        domain,
        logo,
        primaryColor,
        secondaryColor,
        configJson,
        features: {
          create: TENANT_FEATURES.map((featureKey) => ({ featureKey, isEnabled: true }))
        }
      },
      include: { features: true }
    });
    await audit(req, "TENANT_CREATED", "Tenant", tenant.id, { code, name });
    return res.status(201).json(tenant);
  } catch (error) {
    return next(error);
  }
};

export const getTenant = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: { features: { orderBy: { featureKey: "asc" } }, organizations: { take: 25, orderBy: { createdAt: "desc" } } }
    });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
};

export const updateTenant = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { name, code, state, domain, logo, primaryColor, secondaryColor, configJson, isHidden } = req.body;
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: { name, code, state, domain, logo, primaryColor, secondaryColor, configJson, isHidden }
    });
    await audit(req, "TENANT_UPDATED", "Tenant", tenant.id, { name, code });
    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
};

export const updateTenantStatus = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: { status: req.body.status as TenantStatus, isHidden: req.body.isHidden }
    });
    await audit(req, "TENANT_STATUS_UPDATED", "Tenant", tenant.id, { status: tenant.status, isHidden: tenant.isHidden });
    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
};

export const deleteTenant = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: { status: TenantStatus.DELETED, isHidden: true }
    });
    await audit(req, "TENANT_SOFT_DELETED", "Tenant", tenant.id, {});
    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
};

export const getTenantFeatures = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    await ensureTenantFeatures(req.params.id, req.user?.id);
    const features = await prisma.tenantFeature.findMany({
      where: { tenantId: req.params.id },
      orderBy: { featureKey: "asc" }
    });
    return res.json(features);
  } catch (error) {
    return next(error);
  }
};

export const updateTenantFeatures = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const updates = Array.isArray(req.body.features) ? req.body.features : [];
    await ensureTenantFeatures(req.params.id, req.user?.id);
    await prisma.$transaction(
      updates.map((feature: { featureKey: string; isEnabled: boolean; configJson?: unknown }) =>
        prisma.tenantFeature.upsert({
          where: { tenantId_featureKey: { tenantId: req.params.id, featureKey: feature.featureKey } },
          update: { isEnabled: feature.isEnabled, configJson: feature.configJson as any, updatedBy: req.user?.id },
          create: { tenantId: req.params.id, featureKey: feature.featureKey, isEnabled: feature.isEnabled, configJson: feature.configJson as any, updatedBy: req.user?.id }
        })
      )
    );
    await audit(req, "TENANT_FEATURES_UPDATED", "Tenant", req.params.id, { count: updates.length });
    return getTenantFeatures(req, res, next);
  } catch (error) {
    return next(error);
  }
};

const ensureTenantFeatures = async (tenantId: string, updatedBy?: string) => {
  await prisma.$transaction(
    TENANT_FEATURES.map((featureKey) =>
      prisma.tenantFeature.upsert({
        where: { tenantId_featureKey: { tenantId, featureKey } },
        update: {},
        create: { tenantId, featureKey, isEnabled: true, updatedBy }
      })
    )
  );
};

export const listOrganizations = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { tenantId, organizationType, status, onboardingStatus, search } = req.query;
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (organizationType) where.organizationType = organizationType as OrganizationKind;
    if (status) where.status = status as OrganizationStatus;
    if (onboardingStatus) where.onboardingStatus = onboardingStatus as OrganizationOnboardingStatus;
    if (search) where.name = { contains: search as string, mode: "insensitive" };

    const organizations = await prisma.organization.findMany({
      where,
      include: { tenant: { select: { id: true, name: true, code: true } }, _count: { select: { userRoles: true, documents: true } } },
      orderBy: { createdAt: "desc" },
      take: 250
    });
    return res.json(organizations);
  } catch (error) {
    return next(error);
  }
};

export const createOrganization = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const organization = await prisma.organization.create({
      data: {
        tenantId: req.body.tenantId,
        organizationType: req.body.organizationType,
        name: req.body.name,
        registrationNumber: req.body.registrationNumber,
        pan: req.body.pan,
        gst: req.body.gst,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        district: req.body.district,
        taluka: req.body.taluka,
        onboardingStatus: req.body.onboardingStatus || OrganizationOnboardingStatus.REGISTERED,
        status: req.body.status || OrganizationStatus.ACTIVE
      }
    });
    await audit(req, "ORGANIZATION_CREATED", "Organization", organization.id, { tenantId: organization.tenantId, name: organization.name });
    return res.status(201).json(organization);
  } catch (error) {
    return next(error);
  }
};

export const updateOrganization = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const organization = await prisma.organization.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        registrationNumber: req.body.registrationNumber,
        pan: req.body.pan,
        gst: req.body.gst,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        district: req.body.district,
        taluka: req.body.taluka,
        onboardingStatus: req.body.onboardingStatus,
        status: req.body.status,
        clarificationRemarks: req.body.clarificationRemarks,
        rejectionReason: req.body.rejectionReason
      }
    });
    await audit(req, "ORGANIZATION_UPDATED", "Organization", organization.id, { name: organization.name });
    return res.json(organization);
  } catch (error) {
    return next(error);
  }
};

export const deleteOrganization = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const organization = await prisma.organization.update({
      where: { id: req.params.id },
      data: { status: OrganizationStatus.DELETED }
    });
    await audit(req, "ORGANIZATION_SOFT_DELETED", "Organization", organization.id, {});
    return res.json(organization);
  } catch (error) {
    return next(error);
  }
};

export const listAuditLogs = async (_req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: safeUserSelect } },
      orderBy: { createdAt: "desc" },
      take: 500
    });
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
};

export const listUsers = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { tenantId, organizationId, role } = req.query;
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (organizationId) where.organizationId = organizationId;
    if (role) where.role = role;
    const users = await prisma.user.findMany({
      where,
      select: { ...safeUserSelect, organizationRoles: { select: { id: true, role: { select: { id: true, name: true, scope: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 500
    });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    if (req.body.role === Role.MASTER_ADMIN) {
      return res.status(403).json({ error: "Master Admin accounts cannot be created through the portal" });
    }
    if (!req.body.email || !req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ error: "Email and a password of at least 6 characters are required" });
    }
    const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        passwordHash,
        role: req.body.role || Role.NGO_MEMBER,
        tenantId: req.body.tenantId,
        organizationId: req.body.organizationId,
        isVerified: true,
        accountStatus: req.body.accountStatus || "ACTIVE"
      },
      select: safeUserSelect
    });
    await audit(req, "USER_CREATED_BY_MASTER", "User", user.id, { email: user.email, role: user.role });
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { email, role, accountStatus, isVerified, tenantId, organizationId } = req.body;
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { role: true } });
    if (!target) return res.status(404).json({ error: "User not found" });
    // Master Admin is immutable — no account (including master) can alter it,
    // and nobody can be promoted to Master Admin through the portal.
    if (target.role === Role.MASTER_ADMIN) {
      return res.status(403).json({ error: "Master Admin cannot be modified" });
    }
    if (role === Role.MASTER_ADMIN) {
      return res.status(403).json({ error: "Users cannot be promoted to Master Admin" });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email,
        role,
        accountStatus,
        isVerified: typeof isVerified === "boolean" ? isVerified : undefined,
        tenantId: tenantId || null,
        organizationId: organizationId || null
      },
      select: safeUserSelect
    });
    await audit(req, "USER_UPDATED_BY_MASTER", "User", user.id, { email: user.email, role: user.role });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { role: true } });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (target.role === Role.MASTER_ADMIN) {
      return res.status(403).json({ error: "Master Admin cannot be deleted" });
    }
    const user = await prisma.user.delete({
      where: { id: req.params.id }
    });
    await audit(req, "USER_DELETED_BY_MASTER", "User", user.id, { email: user.email });
    return res.json(user);
  } catch (error: any) {
    // If foreign key constraints block hard deletion, fallback to deactivating/soft-deleting
    try {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { accountStatus: "DELETED" as any }
      });
      await audit(req, "USER_SOFT_DELETED_BY_MASTER", "User", user.id, { email: user.email });
      return res.json(user);
    } catch (e) {
      return next(error);
    }
  }
};

// ─── Roles & Permissions (Master Admin) ──────────────────────────────

/** Standard permission catalog, grouped by module. Upserted on first use. */
const PERMISSION_CATALOG: { key: string; module: string; description: string }[] = [
  { key: "users.view", module: "User Management", description: "View users" },
  { key: "users.manage", module: "User Management", description: "Create, edit and deactivate users" },
  { key: "roles.manage", module: "User Management", description: "Create and edit roles and permissions" },
  { key: "organizations.view", module: "Organizations", description: "View organizations" },
  { key: "organizations.manage", module: "Organizations", description: "Create, edit and verify organizations" },
  { key: "enquiries.view", module: "Enquiry & Pitch", description: "View corporate enquiries" },
  { key: "enquiries.manage", module: "Enquiry & Pitch", description: "Assign RMs and record contact on enquiries" },
  { key: "pitches.manage", module: "Enquiry & Pitch", description: "Verify and approve government pitches" },
  { key: "feasibility.manage", module: "Feasibility", description: "Fill and submit 13-point feasibility assessments" },
  { key: "projects.view", module: "Projects", description: "View convergence projects" },
  { key: "projects.manage", module: "Projects", description: "Onboard, update and complete projects" },
  { key: "milestones.update", module: "Progress Tracking", description: "Update milestone status and geo-tagged photos" },
  { key: "milestones.verify", module: "Progress Tracking", description: "Certify milestones as Nodal Officer" },
  { key: "uc.upload", module: "Finance & Compliance", description: "Upload utilization certificates" },
  { key: "uc.verify", module: "Finance & Compliance", description: "Approve utilization certificates" },
  { key: "grievances.manage", module: "Grievance", description: "Resolve and escalate grievances" },
  { key: "helpdesk.resolve", module: "Helpdesk", description: "Resolve public helpdesk queries" },
  { key: "reports.view", module: "Analytics & Reports", description: "View analytics and reports" },
  { key: "reports.export", module: "Analytics & Reports", description: "Export reports" },
  { key: "audit.view", module: "Audit", description: "View audit logs" },
  { key: "settings.manage", module: "Settings", description: "Manage portal settings and features" },
];

const ensurePermissionCatalog = async () => {
  const count = await prisma.permission.count();
  if (count >= PERMISSION_CATALOG.length) return;
  for (const item of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { key: item.key },
      update: { module: item.module, description: item.description },
      create: item,
    });
  }
};

export const listPermissions = async (_req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    await ensurePermissionCatalog();
    const permissions = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { key: "asc" }] });
    return res.json(permissions);
  } catch (error) {
    return next(error);
  }
};

export const listRoles = async (_req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.organizationRole.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
        organization: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return res.json(roles);
  } catch (error) {
    return next(error);
  }
};

export const createRole = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, scope, tenantId, organizationId, permissionKeys } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ error: "Role name is required" });
    if (!scope || !Object.values(RoleScope).includes(scope)) {
      return res.status(400).json({ error: `scope must be one of: ${Object.values(RoleScope).join(", ")}` });
    }
    await ensurePermissionCatalog();

    const permissions = Array.isArray(permissionKeys) && permissionKeys.length > 0
      ? await prisma.permission.findMany({ where: { key: { in: permissionKeys } } })
      : [];

    const role = await prisma.organizationRole.create({
      data: {
        name: String(name).trim(),
        description: description || null,
        scope,
        tenantId: tenantId || null,
        organizationId: organizationId || null,
        createdBy: req.user?.id,
        rolePermissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
      },
      include: { rolePermissions: { include: { permission: true } } },
    });

    await audit(req, "ROLE_CREATED_BY_MASTER", "OrganizationRole", role.id, { name: role.name, scope, permissionKeys });
    return res.status(201).json(role);
  } catch (error: any) {
    if (error?.code === "P2002") return res.status(409).json({ error: "A role with this name already exists in this scope" });
    return next(error);
  }
};

export const updateRole = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissionKeys } = req.body;
    const existing = await prisma.organizationRole.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Role not found" });

    await ensurePermissionCatalog();

    const role = await prisma.$transaction(async (tx) => {
      if (Array.isArray(permissionKeys)) {
        const permissions = await tx.permission.findMany({ where: { key: { in: permissionKeys } } });
        await tx.organizationRolePermission.deleteMany({ where: { roleId: req.params.id } });
        await tx.organizationRolePermission.createMany({
          data: permissions.map((p) => ({ roleId: req.params.id, permissionId: p.id })),
        });
      }
      return tx.organizationRole.update({
        where: { id: req.params.id },
        data: {
          name: name ? String(name).trim() : undefined,
          description: description !== undefined ? description : undefined,
        },
        include: { rolePermissions: { include: { permission: true } } },
      });
    });

    await audit(req, "ROLE_UPDATED_BY_MASTER", "OrganizationRole", role.id, { name: role.name, permissionKeys });
    return res.json(role);
  } catch (error: any) {
    if (error?.code === "P2002") return res.status(409).json({ error: "A role with this name already exists in this scope" });
    return next(error);
  }
};

export const deleteRole = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.organizationRole.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { userRoles: true } } },
    });
    if (!existing) return res.status(404).json({ error: "Role not found" });
    if (existing.isSystemRole) return res.status(403).json({ error: "System roles cannot be deleted" });

    await prisma.organizationRole.delete({ where: { id: req.params.id } });
    await audit(req, "ROLE_DELETED_BY_MASTER", "OrganizationRole", req.params.id, {
      name: existing.name,
      hadAssignments: existing._count.userRoles,
    });
    return res.json({ message: "Role deleted" });
  } catch (error) {
    return next(error);
  }
};

export const assignRoleToUser = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const { roleId } = req.body;
    if (!roleId) return res.status(400).json({ error: "roleId is required" });

    const [user, role] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, role: true, organizationId: true, tenantId: true } }),
      prisma.organizationRole.findUnique({ where: { id: roleId } }),
    ]);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!role) return res.status(404).json({ error: "Role not found" });
    if (user.role === Role.MASTER_ADMIN) return res.status(403).json({ error: "Master Admin cannot be modified" });

    const existing = await prisma.userOrganizationRole.findFirst({
      where: { userId: user.id, roleId: role.id },
    });
    if (existing) return res.json(existing);

    const assignment = await prisma.userOrganizationRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        organizationId: role.organizationId ?? user.organizationId ?? null,
        tenantId: role.tenantId ?? user.tenantId ?? null,
      },
      include: { role: { select: { id: true, name: true, scope: true } } },
    });

    await audit(req, "ROLE_ASSIGNED_BY_MASTER", "UserOrganizationRole", assignment.id, { userId: user.id, roleId: role.id });
    return res.status(201).json(assignment);
  } catch (error) {
    return next(error);
  }
};

export const removeRoleFromUser = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { role: true } });
    if (target?.role === Role.MASTER_ADMIN) return res.status(403).json({ error: "Master Admin cannot be modified" });
    await prisma.userOrganizationRole.deleteMany({
      where: { userId: req.params.id, roleId: req.params.roleId },
    });
    await audit(req, "ROLE_REMOVED_BY_MASTER", "UserOrganizationRole", null, { userId: req.params.id, roleId: req.params.roleId });
    return res.json({ message: "Role removed" });
  } catch (error) {
    return next(error);
  }
};

