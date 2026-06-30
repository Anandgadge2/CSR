"use client";

import { useState } from "react";
import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovDataTable from "@/components/gov/GovDataTable";
import GovAlert from "@/components/gov/GovAlert";
import { useApiQuery } from "@/lib/apiHooks";
import { FileText, Eye, Building2, Calendar, ShieldCheck } from "lucide-react";

interface Assessment {
  id: string;
  reportReference: string;
  companyName: string;
  sector: string;
  feasibilityResult: "FEASIBLE" | "PROCEED_WITH_CONDITIONS" | "NOT_FEASIBLE";
  submittedToJsAt: string | null;
  jsDecisionAt: string | null;
  jsDecisionRemarks: string | null;
  corporateEnquiry?: { companyName: string; trackingId: string };
  governmentPitch?: { officialName: string; pitchReferenceId: string };
}

export default function RMAssessmentsPage() {
  const [filterResult, setFilterResult] = useState<string>("ALL");

  const { data: response, isLoading, error } = useApiQuery<{ success: boolean; data: Assessment[] }>(
    ["rm", "assessments", "list"],
    "/rm/assessments",
    { staleTime: 30 * 1000 }
  );

  const assessments = response?.data || [];

  const filteredAssessments = assessments.filter((a) => {
    if (filterResult === "ALL") return true;
    return a.feasibilityResult === filterResult;
  });

  const getResultColor = (result: string) => {
    switch (result) {
      case "FEASIBLE":
        return "success";
      case "PROCEED_WITH_CONDITIONS":
        return "warning";
      case "NOT_FEASIBLE":
        return "danger";
      default:
        return "muted";
    }
  };

  const columns = [
    {
      key: "reportReference",
      label: "Reference ID",
      render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-primary)" }}>{v as string}</span>,
    },
    {
      key: "companyName",
      label: "Company / Project",
      render: (v: unknown, row: Record<string, unknown>) => {
        const castRow = row as unknown as Assessment;
        const name = castRow.corporateEnquiry?.companyName || castRow.companyName;
        const sub = castRow.corporateEnquiry?.trackingId || castRow.governmentPitch?.pitchReferenceId || "Direct Entry";
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600 }}>{name}</span>
            <span style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>{sub}</span>
          </div>
        );
      },
    },
    { key: "sector", label: "Sector" },
    {
      key: "feasibilityResult",
      label: "Feasibility Result",
      render: (v: unknown) => (
        <GovStatusBadge variant={getResultColor(v as string)}>
          {(v as string).replace(/_/g, " ")}
        </GovStatusBadge>
      ),
    },
    {
      key: "submittedToJsAt",
      label: "Submitted Date",
      render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"),
    },
    {
      key: "jsDecisionAt",
      label: "JS Decision",
      render: (v: unknown, row: Record<string, unknown>) => {
        const castRow = row as unknown as Assessment;
        if (!castRow.submittedToJsAt) return <GovStatusBadge variant="muted">DRAFT</GovStatusBadge>;
        if (!v) return <GovStatusBadge variant="warning">PENDING REVIEW</GovStatusBadge>;
        return <GovStatusBadge variant="success">DECISION ISSUED</GovStatusBadge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => (
        <Link href={`/rm/assessments/${row.id}`}>
          <GovButton variant="secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }}>
            <Eye size={14} style={{ marginRight: 4 }} /> View Report
          </GovButton>
        </Link>
      ),
    },
  ];

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title="Feasibility Assessment Reports"
        description="View and verify detailed 13-point feasibility assessments submitted to the Joint Secretary"
        breadcrumb="Home / Assessments"
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {["ALL", "FEASIBLE", "PROCEED_WITH_CONDITIONS", "NOT_FEASIBLE"].map((res) => (
          <GovButton
            key={res}
            variant={filterResult === res ? "primary" : "secondary"}
            onClick={() => setFilterResult(res)}
          >
            {res.replace(/_/g, " ")}
          </GovButton>
        ))}
      </div>

      <GovCard>
        <GovCardHeader>
          <GovCardTitle>Submitted Reports ({filteredAssessments.length})</GovCardTitle>
        </GovCardHeader>
        <GovCardBody style={{ padding: 0 }}>
          {error && (
            <div style={{ padding: 16 }}>
              <GovAlert variant="danger">Failed to load assessments. Please try again.</GovAlert>
            </div>
          )}
          <GovDataTable
            columns={columns}
            data={filteredAssessments as unknown as Record<string, unknown>[]}
            loading={isLoading}
            emptyMessage="No feasibility reports found."
          />
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
