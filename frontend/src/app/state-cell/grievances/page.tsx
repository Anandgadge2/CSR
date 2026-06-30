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
import { hasRoleAccess, STATE_CELL_GRIEVANCE_ROLES } from "@/lib/roleAccess";

interface Grievance {
  id: string;
  grievanceId: string;
  issueTitle: string;
  status: string;
  level1DueAt: string | null;
  level2DueAt: string | null;
  createdAt: string;
  updatedAt: string;
  convergenceProject?: { projectId: string; title: string; district: string };
  raisedByUser?: { email: string };
  assignedNodalOfficer?: { email: string };
}

export default function StateCellGrievancesPage() {
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
    if (mounted && hasRoleAccess(STATE_CELL_GRIEVANCE_ROLES)) fetchGrievances();
  }, [mounted, fetchGrievances]);

  if (!mounted) return null;
  if (!hasRoleAccess(STATE_CELL_GRIEVANCE_ROLES)) {
    return <AccessDenied requiredRoles={["State CSR Cell", "Joint Secretary", "Planning Secretary", "Admin"]} />;
  }

  const now = Date.now();
  const daysUntil = (d: string | null) => {
    if (!d) return Infinity;
    return Math.ceil((new Date(d).getTime() - now) / (1000 * 60 * 60 * 24));
  };
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const l2pending = grievances.filter((g) => g.status === "ESCALATED_TO_STATE_CELL");
  const escalatedToJS = grievances.filter((g) => g.status === "ESCALATED_TO_JS_SECRETARY");
  const dueSoon = grievances.filter((g) => { const d = daysUntil(g.level2DueAt); return d >= 0 && d <= 7 && g.status !== "CLOSED" && g.status !== "LEVEL_2_RESOLVED"; });
  const overdue = grievances.filter((g) => daysUntil(g.level2DueAt) < 0 && g.status !== "CLOSED" && g.status !== "LEVEL_2_RESOLVED");

  const kpis = [
    { label: "Level 2 Pending", value: l2pending.length, color: "var(--gov-primary)" },
    { label: "Due Within 7 Days", value: dueSoon.length, color: "var(--gov-warning)" },
    { label: "Overdue", value: overdue.length, color: "var(--gov-danger)" },
    { label: "Escalated to JS/Secretary", value: escalatedToJS.length, color: "#7c3aed" },
  ];

  const columns = [
    { key: "grievanceId", label: "Grievance ID", render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-link)" }}>{v as string}</span> },
    { key: "convergenceProject", label: "Project", render: (_: unknown, row: Record<string, unknown>) => { const p = row.convergenceProject as Grievance["convergenceProject"]; return p ? p.projectId : "—"; } },
    { key: "convergenceProject_district", label: "District", render: (_: unknown, row: Record<string, unknown>) => { const p = row.convergenceProject as Grievance["convergenceProject"]; return p?.district || "—"; } },
    { key: "assignedNodalOfficer", label: "Level 1 Officer", render: (_: unknown, row: Record<string, unknown>) => { const u = row.assignedNodalOfficer as Grievance["assignedNodalOfficer"]; return u?.email || "—"; } },
    { key: "level2DueAt", label: "L2 Due Date", render: (v: unknown) => fmtDate(v as string | null) },
    { key: "status", label: "Status", render: (v: unknown) => { const s = (v as string) || ""; return <GovStatusBadge variant={statusToVariant(s)}>{s.replace(/_/g, " ")}</GovStatusBadge>; } },
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / State CSR Cell / Grievance Queue"
        title="State CSR Cell — Grievance Queue"
        description="Level 2 escalated grievances with 30-day SLA. Review, resolve, or escalate to JS/Planning Secretary."
      >
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
            emptyMessage="No escalated grievances in your queue."
            onRowClick={(row) => router.push(`/grievances/${row.id}`)}
          />
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
