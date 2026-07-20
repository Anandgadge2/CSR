"use client";

import { useState, useEffect, useCallback } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import GovTextarea from "@/components/gov/GovTextarea";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch, clearApiCache } from "@/lib/api";
import { hasPageAccess, JS_ACCESS_PERMS } from "@/lib/roleAccess";

interface Escalation {
  id: string;
  entityType: string;
  entityId: string;
  trackingId: string;
  companyOrDepartment: string;
  district: string;
  assignedRM: string;
  rmDueDate: string;
  escalatedAt: string;
  jsDueDate: string;
  daysOverdue: number;
  slaStatus: string;
}

export default function JSEscalationsPage() {
  const [mounted, setMounted] = useState(false);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Action states
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchEscalations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: Escalation[] }>("/js/escalations");
      setEscalations(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load SLA escalations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasPageAccess(JS_ACCESS_PERMS)) {
      fetchEscalations();
    }
  }, [mounted, fetchEscalations]);

  if (!mounted) return null;
  if (!hasPageAccess(JS_ACCESS_PERMS)) {
    return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;
  }

  const handleEscalationAction = async (actionType: "MARK_RESPONDED" | "ESCALATE_TO_SECRETARY") => {
    if (!selectedEscalation) return;
    setActionError("");
    setActionSuccess("");

    if (!notes.trim() || notes.trim().length < 10) {
      setActionError("Please add remarks or notes of at least 10 characters.");
      return;
    }

    setActionLoading(true);
    try {
      await apiFetch(`/js/escalations/${selectedEscalation.id}/action`, {
        method: "POST",
        body: JSON.stringify({ action: actionType, notes: notes.trim() }),
      });
      setActionSuccess(`Escalation action '${actionType.replace(/_/g, " ")}' processed successfully.`);
      setNotes("");
      setSelectedEscalation(null);
      clearApiCache();
      fetchEscalations();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to process escalation action");
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const columns = [
    { key: "entityType", label: "Entity Type", render: (v: unknown) => (v as string) === "CORPORATE_ENQUIRY" ? "Corporate Enquiry" : "Govt Pitch" },
    { key: "trackingId", label: "Tracking ID", render: (v: unknown) => <span style={{ fontWeight: 700 }}>{v as string}</span> },
    { key: "companyOrDepartment", label: "Company / Department" },
    { key: "district", label: "District" },
    { key: "assignedRM", label: "Assigned RM" },
    { key: "rmDueDate", label: "RM Due Date", render: (v: unknown) => fmtDate(v as string) },
    { key: "escalatedAt", label: "Escalated At", render: (v: unknown) => fmtDate(v as string) },
    { key: "jsDueDate", label: "JS SLA Due", render: (v: unknown) => fmtDate(v as string) },
    {
      key: "slaStatus",
      label: "SLA Status",
      render: (v: unknown) => {
        const s = v as string;
        const variant = s === "OVERDUE" || s === "ESCALATED" ? "danger" : s === "DUE_SOON" ? "warning" : "success";
        return <GovStatusBadge variant={variant}>{s}</GovStatusBadge>;
      }
    },
    {
      key: "id",
      label: "Action",
      align: "right" as const,
      render: (_: unknown, row: Record<string, unknown>) => {
        const r = row as unknown as Escalation;
        return (
          <GovButton variant="primary" onClick={() => setSelectedEscalation(r)} style={{ fontSize: 11, padding: "4px 10px", minHeight: 28 }}>Resolve</GovButton>
        );
      }
    }
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / SLA Escalations"
        title="Joint Secretary Escalation Queue"
        description="Review Relationship Manager SLA delays, reassign cases, or escalate to Planning Secretary."
      >
        {error && <GovAlert variant="danger">{error}</GovAlert>}
        {actionSuccess && <GovAlert variant="success">{actionSuccess}</GovAlert>}
        {actionError && <GovAlert variant="danger">{actionError}</GovAlert>}

        {selectedEscalation && (
          <GovCard style={{ marginBottom: 20, border: "1px solid var(--gov-danger)" }}>
            <GovCardHeader>
              <GovCardTitle>Resolve Escalation for {selectedEscalation.trackingId}</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <strong>Case details:</strong> {selectedEscalation.companyOrDepartment} ({selectedEscalation.district})
                </div>
                <GovTextarea
                  label="JS Action Remarks / Justification *"
                  placeholder="Record justification notes or reassign instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <GovButton variant="muted" onClick={() => { setSelectedEscalation(null); setNotes(""); }}>Cancel</GovButton>
                  <GovButton variant="secondary" onClick={() => handleEscalationAction("MARK_RESPONDED")} disabled={actionLoading}>
                    Mark Responded (Resolve)
                  </GovButton>
                  <GovButton variant="danger" onClick={() => handleEscalationAction("ESCALATE_TO_SECRETARY")} disabled={actionLoading}>
                    Escalate to Secretary
                  </GovButton>
                </div>
              </div>
            </GovCardBody>
          </GovCard>
        )}

        {/* Table */}
        <GovCard>
          <GovCardBody style={{ padding: 0 }}>
            <GovDataTable
              columns={columns}
              data={escalations as unknown as Record<string, unknown>[]}
              loading={loading}
              emptyMessage="No active RM SLA escalations in your queue."
            />
          </GovCardBody>
        </GovCard>
      </GovPageShell>
    </GovPortalLayout>
  );
}
