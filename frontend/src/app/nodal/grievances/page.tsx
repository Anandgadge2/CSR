"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { hasRoleAccess, NODAL_GRIEVANCE_ROLES } from "@/lib/roleAccess";

interface Grievance {
  id: string;
  grievanceId: string;
  issueTitle: string;
  status: string;
  level1DueAt: string | null;
  createdAt: string;
  updatedAt: string;
  convergenceProject?: { projectId: string; title: string; district: string };
  raisedByUser?: { email: string };
}

export default function NodalGrievancesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: Grievance[] }>("/grievances/my");
      setGrievances(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load grievances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasRoleAccess(NODAL_GRIEVANCE_ROLES)) fetchGrievances();
  }, [mounted, fetchGrievances]);

  if (!mounted) return null;
  if (!hasRoleAccess(NODAL_GRIEVANCE_ROLES)) {
    return <AccessDenied requiredRoles={["District Nodal Officer", "Admin"]} />;
  }

  const now = Date.now();
  const daysUntil = (d: string | null) => {
    if (!d) return Infinity;
    return Math.ceil((new Date(d).getTime() - now) / (1000 * 60 * 60 * 24));
  };
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const open = grievances.filter((g) => g.status !== "CLOSED" && g.status !== "REJECTED" && g.status !== "LEVEL_1_RESOLVED" && g.status !== "LEVEL_2_RESOLVED");
  const dueSoon = open.filter((g) => { const d = daysUntil(g.level1DueAt); return d >= 0 && d <= 3; });
  const overdue = open.filter((g) => daysUntil(g.level1DueAt) < 0);
  const resolvedThisMonth = grievances.filter((g) => {
    if (g.status !== "LEVEL_1_RESOLVED" && g.status !== "CLOSED") return false;
    const upd = new Date(g.updatedAt);
    const nowDate = new Date();
    return upd.getMonth() === nowDate.getMonth() && upd.getFullYear() === nowDate.getFullYear();
  });

  const kpis = [
    { label: "Open Grievances", value: open.length, color: "var(--gov-primary)" },
    { label: "Due Within 3 Days", value: dueSoon.length, color: "var(--gov-warning)" },
    { label: "Overdue", value: overdue.length, color: "var(--gov-danger)" },
    { label: "Resolved This Month", value: resolvedThisMonth.length, color: "var(--gov-success)" },
  ];

  const columns = [
    { key: "grievanceId", label: "Grievance ID", render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-link)" }}>{v as string}</span> },
    { key: "convergenceProject", label: "Project", render: (_: unknown, row: Record<string, unknown>) => { const p = row.convergenceProject as Grievance["convergenceProject"]; return p ? p.projectId : "—"; } },
    { key: "raisedByUser", label: "Raised By", render: (_: unknown, row: Record<string, unknown>) => { const u = row.raisedByUser as Grievance["raisedByUser"]; return u?.email || "—"; } },
    { key: "issueTitle", label: "Issue" },
    { key: "status", label: "Status", render: (v: unknown) => { const s = (v as string) || ""; return <GovStatusBadge variant={statusToVariant(s)}>{s.replace(/_/g, " ")}</GovStatusBadge>; } },
    { key: "level1DueAt", label: "Due Date", render: (v: unknown) => fmtDate(v as string | null) },
    { key: "level1DueAt", label: "SLA Status", render: (v: unknown, row: Record<string, unknown>) => {
      const s = row.status as string;
      if (s === "CLOSED" || s === "LEVEL_1_RESOLVED" || s === "REJECTED") return <GovStatusBadge variant="success">Resolved</GovStatusBadge>;
      const d = daysUntil(v as string | null);
      if (d < 0) return <GovStatusBadge variant="danger">Overdue ({Math.abs(d)}d)</GovStatusBadge>;
      if (d <= 3) return <GovStatusBadge variant="warning">{d}d remaining</GovStatusBadge>;
      return <GovStatusBadge variant="muted">{d}d remaining</GovStatusBadge>;
    }},
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Nodal Officer / Grievance Queue"
        title="District Nodal Officer — Grievance Queue"
        description="Level 1 grievance resolution with 15-day SLA. Respond, resolve, or escalate to State CSR Cell."
      >
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
          {kpis.map((k) => (
            <GovCard key={k.label}>
              <GovCardBody>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.color, marginTop: 6 }}>{k.value}</div>
              </GovCardBody>
            </GovCard>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <GovDataTable
            columns={columns}
            data={grievances as unknown as Record<string, unknown>[]}
            loading={loading}
            error={error}
            emptyMessage="No grievances in your queue."
            onRowClick={(row) => router.push(`/grievances/${row.id}`)}
            rowClassName={(row) => {
              const s = row.status as string;
              if (s === "CLOSED" || s === "LEVEL_1_RESOLVED" || s === "REJECTED") return "";
              const d = daysUntil(row.level1DueAt as string | null);
              if (d < 0) return "gov-row-overdue";
              if (d <= 3) return "gov-row-due-soon";
              return "";
            }}
          />
        </div>
      </GovPageShell>

      <style>{`
        .gov-row-overdue td { background: #fef2f2 !important; }
        .gov-row-due-soon td { background: #fffbeb !important; }
      `}</style>
    </GovPortalLayout>
  );
}
