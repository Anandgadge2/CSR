import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let totalProjects = 0;
    try {
      totalProjects = await (prisma as any).convergenceProject?.count() ?? await (prisma as any).project?.count() ?? 0;
    } catch {
      totalProjects = 0;
    }

    let totalOrgs = 0;
    try {
      totalOrgs = await prisma.organization.count();
    } catch {
      totalOrgs = 0;
    }

    let totalUsers = 0;
    try {
      totalUsers = await prisma.user.count();
    } catch {
      totalUsers = 0;
    }

    let pendingApprovals = 0;
    try {
      pendingApprovals = await prisma.organization.count({
        where: { status: "REGISTERED" }
      });
    } catch {
      pendingApprovals = 0;
    }

    let openEscalations = 0;
    try {
      openEscalations = await prisma.grievance.count({
        where: { status: { in: ["RAISED", "ACKNOWLEDGED", "LEVEL_1_REVIEW", "ESCALATED_TO_STATE_CELL", "ESCALATED_TO_JS_SECRETARY"] } }
      });
    } catch {
      openEscalations = 0;
    }

    let recentActivity: any[] = [];
    try {
      const logs = await (prisma as any).auditLog?.findMany({
        take: 5,
        orderBy: { createdAt: "desc" }
      });
      if (Array.isArray(logs)) {
        recentActivity = logs.map((l: any) => ({
          id: l.id,
          action: l.action || l.event || "Audit Log",
          entityType: l.entityType || l.resource || "System",
          createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
          actorRole: l.actorRole || l.userRole || null
        }));
      }
    } catch {
      recentActivity = [];
    }

    const permissions: Record<string, boolean> = {
      "dashboard:view": true,
      "dashboard:kpis": true,
      "dashboard:projects": true,
      "dashboard:approvals": true,
      "dashboard:escalations": true,
      "dashboard:activity": true,
    };

    const kpis = [
      { key: "totalProjects", label: "Convergence Projects", value: totalProjects },
      { key: "totalOrgs", label: "Government & Partner Orgs", value: totalOrgs },
      { key: "totalUsers", label: "Registered Users", value: totalUsers },
      { key: "pendingApprovals", label: "Pending Approvals", value: pendingApprovals },
      { key: "openEscalations", label: "Active Escalations", value: openEscalations },
    ];

    const data = {
      generatedAt: new Date().toISOString(),
      permissions,
      kpis,
      pendingApprovals,
      openEscalations,
      recentActivity,
      totalProjects,
      totalOrgs,
      totalUsers,
    };

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardWidgets = getDashboardSummary;
