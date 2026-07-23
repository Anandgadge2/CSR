"use client";

import { useState, useEffect, useCallback } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody, GovCardHeader, GovCardTitle } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch, invalidateCache } from "@/lib/api";
import { hasPageAccess, ADMIN_ACCESS_PERMS } from "@/lib/roleAccess";

interface NodalAppointment {
  id: string;
  district: string;
  domain: string;
  nodalOfficerName: string;
  designation: string;
  department: string;
  appointedAt: string;
  nodalOfficerUser?: { email: string } | null;
  corporateEnquiry?: { trackingId: string; companyName: string; status: string } | null;
  governmentPitch?: { pitchReferenceId: string; officialName: string; status: string } | null;
}

interface PendingAgency {
  id: string;
  email: string;
  iaAgencyName: string | null;
  iaCsr1Number: string | null;
  parentCorporateUser?: { id: string; email: string } | null;
  createdAt: string;
}

const ACCESS_PERMS = ADMIN_ACCESS_PERMS;

export default function NgoSelectionPage() {
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<NodalAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [agencies, setAgencies] = useState<PendingAgency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(true);
  const [agenciesError, setAgenciesError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    setAppointmentsError("");
    try {
      const res = await apiFetch<{ success: boolean; data: NodalAppointment[] }>("/js/nodal-appointments");
      setAppointments(res?.data || []);
    } catch (err: unknown) {
      setAppointmentsError(err instanceof Error ? err.message : "Failed to load nodal appointments");
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const fetchAgencies = useCallback(async () => {
    setAgenciesLoading(true);
    setAgenciesError("");
    try {
      const res = await apiFetch<{ success: boolean; data: PendingAgency[] }>("/implementing-agency/approvals/pending");
      setAgencies(res?.data || []);
    } catch (err: unknown) {
      setAgenciesError(err instanceof Error ? err.message : "Failed to load pending implementing agencies");
    } finally {
      setAgenciesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasPageAccess(ACCESS_PERMS)) {
      fetchAppointments();
      fetchAgencies();
    }
  }, [mounted, fetchAppointments, fetchAgencies]);

  const decideAgency = async (id: string, decision: "APPROVE" | "REJECT") => {
    setActionError("");
    try {
      await apiFetch(`/implementing-agency/approvals/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision }),
      });
      invalidateCache("/implementing-agency");
      fetchAgencies();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to submit decision");
    }
  };

  if (!mounted) return null;
  if (!hasPageAccess(ACCESS_PERMS)) {
    return <AccessDenied />;
  }

  const kpis = [
    { label: "Nodal Appointments", value: appointments.length, color: "var(--gov-primary)" },
    { label: "Districts Covered", value: new Set(appointments.map((a) => a.district)).size, color: "var(--gov-link)" },
    { label: "Pending IA Approvals", value: agencies.length, color: "var(--gov-danger)" },
  ];

  const appointmentColumns = [
    { key: "nodalOfficerName", label: "Nodal Officer", render: (v: unknown, row: Record<string, unknown>) => {
      const user = row.nodalOfficerUser as NodalAppointment["nodalOfficerUser"];
      return (
        <div>
          <div style={{ fontWeight: 700 }}>{(v as string) || "—"}</div>
          <div style={{ fontSize: 12, color: "var(--gov-text-muted)" }}>{user?.email || ""}</div>
        </div>
      );
    }},
    { key: "district", label: "District" },
    { key: "domain", label: "Domain" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
    { key: "corporateEnquiry", label: "Source", render: (_: unknown, row: Record<string, unknown>) => {
      const enquiry = row.corporateEnquiry as NodalAppointment["corporateEnquiry"];
      const pitch = row.governmentPitch as NodalAppointment["governmentPitch"];
      if (enquiry) return <span>{enquiry.trackingId} · {enquiry.companyName}</span>;
      if (pitch) return <span>{pitch.pitchReferenceId}</span>;
      return "—";
    }},
    { key: "appointedAt", label: "Appointed", render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString() : "—") },
  ];

  const agencyColumns = [
    { key: "iaAgencyName", label: "Agency", render: (v: unknown) => <span style={{ fontWeight: 700 }}>{(v as string) || "—"}</span> },
    { key: "email", label: "Email" },
    { key: "iaCsr1Number", label: "CSR-1 Number", render: (v: unknown) => (v as string) || "—" },
    { key: "parentCorporateUser", label: "Sponsoring Corporate", render: (v: unknown) => {
      const parent = v as PendingAgency["parentCorporateUser"];
      return parent?.email || "—";
    }},
    { key: "createdAt", label: "Requested", render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString() : "—") },
    { key: "id", label: "Action", align: "right" as const, render: (_: unknown, row: Record<string, unknown>) => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <GovButton variant="primary" style={{ fontSize: 11, padding: "3px 10px", minHeight: 28 }} onClick={(e) => { e.stopPropagation(); decideAgency(row.id as string, "APPROVE"); }}>Approve</GovButton>
        <GovButton variant="danger" style={{ fontSize: 11, padding: "3px 10px", minHeight: 28 }} onClick={(e) => { e.stopPropagation(); decideAgency(row.id as string, "REJECT"); }}>Reject</GovButton>
      </div>
    )},
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Admin / Agency Selection"
        title="Implementing Agency & Nodal Selection"
        description="District nodal officer appointments for approved CSR initiatives, and pending implementing-agency (NGO) account approvals."
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

        <GovCard style={{ marginTop: 16 }}>
          <GovCardHeader>
            <GovCardTitle>Pending Implementing Agency Approvals</GovCardTitle>
            {actionError && <GovStatusBadge variant="danger">{actionError}</GovStatusBadge>}
          </GovCardHeader>
        </GovCard>
        <div style={{ marginTop: 8 }}>
          <GovDataTable
            columns={agencyColumns}
            data={agencies as unknown as Record<string, unknown>[]}
            loading={agenciesLoading}
            error={agenciesError}
            emptyMessage="No implementing agency accounts awaiting approval."
          />
        </div>

        <GovCard style={{ marginTop: 20 }}>
          <GovCardHeader>
            <GovCardTitle>Nodal Officer Appointments</GovCardTitle>
          </GovCardHeader>
        </GovCard>
        <div style={{ marginTop: 8 }}>
          <GovDataTable
            columns={appointmentColumns}
            data={appointments as unknown as Record<string, unknown>[]}
            loading={appointmentsLoading}
            error={appointmentsError}
            emptyMessage="No nodal officer appointments yet."
          />
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
