"use client";

import { useState, useEffect, useCallback } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { hasRoleAccess, ADMIN_ROLES } from "@/lib/roleAccess";

interface PitchInterest {
  id: string;
  interestTrackingId: string;
  companyName: string;
  mca21Cin: string;
  contactPersonName: string;
  email: string;
  indicativeBudget: number | string | null;
  preferredStartTimeline: string;
  implementationMode: string;
  status: string;
  dialogueInitiated: boolean;
  createdAt: string;
  governmentPitch?: {
    pitchReferenceId: string;
    department: string;
    district: string;
    estimatedCost: number | string;
    status: string;
  } | null;
}

const ACCESS_ROLES = [...ADMIN_ROLES, "DISTRICT_ADMIN"];

export default function CompanyInterestsPage() {
  const [mounted, setMounted] = useState(false);
  const [interests, setInterests] = useState<PitchInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchInterests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: PitchInterest[] }>("/admin/pitch-interests");
      setInterests(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load company interests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasRoleAccess(ACCESS_ROLES)) fetchInterests();
  }, [mounted, fetchInterests]);

  if (!mounted) return null;
  if (!hasRoleAccess(ACCESS_ROLES)) {
    return <AccessDenied requiredRoles={[...ACCESS_ROLES]} />;
  }

  const filtered = filterStatus ? interests.filter((i) => i.status === filterStatus) : interests;
  const newInterests = interests.filter((i) => i.status === "INTERESTED").length;
  const inDialogue = interests.filter((i) => i.dialogueInitiated).length;
  const distinctCompanies = new Set(interests.map((i) => i.mca21Cin || i.companyName)).size;

  const kpis = [
    { label: "Total Interests", value: interests.length, color: "var(--gov-primary)" },
    { label: "New (Interested)", value: newInterests, color: "var(--gov-link)" },
    { label: "Dialogue Initiated", value: inDialogue, color: "var(--gov-success)" },
    { label: "Distinct Companies", value: distinctCompanies, color: "var(--gov-primary-dark)" },
  ];

  const statuses = Array.from(new Set(interests.map((i) => i.status))).sort();

  const fmtCurrency = (v: number | string | null | undefined) => {
    const n = Number(v);
    return v == null || isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN")}`;
  };

  const columns = [
    { key: "interestTrackingId", label: "Interest ID", render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-link)" }}>{v as string}</span> },
    { key: "companyName", label: "Company" },
    { key: "governmentPitch", label: "Government Pitch", render: (v: unknown) => {
      const pitch = v as PitchInterest["governmentPitch"];
      if (!pitch) return "—";
      return (
        <div>
          <div style={{ fontWeight: 700 }}>{pitch.pitchReferenceId}</div>
          <div style={{ fontSize: 12, color: "var(--gov-text-muted)" }}>{pitch.department}</div>
        </div>
      );
    }},
    { key: "district", label: "District", render: (_: unknown, row: Record<string, unknown>) => {
      const pitch = row.governmentPitch as PitchInterest["governmentPitch"];
      return pitch?.district || "—";
    }},
    { key: "indicativeBudget", label: "Indicative Budget", render: (v: unknown) => fmtCurrency(v as number | string | null) },
    { key: "implementationMode", label: "Mode", render: (v: unknown) => ((v as string) || "—").replace(/_/g, " ") },
    { key: "dialogueInitiated", label: "Dialogue", render: (v: unknown) => (
      <GovStatusBadge variant={v ? "success" : "muted"}>{v ? "Initiated" : "Not started"}</GovStatusBadge>
    )},
    { key: "status", label: "Status", render: (v: unknown) => { const s = (v as string) || ""; return <GovStatusBadge variant={statusToVariant(s)}>{s.replace(/_/g, " ")}</GovStatusBadge>; } },
    { key: "createdAt", label: "Received", render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString() : "—") },
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Admin / Company Interests"
        title="Company Interests"
        description="Corporate interest expressed against published government CSR pitches — track dialogue initiation and coordination status."
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
          <select className="gov-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: 220 }}>
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <span style={{ fontSize: 12, color: "var(--gov-text-muted)" }}>Showing {filtered.length} of {interests.length}</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <GovDataTable
            columns={columns}
            data={filtered as unknown as Record<string, unknown>[]}
            loading={loading}
            error={error}
            emptyMessage="No company interests received yet."
          />
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
