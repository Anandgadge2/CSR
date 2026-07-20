"use client";

/**
 * Dashboard Engine — permission-driven registries + renderer.
 *
 * A single unified dashboard replaces the per-role dashboard pages. What each
 * user sees is decided entirely by their permissions, not by hardcoded role
 * branches: every widget/section declares the `dashboard:*` permission that
 * unlocks it, and the engine renders only the entries the caller holds.
 *
 * The backend mirror is GET /api/dashboard/summary (dashboardController), which
 * likewise returns only the blocks the caller's permissions unlock and applies
 * row-level scoping. The two sides share the same permission keys defined in
 * backend/src/config/platformAccess.ts.
 */
import type { LucideIcon } from "lucide-react";
import {
  BarChart2, Bell, Clock, Compass, FileText, ShieldAlert, ShieldCheck,
} from "lucide-react";

/** Shape returned by GET /api/dashboard/summary (inside the `data` envelope). */
export interface DashboardSummary {
  generatedAt: string;
  permissions: Record<string, boolean>;
  kpis: Array<{ key: string; label: string; value: number }>;
  pendingApprovals?: number;
  openEscalations?: number;
  recentActivity?: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    actorRole: string | null;
  }>;
}

/** A KPI card definition. `value` reads from the summary by key. */
export interface KpiCardDef {
  key: string;
  label: string;
  /** Permission that unlocks this card. */
  permission: string;
  icon: LucideIcon;
  accent: string;
}

/**
 * A dashboard section (larger widget). `render` receives the summary and the
 * permission checker so it can draw itself; the engine only mounts it when the
 * caller holds `permission`.
 */
export interface SectionDef {
  key: string;
  title: string;
  permission: string;
  icon: LucideIcon;
  /** Whether the section has data to show given the summary (else hidden). */
  hasData: (summary: DashboardSummary) => boolean;
}

/** Quick-action shortcut. Gated by permission + optional page-visibility. */
export interface QuickActionDef {
  key: string;
  label: string;
  href: string;
  permission: string;
  icon: LucideIcon;
}

// ── KPI registry ── headline counts, each gated by dashboard:widget-kpis ──
// The individual values come from summary.kpis (already permission+scope
// filtered server-side); these defs supply presentation only.
export const KPI_CARDS: KpiCardDef[] = [
  { key: "enquiries", label: "Corporate Enquiries", permission: "dashboard:widget-kpis", icon: FileText, accent: "#005ea8" },
  { key: "pitches", label: "Government Pitches", permission: "dashboard:widget-kpis", icon: Compass, accent: "#14274e" },
  { key: "projects", label: "Convergence Projects", permission: "dashboard:widget-kpis", icon: ShieldCheck, accent: "#166534" },
  { key: "assignments", label: "Active Assignments", permission: "dashboard:widget-kpis", icon: Clock, accent: "#d97706" },
];

// ── Section registry ── larger widgets, each gated by its own permission ──
export const SECTIONS: SectionDef[] = [
  {
    key: "approvals",
    title: "Pending Approvals",
    permission: "dashboard:widget-approvals",
    icon: ShieldCheck,
    hasData: (s) => typeof s.pendingApprovals === "number",
  },
  {
    key: "sla",
    title: "SLA / Escalations",
    permission: "dashboard:widget-sla",
    icon: ShieldAlert,
    hasData: (s) => typeof s.openEscalations === "number",
  },
  {
    key: "activity",
    title: "Recent Activity",
    permission: "dashboard:widget-activity",
    icon: Bell,
    hasData: (s) => Array.isArray(s.recentActivity) && s.recentActivity.length > 0,
  },
];

// ── Quick-action registry ── shortcut buttons, gated by permission ──
export const QUICK_ACTIONS: QuickActionDef[] = [
  { key: "reports", label: "Reports", href: "/reports", permission: "dashboard:widget-quick-actions", icon: BarChart2 },
  { key: "projects", label: "Projects", href: "/convergence-projects", permission: "dashboard:widget-quick-actions", icon: ShieldCheck },
];

/**
 * Filter a registry to the entries a caller may see. An entry is visible when
 * the summary reports its permission as true (the server is the source of
 * truth; it already applied SUPER_ADMIN bypass and role→permission resolution).
 */
export function visibleByPermission<T extends { permission: string }>(
  defs: T[],
  summary: DashboardSummary
): T[] {
  return defs.filter((d) => summary.permissions[d.permission]);
}
