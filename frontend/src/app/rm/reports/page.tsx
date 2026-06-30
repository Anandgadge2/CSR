"use client";

import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import { useApiQuery } from "@/lib/apiHooks";

interface DashboardStats {
  totalEnquiries?: number;
  pendingResponse?: number;
  slaDueSoon?: number;
  pendingVerifications?: number;
}

interface QueueResponse<T> {
  data: T[];
}

export default function RMReportsPage() {
  const dashboard = useApiQuery<DashboardStats>(["rm", "reports", "dashboard"], "/rm/dashboard", { staleTime: 30 * 1000 });
  const enquiries = useApiQuery<QueueResponse<unknown> | unknown[]>(["rm", "reports", "enquiries"], "/rm/enquiries?limit=100", { staleTime: 30 * 1000 });
  const pitches = useApiQuery<QueueResponse<unknown> | unknown[]>(["rm", "reports", "pitches"], "/rm/pitches?limit=100", { staleTime: 30 * 1000 });
  const assessments = useApiQuery<QueueResponse<unknown> | unknown[]>(["rm", "reports", "assessments"], "/rm/assessments", { staleTime: 30 * 1000 });

  const count = (value: QueueResponse<unknown> | unknown[] | undefined) => Array.isArray(value) ? value.length : value?.data?.length || 0;
  const hasError = dashboard.error || enquiries.error || pitches.error || assessments.error;

  const tiles = [
    { label: "Total Enquiries", value: dashboard.data?.totalEnquiries ?? count(enquiries.data), href: "/rm/enquiries" },
    { label: "Pending Response", value: dashboard.data?.pendingResponse ?? 0, href: "/rm/enquiries" },
    { label: "SLA Due Soon", value: dashboard.data?.slaDueSoon ?? 0, href: "/rm/escalations" },
    { label: "Government Pitches", value: count(pitches.data), href: "/rm/government-pitches" },
    { label: "Feasibility Reports", value: count(assessments.data), href: "/rm/assessments" },
    { label: "Pending Verifications", value: dashboard.data?.pendingVerifications ?? 0, href: "/rm/interests" },
  ];

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title="Relationship Manager Reports"
        description="Operational snapshot across enquiries, pitch verification, feasibility reports, and SLA follow-up."
        breadcrumb="Home / Reports"
      />

      {hasError && <GovAlert variant="danger" style={{ marginBottom: 16 }}>Some report data could not be loaded.</GovAlert>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} style={{ textDecoration: "none" }}>
            <GovCard>
              <GovCardBody>
                <div style={{ fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase", fontWeight: 800 }}>{tile.label}</div>
                <div style={{ marginTop: 10, fontSize: 30, fontWeight: 900, color: "var(--gov-primary-dark)" }}>{tile.value}</div>
              </GovCardBody>
            </GovCard>
          </Link>
        ))}
      </div>

      <GovCard>
        <GovCardHeader>
          <GovCardTitle>SLA Summary</GovCardTitle>
        </GovCardHeader>
        <GovCardBody>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gov-border)", paddingBottom: 10 }}>
              <span>Initial response to corporate enquiry</span>
              <GovStatusBadge variant="info">RM 5 days to JS 3 days to Secretary 2 days</GovStatusBadge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gov-border)", paddingBottom: 10 }}>
              <span>Government pitch verification</span>
              <GovStatusBadge variant="info">RM 5 days to JS 3 days to Secretary 2 days</GovStatusBadge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Assessment report decision</span>
              <GovStatusBadge variant="info">JS 5 days to Planning Secretary 2 days</GovStatusBadge>
            </div>
          </div>
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
