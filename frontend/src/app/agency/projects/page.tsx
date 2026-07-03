"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import { apiFetch } from "@/lib/api";

interface Project {
  id: string;
  projectId: string;
  title: string;
  district: string;
  taluka: string;
  sector: string;
  corporateName: string;
  approvedBudget: number | string;
  utilizedAmount: number | string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  status: string;
  createdAt: string;
  nodalOfficerUser?: { email: string };
  _count?: { milestones: number; utilizationCertificates: number; grievances: number };
}

export default function AgencyProjectsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: Project[] }>("/convergence-projects");
      setProjects(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load assigned projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) fetchProjects();
  }, [mounted, fetchProjects]);

  if (!mounted) return null;

  const fmtCurrency = (v: number | string) => {
    const n = Number(v);
    return isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN")}`;
  };

  const columns = [
    { key: "projectId", label: "Project ID", render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-link)" }}>{v as string}</span> },
    { key: "title", label: "Title" },
    { key: "district", label: "District" },
    { key: "corporateName", label: "Corporate" },
    { key: "approvedBudget", label: "Budget", render: (v: unknown) => fmtCurrency(v as number) },
    { key: "physicalProgressPercent", label: "Progress", render: (_: unknown, row: Record<string, unknown>) => {
      const phys = row.physicalProgressPercent as number;
      return (
        <div style={{ minWidth: 100 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{phys}% physical</div>
          <div style={{ height: 4, background: "var(--gov-border)", borderRadius: 2, marginTop: 4 }}>
            <div style={{ height: 4, background: phys >= 100 ? "var(--gov-success)" : "var(--gov-link)", borderRadius: 2, width: `${Math.min(phys, 100)}%` }} />
          </div>
        </div>
      );
    }},
    { key: "status", label: "Status", render: (v: unknown) => { const s = (v as string) || ""; return <GovStatusBadge variant={statusToVariant(s)}>{s.replace(/_/g, " ")}</GovStatusBadge>; } },
    { key: "id", label: "Action", align: "right" as const, render: (_: unknown, row: Record<string, unknown>) => (
      <GovButton variant="secondary" onClick={(e) => { e.stopPropagation(); router.push(`/convergence-projects/${row.id}`); }} style={{ fontSize: 11, padding: "3px 10px", minHeight: 28 }}>Open</GovButton>
    )},
  ];

  return (
    <GovPortalLayout userRole="IMPLEMENTING_AGENCY_USER">
      <GovPageShell
        breadcrumb="Home / Agency / Assigned Projects"
        title="Assigned Projects"
        description="Convergence projects where your agency is designated as the primary Implementing Agency (NGO/Agency)."
      >
        <div style={{ marginTop: 16 }}>
          <GovCard>
            <GovCardBody style={{ padding: 0 }}>
              <GovDataTable
                columns={columns}
                data={projects as unknown as Record<string, unknown>[]}
                loading={loading}
                error={error}
                emptyMessage="No assigned projects found."
                onRowClick={(row) => router.push(`/convergence-projects/${row.id}`)}
              />
            </GovCardBody>
          </GovCard>
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
