import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Role } from "../types/role";
import { runEscalationSweep } from "../services/slaSchedulerService";
import SLAEscalationService from "../services/slaEscalationService";
import { createInvitation, InvitationError } from "../services/invitationService";
import { dispatchNotification } from "../services/notificationService";

const getRequestTenantId = (req: AuthenticatedRequest) =>
  (req as any).tenantContext?.tenantId || req.user?.tenantId || null;

const isGlobalAdmin = (req: AuthenticatedRequest) =>
  req.user?.role === Role.SUPER_ADMIN;

const isTopLevelAdminRole = (role: Role) =>
  role === Role.SUPER_ADMIN;

const tenantScope = (req: AuthenticatedRequest) => {
  const tenantId = getRequestTenantId(req);
  if (!tenantId || isGlobalAdmin(req)) return {};
  return {};
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
        organizationId: true,
        email: true,
        role: true,
        accountStatus: true,
        isVerified: true,
        ngoId: true,
        companyId: true,
        assignedDistrict: true,
        createdAt: true,
        roleId: true,
        roleRelation: { select: { id: true, name: true } },
        ngo: { select: { name: true, status: true } },
        company: { select: { name: true, status: true } },
        organizationRoles: {
          include: {
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 250
    });

    return res.json(users);
  } catch (error) {
    next(error);
  }
};

const BASE_DB_ROLES = ["SUPER_ADMIN", "CORPORATE_USER", "GOVERNMENT_OFFICER"];

export const createAdminUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, role, assignedDistrict, accountStatus = "ACTIVE" } = req.body;

    // Role may be a base platform enum value OR the name of a dynamic
    // OrganizationRole from the RBAC engine — never a hardcoded list.
    const dbRole = BASE_DB_ROLES.includes(role) ? (role as any) : null;
    const orgRole = !dbRole
      ? await prisma.organizationRole.findFirst({ where: { name: role, status: "ACTIVE" } })
      : null;
    if (!dbRole && !orgRole) {
      return res.status(400).json({ error: `Unknown role '${role}'. Use a base platform role or an active dynamic role.` });
    }
    if (req.user?.role === Role.PORTAL_ADMIN && isTopLevelAdminRole(dbRole)) {
      return res.status(403).json({ error: "Portal Admin cannot create Super Admin users" });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    // SECURITY: if no password is supplied, create the account with an
    // unusable random hash and send a secure single-use invitation link
    // instead — passwords are never generated or emailed by the platform.
    const useInvitation = !password;
    const passwordHash = await bcrypt.hash(
      useInvitation ? crypto.randomBytes(32).toString("hex") : password,
      10
    );

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: dbRole,
        roleId: orgRole?.id || null,
        accountStatus: useInvitation ? "PENDING_ACTIVATION" : accountStatus,
        isVerified: !useInvitation,
        assignedDistrict: assignedDistrict || null,
      },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        roleId: true,
        roleRelation: { select: { id: true, name: true } },
        accountStatus: true,
        isVerified: true,
        assignedDistrict: true,
        createdAt: true,
      },
    });

    let invitationSent = false;
    if (useInvitation && req.user?.id) {
      try {
        const { activationUrl } = await createInvitation({
          userId: user.id,
          email: normalizedEmail,
          createdById: req.user.id,
          purpose: "ADMIN_USER_ACTIVATION",
        });
        await dispatchNotification({
          recipientId: user.id,
          templateName: "ORG_USER_INVITED",
          variables: {
            fullName: normalizedEmail,
            roleName: orgRole?.name || dbRole || "User",
            expiresInHours: process.env.INVITATION_TTL_HOURS || "72",
          },
          actionButtonUrl: activationUrl,
        }).catch((notifyError) => console.error("Invitation notification failed:", notifyError));
        invitationSent = true;
      } catch (invError) {
        if (invError instanceof InvitationError) {
          return res.status(invError.status).json({ error: invError.message });
        }
        throw invError;
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        action: "ADMIN_USER_CREATED",
        entityType: "USER",
        entityId: user.id,
        details: {
          email: user.email,
          role: user.role,
          dynamicRole: orgRole?.name || null,
          assignedDistrict: user.assignedDistrict,
          accountStatus: user.accountStatus,
          invitationSent,
        },
      },
    });

    return res.status(201).json({ ...user, invitationSent });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { role, assignedDistrict, accountStatus } = req.body;
    if (role !== null && role !== undefined && role !== "" && !Object.values(Role).includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existingUser) return res.status(404).json({ error: "User not found" });
    if (!isGlobalAdmin(req) && ((existingUser as any).tenantId) !== getRequestTenantId(req)) {
      return res.status(403).json({ error: "Cannot update a user outside your portal instance" });
    }
    if (req.user?.role === Role.PORTAL_ADMIN && (isTopLevelAdminRole(existingUser.role as any) || isTopLevelAdminRole(role))) {
      return res.status(403).json({ error: "Portal Admin cannot modify Super Admin access" });
    }

    const roleProvided = Object.prototype.hasOwnProperty.call(req.body, "role");
    const dbRole = ["SUPER_ADMIN", "CORPORATE_USER", "GOVERNMENT_OFFICER"].includes(role) ? (role as any) : null;
    const orgRole = (!dbRole && role) ? (await prisma.organizationRole.findFirst({ where: { name: role } })) : null;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        // Only touch role fields when the caller explicitly sent a role value —
        // otherwise a status-only or district-only PATCH would wipe the role.
        ...(roleProvided ? { role: dbRole, roleId: orgRole?.id || null } : {}),
        assignedDistrict: assignedDistrict ?? existingUser.assignedDistrict,
        accountStatus: accountStatus ?? existingUser.accountStatus,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        action: "ADMIN_USER_ROLE_UPDATE",
        entityType: "USER",
        entityId: req.params.id,
        oldValueJson: {
          role: existingUser.role,
          assignedDistrict: existingUser.assignedDistrict,
          accountStatus: existingUser.accountStatus,
        },
        newValueJson: { role, assignedDistrict: user.assignedDistrict, accountStatus: user.accountStatus },
        details: { targetUserId: req.params.id, role, assignedDistrict: user.assignedDistrict, accountStatus: user.accountStatus }
      }
    });

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      roleRelation: orgRole ? { id: orgRole.id, name: orgRole.name } : null,
      assignedDistrict: user.assignedDistrict,
      accountStatus: user.accountStatus
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existingUser) return res.status(404).json({ error: "User not found" });
    if (existingUser.id === req.user?.id) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }
    if (req.user?.role === Role.PORTAL_ADMIN && isTopLevelAdminRole(existingUser.role as any)) {
      return res.status(403).json({ error: "Portal Admin cannot delete Super Admin users" });
    }
    if ((existingUser as any).isSystemSeeded) {
      return res.status(403).json({ error: "System-seeded accounts cannot be deleted" });
    }

    try {
      await prisma.user.delete({ where: { id: req.params.id } });
    } catch (deleteError: any) {
      // FK restrictions (audit history, assignments, etc.) — soft-disable instead.
      if (deleteError?.code === "P2003") {
        await prisma.user.update({
          where: { id: req.params.id },
          data: { accountStatus: "SUSPENDED", isVerified: false, refreshToken: null }
        });
        await prisma.auditLog.create({
          data: {
            userId: req.user?.id,
            actorUserId: req.user?.id,
            actorRole: req.user?.role,
            action: "ADMIN_USER_SOFT_DELETED",
            entityType: "USER",
            entityId: req.params.id,
            details: { email: existingUser.email, reason: "User has linked records; account suspended instead of hard delete" }
          }
        });
        return res.json({ id: req.params.id, deleted: false, suspended: true, message: "User has linked records and was suspended instead of deleted." });
      }
      throw deleteError;
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        action: "ADMIN_USER_DELETED",
        entityType: "USER",
        entityId: req.params.id,
        details: { email: existingUser.email, role: existingUser.role }
      }
    });

    return res.json({ id: req.params.id, deleted: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually trigger the SLA escalation sweep.
 *
 * The scheduler runs this automatically on an interval, but this endpoint lets
 * an admin force a sweep on demand and is also the entry point for an external
 * cron on serverless deployments (where interval timers don't run).
 */
export const runSlaEscalations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await runEscalationSweep();
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: "SLA_ESCALATION_SWEEP_TRIGGERED",
        details: result
      }
    });
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Return SLA compliance statistics for the admin dashboard.
 */
export const getSlaStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await SLAEscalationService.getStatistics();
    return res.json(stats);
  } catch (error) {
    next(error);
  }
};
