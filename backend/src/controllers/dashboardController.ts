/**
 * Unified dashboard summary — GET /api/dashboard/summary.
 *
 * Permission-aware aggregation for the unified Dashboard Engine. This does NOT
 * re-implement business logic: it composes the same Prisma reads the existing
 * per-role dashboards use, and returns only the blocks the caller's permissions
 * unlock. The frontend Dashboard Engine renders whatever blocks come back.
 *
 * Each block is gated by a `dashboard:*` permission key (see platformAccess).
 * Row-level scoping is applied via buildScopeFilter so district / ownership
 * principals only aggregate over rows they may see. SUPER_ADMIN bypasses both.
 */
import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { successResponse } from "../utils/apiResponse";
import { resolveUserPermission } from "../services/permissionService";
import { buildScopeFilter } from "../services/scopeFilter";
import { Role } from "../types/role";

interface Kpi {
  key: string;
  label: string;
  value: number;
}

/**
 * Resolve a set of dashboard permission keys for the caller in one pass.
 * SUPER_ADMIN short-circuits to all-true.
 */
async function resolvePermissions(
  req: AuthenticatedRequest,
  keys: string[]
): Promise<Record<string, boolean>> {
  const user = req.user!;
  if (user.role === Role.SUPER_ADMIN) {
    return Object.fromEntries(keys.map((k) => [k, true]));
  }
  const entries = await Promise.all(
    keys.map(async (key) => {
      const ok = await resolveUserPermission(user.id, key, {
        role: user.role,
        organizationId: user.organizationId || undefined,
      });
      return [key, ok] as const;
    })
  );
  return Object.fromEntries(entries);
}

/**
 * @desc  Permission-aware dashboard summary for the unified engine.
 * @route GET /api/dashboard/summary
 * @access Private (any authenticated user; blocks vary by permission)
 */
export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = req.user!;

    const perms = await resolvePermissions(req, [
      "dashboard:widget-kpis",
      "dashboard:widget-approvals",
      "dashboard:widget-sla",
      "dashboard:widget-activity",
      "dashboard:widget-quick-actions",
      "dashboard:widget-charts",
      "dashboard:analytics-global",
    ]);

    const kpis: Kpi[] = [];
    const blocks: Record<string, unknown> = {};

    // ── KPI cards ── scoped counts across the core workflow entities ──
    if (perms["dashboard:widget-kpis"]) {
      const enquiryScope = buildScopeFilter(user, "corporateEnquiry");
      const pitchScope = buildScopeFilter(user, "governmentPitch");
      const projectScope = buildScopeFilter(user, "convergenceProject");
      const assignmentScope = buildScopeFilter(user, "projectAssignment");

      const [enquiries, pitches, projects, assignments] = await Promise.all([
        prisma.corporateEnquiry.count({ where: enquiryScope }),
        prisma.governmentPitch.count({ where: pitchScope }),
        prisma.convergenceProject.count({ where: projectScope }),
        prisma.projectAssignment.count({
          where: { ...assignmentScope, status: "ACTIVE" },
        }),
      ]);

      kpis.push(
        { key: "enquiries", label: "Corporate Enquiries", value: enquiries },
        { key: "pitches", label: "Government Pitches", value: pitches },
        { key: "projects", label: "Convergence Projects", value: projects },
        { key: "assignments", label: "Active Assignments", value: assignments }
      );
    }

    // ── Pending approvals ── feasibility assessments awaiting a JS decision ──
    if (perms["dashboard:widget-approvals"]) {
      const pendingApprovals = await prisma.feasibilityAssessment.count({
        where: { jsDecisionById: null, submittedToJsAt: { not: null } },
      });
      blocks.pendingApprovals = pendingApprovals;
    }

    // ── SLA / escalation timers ── open escalations the caller can see ──
    if (perms["dashboard:widget-sla"]) {
      const openEscalations = await prisma.sLAEscalation.count({
        where: { isResolved: false },
      });
      blocks.openEscalations = openEscalations;
    }

    // ── Recent activity ── latest audit events (global analytics only) ──
    if (perms["dashboard:widget-activity"] && perms["dashboard:analytics-global"]) {
      const recentActivity = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          entityType: true,
          createdAt: true,
          actorRole: true,
        },
      });
      blocks.recentActivity = recentActivity;
    }

    return successResponse(res, {
      generatedAt: new Date().toISOString(),
      permissions: perms,
      kpis,
      ...blocks,
    });
  } catch (error) {
    return next(error);
  }
};
