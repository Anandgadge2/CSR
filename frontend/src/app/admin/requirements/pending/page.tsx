"use client";

import { useState, useEffect, useCallback } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch, invalidateCache } from "@/lib/api";
import { hasRoleAccess, ADMIN_ROLES } from "@/lib/roleAccess";

interface Enquiry {
  id: string;
  trackingId: string;
  companyName: string;
  sector: string;
  preferredDistricts: string[];
  indicativeBudget: number | string | null;
  contactPersonName: string;
  email: string;
  proposedCsrWork: string;
  status: string;
  assignedRelationshipManager?: { id: string; email: string } | null;
  submittedAt: string;
  slaStatus: "ON_TRACK" | "DUE_SOON" | "OVERDUE";
  slaDaysRemaining: number | null;
  _count?: { interactions: number };
}

interface RM {
  id: string;
  email: string;
}

const PENDING_STATUSES = [
  "SUBMITTED",
  "TRACKING_ID_GENERATED",
  "RM_ASSIGNED",
  "RM_CONTACTED",
  "ASSESSMENT_PENDING",
  "ASSESSMENT_SUBMITTED_TO_JS",
];

const ACCESS_ROLES = [...ADMIN_ROLES, "STATE_CSR_CELL", "JOINT_SECRETARY", "DISTRICT_ADMIN"];

export default function RequirementsPendingPage() {
  const [mounted, setMounted] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [rms, setRms] = useState<RM[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedRm, setSelectedRm] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: { enquiries: Enquiry[] } }>("/corporate-enquiries?limit=100");
      setEnquiries(res?.data?.enquiries || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasRoleAccess(ACCESS_ROLES)) fetchEnquiries();
  }, [mounted, fetchEnquiries]);

  const openAssign = async (enquiryId: string) => {
    setActionError("");
    setSelectedRm("");
    setAssigningId(enquiryId);
    if (rms.length === 0) {
      try {
        const res = await apiFetch<{ success: boolean; data: RM[] }>("/corporate-enquiries/relationship-managers");
        setRms(res?.data || []);
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : "Failed to load relationship managers");
      }
    }
  };

  const confirmAssign = async () => {
    if (!assigningId || !selectedRm) return;
    setActionError("");
    try {
      await apiFetch(`/corporate-enquiries/${assigningId}/assign-rm`, {
        method: "PATCH",
        body: JSON.stringify({ relationshipManagerId: selectedRm }),
      });
      invalidateCache("/corporate-enquiries");
      setAssigningId(null);
      fetchEnquiries();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to assign RM");
    }
  };

  if (!mounted) return null;
  if (!hasRoleAccess(ACCESS_ROLES)) {
    return <AccessDenied requiredRoles={[...ACCESS_ROLES]} />;
  }

  const pending = enquiries.filter((e) => PENDING_STATUSES.includes(e.status));
  const shown = filterStatus ? pending.filter((e) => e.status === filterStatus) : pending;
  const unassigned = pending.filter((e) => !e.assignedRelationshipManager).length;
  const overdue = pending.filter((e) => e.slaStatus === "OVERDUE").length;
  const dueSoon = pending.filter((e) => e.slaStatus === "DUE_SOON").length;

  const kpis = [
    { label: "Pending Enquiries", value: pending.length, color: "var(--gov-primary)" },
    { label: "Unassigned", value: unassigned, color: "var(--gov-link)" },
    { label: "SLA Overdue", value: overdue, color: "var(--gov-danger)" },
    { label: "SLA Due Soon", value: dueSoon, color: "var(--gov-warning, #b45309)" },
  ];

  const fmtCurrency = (v: number | string | null) => {
    const n = Number(v);
    return v == null || isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN")}`;
  };

  const slaVariant = (s: string) => (s === "OVERDUE" ? "danger" : s === "DUE_SOON" ? "warning" : "success");

  const columns = [
    { key: "trackingId", label: "Tracking ID", render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-link)" }}>{v as string}</span> },
    { key: "companyName", label: "Company" },
    { key: "sector", label: "Sector" },
    { key: "preferredDistricts", label: "Districts", render: (v: unknown) => ((v as string[]) || []).join(", ") || "—" },
    { key: "indicativeBudget", label: "Budget", render: (v: unknown) => fmtCurrency(v as number | string | null) },
    { key: "assignedRelationshipManager", label: "Assigned RM", render: (_: unknown, row: Record<string, unknown>) => {
      const rm = row.assignedRelationshipManager as Enquiry["assignedRelationshipManager"];
      return rm?.email ? rm.email.split("@")[0] : <span style={{ color: "var(--gov-text-muted)" }}>Unassigned</span>;
    }},
    { key: "slaStatus", label: "SLA", render: (v: unknown) => {
      const s = (v as string) || "ON_TRACK";
      return <GovStatusBadge variant={slaVariant(s) as "danger" | "warning" | "success"}>{s.replace(/_/g, " ")}</GovStatusBadge>;
    }},
    { key: "status", label: "Status", render: (v: unknown) => { const s = (v as string) || ""; return <GovStatusBadge variant={statusToVariant(s)}>{s.replace(/_/g, " ")}</GovStatusBadge>; } },
    { key: "submittedAt", label: "Submitted", render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString() : "—") },
    { key: "id", label: "Action", align: "right" as const, render: (_: unknown, row: Record<string, unknown>) => {
      const assigned = Boolean(row.assignedRelationshipManager);
      return assigned ? null : (
        <GovButton variant="secondary" style={{ fontSize: 11, padding: "3px 10px", minHeight: 28 }} onClick={(e) => { e.stopPropagation(); openAssign(row.id as string); }}>
          Assign RM
        </GovButton>
      );
    }},
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Admin / Requirements Pending"
        title="Requirements Pending"
        description="Corporate CSR enquiries awaiting action — RM assignment, first contact, feasibility assessment, and JS approval."
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

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
          <select className="gov-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: 260 }}>
            <option value="">All Pending Statuses</option>
            {PENDING_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <span style={{ fontSize: 12, color: "var(--gov-text-muted)" }}>Showing {shown.length} of {pending.length} pending</span>
        </div>

        {assigningId && (
          <GovCard style={{ marginTop: 12 }}>
            <GovCardBody>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Assign Relationship Manager:</span>
                <select className="gov-select" value={selectedRm} onChange={(e) => setSelectedRm(e.target.value)} style={{ maxWidth: 280 }}>
                  <option value="">Select RM…</option>
                  {rms.map((rm) => <option key={rm.id} value={rm.id}>{rm.email}</option>)}
                </select>
                <GovButton variant="primary" onClick={confirmAssign} disabled={!selectedRm}>Confirm</GovButton>
                <GovButton variant="muted" onClick={() => setAssigningId(null)}>Cancel</GovButton>
                {actionError && <span style={{ fontSize: 12, color: "var(--gov-danger)", fontWeight: 700 }}>{actionError}</span>}
              </div>
            </GovCardBody>
          </GovCard>
        )}

        <div style={{ marginTop: 12 }}>
          <GovDataTable
            columns={columns}
            data={shown as unknown as Record<string, unknown>[]}
            loading={loading}
            error={error}
            emptyMessage="No pending corporate enquiries."
          />
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
