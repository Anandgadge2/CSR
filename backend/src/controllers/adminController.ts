import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const getRequestTenantId = (req: AuthenticatedRequest) =>
  (req as any).tenantContext?.tenantId || req.user?.tenantId || null;

const isGlobalAdmin = (req: AuthenticatedRequest) =>
  req.user?.role === Role.MASTER_ADMIN || req.user?.role === Role.SUPER_ADMIN;

const tenantScope = (req: AuthenticatedRequest) => {
  const tenantId = getRequestTenantId(req);
  if (!tenantId || isGlobalAdmin(req)) return {};
  return { tenantId };
};

export const getAdminOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const where = tenantScope(req);
    const [
      users,
      pendingNgos,
      pendingCompanies,
      submittedProjects,
      auditLogs
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.nGO.count({ where: { ...where, status: "PENDING" } }),
      prisma.company.count({ where: { ...where, status: "PENDING" } }),
      prisma.project.count({ where: { ...where, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.auditLog.count({ where })
    ]);

    return res.json({ users, pendingNgos, pendingCompanies, submittedProjects, auditLogs });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const where = tenantScope(req);
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        tenantId: true,
        organizationId: true,
        email: true,
        role: true,
        accountStatus: true,
        isVerified: true,
        ngoId: true,
        companyId: true,
        createdAt: true,
        ngo: { select: { name: true, status: true } },
        company: { select: { name: true, status: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 250
    });

    return res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existingUser) return res.status(404).json({ error: "User not found" });
    if (!isGlobalAdmin(req) && existingUser.tenantId !== getRequestTenantId(req)) {
      return res.status(403).json({ error: "Cannot update a user outside your portal instance" });
    }
    if (existingUser.role === Role.MASTER_ADMIN && req.user?.role !== Role.MASTER_ADMIN) {
      return res.status(403).json({ error: "Master Admin cannot be modified by this account" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: existingUser.tenantId || getRequestTenantId(req),
        userId: req.user?.id,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        action: "ADMIN_USER_ROLE_UPDATE",
        entityType: "USER",
        entityId: req.params.id,
        oldValueJson: { role: existingUser.role },
        newValueJson: { role },
        details: { targetUserId: req.params.id, role }
      }
    });

    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
};
