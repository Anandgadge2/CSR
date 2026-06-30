"use client";

import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovDataTable from "@/components/gov/GovDataTable";
import GovAlert from "@/components/gov/GovAlert";
import { useApiQuery } from "@/lib/apiHooks";
import { AlertTriangle, Clock, Calendar } from "lucide-react";

interface Escalation {
  id: string;
  entityType: string;
  entityId: string;
  stage: string;
  dueAt: string;
  createdAt: string;
  isResolved: boolean;
}

export default function RMEscalationsPage() {
  const { data: response, isLoading, error } = useApiQuery<{ success: boolean; data: Escalation[] }>(
    ["rm", "escalations", "list"],
    "/rm/escalations",
    { staleTime: 30 * 1000 }
  );

  const escalations = response?.data || [];

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "RM_RESPONSE":
        return "First Contact response";
      case "GOVERNMENT_PITCH_VERIFICATION":
        return "Government Pitch verification";
      default:
        return stage.replace(/_/g, " ");
    }
  };

  const columns = [
    {
      key: "id",
      label: "Escalation ID",
      render: (v: unknown) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{(v as string).substring(0, 8)}...</span>,
    },
    {
      key: "entityType",
      label: "Target Scope",
      render: (v: unknown, row: Record<string, unknown>) => {
        const castRow = row as unknown as Escalation;
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600 }}>{v as string}</span>
            <span style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>ID: {castRow.entityId}</span>
          </div>
        );
      },
    },
    {
      key: "stage",
      label: "Workflow Milestone",
      render: (v: unknown) => getStageLabel(v as string),
    },
    {
      key: "dueAt",
      label: "SLA Due Date",
      render: (v: unknown) => {
        const date = new Date(v as string);
        const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const color = diffDays < 0 ? "var(--gov-danger)" : "var(--gov-warning)";
        return (
          <span style={{ color, fontWeight: 600 }}>
            {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            {diffDays < 0 ? ` (Overdue)` : ` (Due in ${diffDays}d)`}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Escalation Status",
      render: () => <GovStatusBadge variant="danger">ACTIVE ESCALATION</GovStatusBadge>,
    },
  ];

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title="SLA Escalation Alerts Panel"
        description="Monitor active SLA warnings and overdue tasks assigned to you. Unresolved items escalate to the Joint Secretary."
        breadcrumb="Home / Escalations"
      />

      <GovCard>
        <GovCardHeader>
          <GovCardTitle>Active Escalations ({escalations.length})</GovCardTitle>
        </GovCardHeader>
        <GovCardBody style={{ padding: 0 }}>
          {error && (
            <div style={{ padding: 16 }}>
              <GovAlert variant="danger">Failed to load escalations. Please try again later.</GovAlert>
            </div>
          )}
          <GovDataTable
            columns={columns}
            data={escalations as unknown as Record<string, unknown>[]}
            loading={isLoading}
            emptyMessage="No active escalations. Your SLA performance is excellent!"
          />
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
