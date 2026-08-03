import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
import prisma from "../config/db";

/**
 * Middleware to enforce organization onboarding approval requirements.
 * Non-active organizations (REGISTERED, PROFILE_INCOMPLETE, DOCUMENTS_PENDING, UNDER_VERIFICATION, CLARIFICATION_REQUIRED)
 * are denied state-changing business operations (enquiries, pitches, interests, projects, funding).
 * Super Admins and State Cell Officers bypass this check.
 */
export const requireActiveOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const isSuperAdmin = user.role === 1 || user.role === "SUPER_ADMIN" || user.roleId === "1";
    const isStateOfficer = user.role === 2 || user.role === 3 || user.role === "PLANNING_SECRETARY" || user.role === "JOINT_SECRETARY";

    // Super Admins & State Cell Officers bypass organization onboarding requirement
    if (isSuperAdmin || isStateOfficer) {
      return next();
    }

    // If user has no organization associated yet (or system internal role)
    if (!user.organizationId) {
      return res.status(403).json({
        error: "Forbidden: User must belong to an approved organization to perform business actions.",
        code: "ORGANIZATION_REQUIRED",
      });
    }

    // Fetch organization status
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, name: true, kind: true, status: true },
    });

    if (!org) {
      return res.status(403).json({
        error: "Forbidden: Organization record not found.",
        code: "ORGANIZATION_NOT_FOUND",
      });
    }

    if (org.status !== "ACTIVE") {
      return res.status(403).json({
        error: `Forbidden: Organization '${org.name}' onboarding status is '${org.status}'. Active organization status is required to submit enquiries, pitches, or project requests. Please complete onboarding verification first.`,
        code: "ONBOARDING_PENDING",
        organizationStatus: org.status,
        allowedRoutes: [
          "/api/onboarding",
          "/api/profile",
          "/api/documents",
          "/api/helpdesk",
        ],
      });
    }

    return next();
  } catch (error) {
    next(error);
  }
};
