"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { hasRoleAccess, JS_ROLES } from "@/lib/roleAccess";

interface Assessment {
  id: string;
  reportReference: string;
  source: string;
  trackingId: string;
  companyName: string;
  proposedLocationDistrict: string;
  relationshipManager?: { email: string };
  feasibilityResult: string;
  submittedToJsAt: string;
  status?: string;
  sourceDetails?: {
    department?: string;
  };
}

interface AssessmentsPayload {
  assessments: Assessment[];
}

export default function JSAssessmentsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterResult, setFilterResult] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterSla, setFilterSla] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: AssessmentsPayload }>("/js/assessments");
      setAssessments(res?.data?.assessments || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasRoleAccess(JS_ROLES)) {
      fetchAssessments();
    }
  }, [mounted, fetchAssessments]);

  if (!mounted) return null;
  if (!hasRoleAccess(JS_ROLES)) {
    return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;
  }

  const getSlaStatus = (submittedAt: string): "ON_TIME" | "DUE_SOON" | "OVERDUE" | "ESCALATED" => {
    const days = Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 3) return "ESCALATED";
    if (days > 2) return "OVERDUE";
    if (days > 1) return "DUE_SOON";
    return "ON_TIME";
  };

  const filtered = assessments.filter((a) => {
    if (filterResult && a.feasibilityResult !== filterResult) return false;
    if (filterDistrict && a.proposedLocationDistrict !== filterDistrict) return false;
    if (filterSource && a.source !== filterSource) return false;
    if (filterSla && getSlaStatus(a.submittedToJsAt) !== filterSla) return false;
    return true;
  });

  const rawDistricts = assessments.map((a) => a.proposedLocationDistrict);
  const districts = rawDistricts.filter((v, i) => rawDistricts.indexOf(v) === i).sort();
  const rawResults = assessments.map((a) => a.feasibilityResult);
  const results = rawResults.filter((v, i) => rawResults.indexOf(v) === i).sort();

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const getDecisionDue = (d: string) => {
    const date = new Date(d);
    date.setDate(date.getDate() + 3);
    return fmtDate(date.toISOString());
  };

  const columns = [
    { key: "reportReference", label: "Report Ref", render: (v: unknown) => <span style={{ fontWeight: 700 }}>{v as string}</span> },
    { key: "source", label: "Case Type", render: (v: unknown) => (v as string) === "CORPORATE_ENQUIRY" ? "Corporate Enquiry" : "Govt Pitch" },
    { key: "trackingId", label: "Tracking ID", render: (v: unknown) => <span style={{ color: "var(--gov-link)", fontWeight: 600 }}>{v as string}</span> },
    { key: "companyName", label: "Company / Dept", render: (v: unknown, row: Record<string, unknown>) => {
      const r = row as unknown as Assessment;
      return r.source === "GOVERNMENT_PITCH" ? r.sourceDetails?.department || "Govt Department" : v as string;
    }},
    { key: "proposedLocationDistrict", label: "District" },
    { key: "relationshipManager", label: "RM Name", render: (v: unknown) => { const rm = v as Assessment["relationshipManager"]; return rm?.email?.split("@")[0] || "—"; } },
    {
      key: "feasibilityResult",
      label: "Feasibility Result",
      render: (v: unknown) => <GovStatusBadge variant={statusToVariant(v as string)}>{(v as string).replace(/_/g, " ")}</GovStatusBadge>
    },
    { key: "submittedToJsAt", label: "Submitted At", render: (v: unknown) => fmtDate(v as string) },
    { key: "submittedToJsAt", label: "Decision Due", render: (v: unknown) => getDecisionDue(v as string) },
    {
      key: "submittedToJsAt",
      label: "SLA Badge",
      render: (v: unknown) => {
        const s = getSlaStatus(v as string);
        const variant = s === "ESCALATED" || s === "OVERDUE" ? "danger" : s === "DUE_SOON" ? "warning" : "success";
        return <GovStatusBadge variant={variant}>{s.replace(/_/g, " ")}</GovStatusBadge>;
      }
    },
    {
      key: "id",
      label: "Action",
      align: "right" as const,
      render: (v: unknown) => (
        <GovButton variant="primary" onClick={() => router.push(`/js/assessments/${v as string}`)} style={{ fontSize: 11, padding: "4px 10px", minHeight: 28 }}>Review</GovButton>
      )
    }
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Feasibility Assessments"
        title="Feasibility Assessments Queue"
        description="Review, approve with conditions, or return feasibility reports submitted by Relationship Managers."
      >
        {error && <GovAlert variant="danger">{error}</GovAlert>}

        {/* Filters */}
        <GovCard style={{ marginBottom: 16 }}>
          <GovCardBody>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <label className="gov-label" style={{ fontSize: 11, fontWeight: 700 }}>Feasibility Result</label>
                <select className="gov-select" value={filterResult} onChange={(e) => setFilterResult(e.target.value)} style={{ minWidth: 160 }}>
                  <option value="">All Results</option>
                  {results.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                </select>
              </div>

              <div>
                <label className="gov-label" style={{ fontSize: 11, fontWeight: 700 }}>District</label>
                <select className="gov-select" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} style={{ minWidth: 160 }}>
                  <option value="">All Districts</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="gov-label" style={{ fontSize: 11, fontWeight: 700 }}>Case Type</label>
                <select className="gov-select" value={filterSource} onChange={(e) => setFilterSource(e.target.value)} style={{ minWidth: 160 }}>
                  <option value="">All Types</option>
                  <option value="CORPORATE_ENQUIRY">Corporate Enquiry</option>
                  <option value="GOVERNMENT_PITCH">Government Pitch</option>
                </select>
              </div>

              <div>
                <label className="gov-label" style={{ fontSize: 11, fontWeight: 700 }}>SLA Status</label>
                <select className="gov-select" value={filterSla} onChange={(e) => setFilterSla(e.target.value)} style={{ minWidth: 160 }}>
                  <option value="">All SLA Statuses</option>
                  <option value="ON_TIME">On Time</option>
                  <option value="DUE_SOON">Due Soon</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>

              <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--gov-text-muted)", alignSelf: "flex-end", paddingBottom: 10 }}>
                Showing {filtered.length} of {assessments.length} assessments
              </div>
            </div>
          </GovCardBody>
        </GovCard>

        {/* Table */}
        <GovCard>
          <GovCardBody style={{ padding: 0 }}>
            <GovDataTable
              columns={columns}
              data={filtered as unknown as Record<string, unknown>[]}
              loading={loading}
              emptyMessage="No feasibility assessments matched the selected criteria."
              onRowClick={(row) => router.push(`/js/assessments/${row.id}`)}
            />
          </GovCardBody>
        </GovCard>
      </GovPageShell>
    </GovPortalLayout>
  );
}
