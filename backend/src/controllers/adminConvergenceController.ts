import { Response, NextFunction } from "express";
import { GrievanceStatus, OrganizationStatus } from "@prisma/client";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const PENDING_ONBOARDING_STATUSES = [
  OrganizationStatus.DOCUMENTS_PENDING,
  OrganizationStatus.UNDER_VERIFICATION,
  OrganizationStatus.CLARIFICATION_REQUIRED
];

const OPEN_GRIEVANCE_STATUSES = [
  GrievanceStatus.RAISED,
  GrievanceStatus.ACKNOWLEDGED,
  GrievanceStatus.LEVEL_1_REVIEW,
  GrievanceStatus.ESCALATED_TO_STATE_CELL,
  GrievanceStatus.ESCALATED_TO_JS_SECRETARY
];

export const listPitchInterests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;

    const interests = await prisma.corporatePitchInterest.findMany({
      where: {
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 250
    });

    return res.json({ success: true, data: interests });
  } catch (error) {
    next(error);
  }
};

export const getConvergenceOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [projects, totalOrgs, totalAuditLogs] = await Promise.all([
      prisma.project.findMany({
        where: { type: "CONVERGENCE_FRAMEWORK" },
        select: {
          id: true,
          title: true,
          approvedBudget: true,
          committedAmount: true,
          utilizedAmount: true,
          status: true,
          district: true,
          sector: true,
          createdAt: true
        }
      }),
      prisma.organization.count({ where: { status: { in: PENDING_ONBOARDING_STATUSES } } }),
      prisma.auditLog.count()
    ]);

    const totalBudget = projects.reduce((sum, p) => sum + Number(p.approvedBudget || 0), 0);
    const totalCommitted = projects.reduce((sum, p) => sum + Number(p.committedAmount || 0), 0);
    const totalUtilized = projects.reduce((sum, p) => sum + Number(p.utilizedAmount || 0), 0);

    return res.json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalBudget,
        totalCommitted,
        totalUtilized,
        pendingOnboarding: totalOrgs,
        totalAuditLogs
      }
    });
  } catch (error) {
    next(error);
  }
};
