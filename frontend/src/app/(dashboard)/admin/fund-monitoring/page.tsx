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
import { hasPageAccess, ADMIN_ACCESS_PERMS } from "@/lib/roleAccess";

interface FundProject {
  id: string;
  projectId: string;
  title: string;
  district: string;
  sector: string;
  corporateName: string;
  approvedBudget: number | string;
  utilizedAmount: number | string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  status: string;
  _count?: { utilizationCertificates: number; milestones: number };
}

interface FundSummary {
  kpis: {
    totalBudget: number;
    totalUtilized: number;
    utilizationPercent: number;
    projects: number;
    ucPending: number;
    ucVerified: number;
    ucRejected: number;
  };
  ucByStatus: Array<{ verificationStatus: string; count: number; amountUtilized: number }>;
  projects: FundProject[];
}

const ACCESS_PERMS = ADMIN_ACCESS_PERMS;

export default function FundMonitoringPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: FundSummary }>("/admin/fund-monitoring");
      setSummary(res?.data || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load fund monitoring data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasPageAccess(ACCESS_PERMS)) fetchSummary();
  }, [mounted, fetchSummary]);

  if (!mounted) return null;
  if (!hasPageAccess(ACCESS_PERMS)) {
    return <AccessDenied requiredRoles={["Administrator"]} />;
  }

  const fmtCurrency = (v: number | string | null | undefined) => {
    const n = Number(v);
    return v == null || isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN")}`;
  };

  const projects = summary?.projects || [];
  const filtered = filterDistrict ? projects.filter((p) => p.district === filterDistrict) : projects;
  const districts = Array.from(new Set(projects.map((p) => p.district))).sort();

  const kpis = [
    { label: "Total Approved Budget", value: fmtCurrency(summary?.kpis.totalBudget ?? 0), color: "var(--gov-primary)" },
    { label: "Total Utilized", value: fmtCurrency(summary?.kpis.totalUtilized ?? 0), color: "var(--gov-link)" },
    { label: "Utilization", value: `${summary?.kpis.utilizationPercent ?? 0}%`, color: "var(--gov-success)" },
    { label: "UCs Pending", value: summary?.kpis.ucPending ?? 0, color: "var(--gov-danger)" },
    { label: "UCs Verified", value: summary?.kpis.ucVerified ?? 0, color: "var(--gov-success)" },
    { label: "UCs Rejected", value: summary?.kpis.ucRejected ?? 0, color: "var(--gov-danger)" },
  ];

  const columns = [
    { key: "projectId", label: "Project ID", render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-link)" }}>{v as string}</span> },
    { key: "title", label: "Title" },
    { key: "district", label: "District" },
    { key: "corporateName", label: "Corporate" },
    { key: "approvedBudget", label: "Budget", render: (v: unknown) => fmtCurrency(v as number | string) },
    { key: "utilizedAmount", label: "Utilized", render: (v: unknown) => fmtCurrency(v as number | string) },
    { key: "financialProgressPercent", label: "Financial Progress", render: (v: unknown) => {
      const pct = Number(v) || 0;
      return (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</div>
          <div style={{ height: 4, background: "var(--gov-border)", borderRadius: 2, marginTop: 4 }}>
            <div style={{ height: 4, background: pct >= 100 ? "var(--gov-success)" : "var(--gov-link)", borderRadius: 2, width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
      );
    }},
    { key: "_count", label: "UCs", render: (v: unknown) => {
      const count = v as FundProject["_count"];
      return count?.utilizationCertificates ?? 0;
    }},
    { key: "status", label: "Status", render: (v: unknown) => { const s = (v as string) || ""; return <GovStatusBadge variant={statusToVariant(s)}>{s.replace(/_/g, " ")}</GovStatusBadge>; } },
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Admin / Fund Monitoring"
        title="Fund Monitoring"
        description="Budget versus utilization across convergence projects, with utilization certificate verification status."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
          {kpis.map((k) => (
            <GovCard key={k.label}>
              <GovCardBody>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color, marginTop: 6 }}>{k.value}</div>
              </GovCardBody>
            </GovCard>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
          <select className="gov-select" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <span style={{ fontSize: 12, color: "var(--gov-text-muted)" }}>Showing {filtered.length} of {projects.length} projects</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <GovDataTable
            columns={columns}
            data={filtered as unknown as Record<string, unknown>[]}
            loading={loading}
            error={error}
            emptyMessage="No convergence projects with fund data yet."
            onRowClick={(row) => router.push(`/convergence-projects/${row.id}`)}
          />
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
