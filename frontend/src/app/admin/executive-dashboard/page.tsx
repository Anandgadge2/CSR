"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody, GovCardHeader, GovCardTitle } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { hasPageAccess, ADMIN_ACCESS_PERMS } from "@/lib/roleAccess";

interface StatusCount {
  status: string;
  count: number;
}

interface Overview {
  enquiries: { total: number; byStatus: StatusCount[] };
  pitches: { total: number; byStatus: StatusCount[] };
  interests: { total: number };
  projects: { total: number; byStatus: StatusCount[] };
  funds: { totalBudget: number; totalUtilized: number };
  pendingActions: { ucPending: number; grievancesOpen: number; orgsPendingOnboarding: number };
  recentEnquiries: Array<{
    id: string;
    trackingId: string;
    companyName: string;
    sector: string;
    status: string;
    indicativeBudget: number | string | null;
    submittedAt: string;
    assignedRelationshipManager?: { email: string } | null;
  }>;
}

const ACCESS_PERMS = ADMIN_ACCESS_PERMS;

function StatusBars({ title, data }: { title: string; data: StatusCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <GovCard>
      <GovCardHeader>
        <GovCardTitle>{title}</GovCardTitle>
      </GovCardHeader>
      <GovCardBody>
        {data.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--gov-text-muted)" }}>No records yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.map((d) => (
              <div key={d.status}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--gov-text-muted)" }}>
                  <span>{d.status.replace(/_/g, " ")}</span>
                  <span>{d.count}</span>
                </div>
                <div style={{ height: 6, background: "var(--gov-border)", borderRadius: 3, marginTop: 4 }}>
                  <div style={{ height: 6, background: "var(--gov-link)", borderRadius: 3, width: `${Math.max((d.count / max) * 100, 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </GovCardBody>
    </GovCard>
  );
}

export default function ExecutiveDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: Overview }>("/admin/convergence-overview");
      setOverview(res?.data || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasPageAccess(ACCESS_PERMS)) fetchOverview();
  }, [mounted, fetchOverview]);

  if (!mounted) return null;
  if (!hasPageAccess(ACCESS_PERMS)) {
    return <AccessDenied requiredRoles={["Administrator"]} />;
  }

  const fmtCurrency = (v: number | string | null | undefined) => {
    const n = Number(v);
    return v == null || isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN")}`;
  };

  const utilizationPercent =
    overview && overview.funds.totalBudget > 0
      ? Math.round((overview.funds.totalUtilized / overview.funds.totalBudget) * 100)
      : 0;

  const kpis = [
    { label: "Corporate Enquiries", value: overview?.enquiries.total ?? 0, color: "var(--gov-primary)", href: "/admin/requirements/pending" },
    { label: "Government Pitches", value: overview?.pitches.total ?? 0, color: "var(--gov-link)", href: null },
    { label: "Company Interests", value: overview?.interests.total ?? 0, color: "var(--gov-primary-dark)", href: "/admin/company-interests" },
    { label: "Convergence Projects", value: overview?.projects.total ?? 0, color: "var(--gov-success)", href: "/convergence-projects" },
  ];

  const pendingKpis = [
    { label: "Open Grievances", value: overview?.pendingActions.grievancesOpen ?? 0, href: null },
    { label: "Organizations Pending Onboarding", value: overview?.pendingActions.orgsPendingOnboarding ?? 0, href: "/admin/applications" },
  ];

  const recentColumns = [
    { key: "trackingId", label: "Tracking ID", render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-link)" }}>{v as string}</span> },
    { key: "companyName", label: "Company" },
    { key: "sector", label: "Sector" },
    { key: "indicativeBudget", label: "Budget", render: (v: unknown) => fmtCurrency(v as number | string | null) },
    { key: "assignedRelationshipManager", label: "RM", render: (v: unknown) => {
      const rm = v as { email: string } | null;
      return rm?.email ? rm.email.split("@")[0] : "—";
    }},
    { key: "status", label: "Status", render: (v: unknown) => { const s = (v as string) || ""; return <GovStatusBadge variant={statusToVariant(s)}>{s.replace(/_/g, " ")}</GovStatusBadge>; } },
    { key: "submittedAt", label: "Submitted", render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString() : "—") },
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Admin / Executive Dashboard"
        title="Executive Dashboard"
        description="Live overview of the CSR convergence pipeline — enquiries, pitches, interests, projects, funds, and pending actions."
      >
        {error && <div className="gov-alert danger" style={{ marginTop: 16 }}>{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginTop: 16 }}>
          {kpis.map((k) => (
            <GovCard key={k.label}>
              <GovCardBody>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.color, marginTop: 6 }}>{loading ? "…" : k.value}</div>
                {k.href && (
                  <Link href={k.href} style={{ fontSize: 12, fontWeight: 700, color: "var(--gov-link)" }}>View →</Link>
                )}
              </GovCardBody>
            </GovCard>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginTop: 12 }}>
          <GovCard>
            <GovCardBody>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Approved Budget</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gov-primary)", marginTop: 6 }}>{loading ? "…" : fmtCurrency(overview?.funds.totalBudget ?? 0)}</div>
            </GovCardBody>
          </GovCard>
          <GovCard>
            <GovCardBody>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Utilized</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gov-link)", marginTop: 6 }}>{loading ? "…" : fmtCurrency(overview?.funds.totalUtilized ?? 0)}</div>
              <div style={{ height: 6, background: "var(--gov-border)", borderRadius: 3, marginTop: 8 }}>
                <div style={{ height: 6, background: "var(--gov-success)", borderRadius: 3, width: `${Math.min(utilizationPercent, 100)}%` }} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginTop: 4 }}>{utilizationPercent}% utilized</div>
            </GovCardBody>
          </GovCard>
          {pendingKpis.map((k) => (
            <GovCard key={k.label}>
              <GovCardBody>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.value > 0 ? "var(--gov-danger)" : "var(--gov-success)", marginTop: 6 }}>{loading ? "…" : k.value}</div>
                {k.href && (
                  <Link href={k.href} style={{ fontSize: 12, fontWeight: 700, color: "var(--gov-link)" }}>Review →</Link>
                )}
              </GovCardBody>
            </GovCard>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginTop: 16 }}>
          <StatusBars title="Enquiry Pipeline" data={overview?.enquiries.byStatus || []} />
          <StatusBars title="Pitch Pipeline" data={overview?.pitches.byStatus || []} />
          <StatusBars title="Project Pipeline" data={overview?.projects.byStatus || []} />
        </div>

        <GovCard style={{ marginTop: 16 }}>
          <GovCardHeader>
            <GovCardTitle>Recent Corporate Enquiries</GovCardTitle>
          </GovCardHeader>
        </GovCard>
        <div style={{ marginTop: 8 }}>
          <GovDataTable
            columns={recentColumns}
            data={(overview?.recentEnquiries || []) as unknown as Record<string, unknown>[]}
            loading={loading}
            error={error}
            emptyMessage="No corporate enquiries yet."
          />
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
