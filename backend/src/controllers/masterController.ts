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
    const users = await prisma.user.findMany({ where, select: safeUserSelect, orderBy: { createdAt: "desc" }, take: 500 });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
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

