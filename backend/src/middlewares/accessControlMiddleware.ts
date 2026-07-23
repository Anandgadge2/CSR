import { NextFunction, Response } from "express";
import { OrganizationKind, OrganizationStatus } from "@prisma/client";
import { Role } from "../types/role";
import prisma from "../config/db";
import { AuthenticatedRequest } from "./authMiddleware";
import { resolveUserPermission } from "../services/permissionService";

const auditBlockedAccess = async (req: AuthenticatedRequest, action: string, details: Record<string, unknown>) => {
  await prisma.auditLog.create({
    data: {
      actorUserId: req.user?.id || null,
      action,
      entityType: "ACCESS_GUARD",
      details: details as any,
      ipAddress: req.ip
    }
  }).catch(() => {});
};

export const checkOrganizationApproved = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (
      req.user?.role === Role.SUPER_ADMIN ||
      req.user?.role === Role.GOVERNMENT_OFFICER
    ) return next();
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      await auditBlockedAccess(req, "ONBOARDING_ACCESS_BLOCKED", { reason: "MISSING_ORGANIZATION", path: req.originalUrl });
      return res.status(403).json({
        error: "Your organization onboarding is pending approval. You can access portal operations after approval from Portal Admin.",
        redirectTo: "/organization/onboarding/status"
      });
    }

    const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (
      !organization ||
      organization.status !== OrganizationStatus.ACTIVE
    ) {
      await auditBlockedAccess(req, "ONBOARDING_ACCESS_BLOCKED", {
        reason: "ORGANIZATION_NOT_APPROVED",
        organizationId,
        path: req.originalUrl
      });
      return res.status(403).json({
        error: "Your organization onboarding is pending approval. You can access portal operations after approval from Portal Admin.",
        redirectTo: "/organization/onboarding/status"
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Permission-based access control — 100 % DB-driven.
 * SUPER_ADMIN enum always bypasses. All other users are resolved via
 * their OrganizationRole DB permissions.
 */
export const checkPermission = (permissionKey: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized access" });
      if (req.user.role === Role.SUPER_ADMIN) return next();

      const hasPermission = await resolveUserPermission(req.user.id, permissionKey, {
        role: req.user.role,
        organizationId: req.user.organizationId || undefined
      });

      if (!hasPermission) {
        await auditBlockedAccess(req, "PERMISSION_ACCESS_BLOCKED", { permissionKey, path: req.originalUrl });
        return res.status(403).json({ error: `Forbidden: missing permission '${permissionKey}'` });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

/**
 * Submission gate: the authenticated user's OWN organization must be of the
 * required kind AND fully onboarded (status ACTIVE + onboardingStatus APPROVED).
 *
 * Unlike checkOrganizationApproved, this has NO role bypass — a GOVERNMENT_OFFICER
 * is exactly who must be gated before filing a pitch, and a CORPORATE_USER before
 * filing an enquiry. SUPER_ADMIN is the only exception (platform operator).
 *
 * Used to gate corporate enquiry creation (CSR_COMPANY) and government pitch
 * creation (GOVERNMENT_DEPARTMENT) behind verified onboarding.
 */
export const requireApprovedOrganization = (requiredKind: OrganizationKind) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" });
      if (req.user.role === Role.SUPER_ADMIN) return next();

      const organizationId = req.user.organizationId;
      if (!organizationId) {
        await auditBlockedAccess(req, "SUBMISSION_BLOCKED", { reason: "MISSING_ORGANIZATION", path: req.originalUrl });
        return res.status(403).json({
          error: "Complete your organization onboarding before submitting.",
          redirectTo: "/organization/onboarding/status"
        });
      }

      const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

      if (!organization || organization.kind !== requiredKind) {
        await auditBlockedAccess(req, "SUBMISSION_BLOCKED", {
          reason: "WRONG_ORGANIZATION_KIND",
          organizationId,
          requiredKind,
          actualKind: organization?.kind,
          path: req.originalUrl
        });
        return res.status(403).json({ error: "This action is not available for your organization type." });
      }

      if (organization.status !== OrganizationStatus.ACTIVE) {
        await auditBlockedAccess(req, "SUBMISSION_BLOCKED", {
          reason: "ORGANIZATION_NOT_APPROVED",
          organizationId,
          status: organization.status,
          path: req.originalUrl
        });
        return res.status(403).json({
          error: "Your organization onboarding is pending verification. You can submit after Super Admin approval.",
          redirectTo: "/organization/onboarding/status"
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
