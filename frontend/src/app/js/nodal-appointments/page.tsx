"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { hasPageAccess, JS_ACCESS_PERMS } from "@/lib/roleAccess";

interface Appointment {
  id: string;
  nodalOfficerName: string;
  designation: string;
  department: string;
  district: string;
  domain: string;
  appointmentLetterUrl: string | null;
  appointedAt: string;
  corporateEnquiry?: {
    trackingId: string;
    companyName: string;
    status: string;
  };
  governmentPitch?: {
    pitchReferenceId: string;
    officialName: string;
    status: string;
  };
}

export default function JSNodalAppointmentsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: Appointment[] }>("/js/nodal-appointments");
      setAppointments(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load nodal appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasPageAccess(JS_ACCESS_PERMS)) {
      fetchAppointments();
    }
  }, [mounted, fetchAppointments]);

  if (!mounted) return null;
  if (!hasPageAccess(JS_ACCESS_PERMS)) {
    return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;
  }

  const filtered = appointments.filter((a) => {
    if (filterDistrict && a.district !== filterDistrict) return false;
    return true;
  });

  const rawDistricts = appointments.map((a) => a.district);
  const districts = rawDistricts.filter((v, i) => rawDistricts.indexOf(v) === i).sort();
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const columns = [
    { key: "id", label: "Appointment ID", render: (v: unknown) => <span style={{ fontWeight: 700 }}>{v as string}</span> },
    { key: "nodalOfficerName", label: "Nodal Officer" },
    { key: "department", label: "Department" },
    { key: "district", label: "District" },
    { key: "domain", label: "Domain" },
    { key: "appointedAt", label: "Appointed Date", render: (v: unknown) => fmtDate(v as string) },
    {
      key: "appointmentLetterUrl",
      label: "Letter Status",
      render: (v: unknown) => (v as string) ? <GovStatusBadge variant="success">Issued</GovStatusBadge> : <GovStatusBadge variant="warning">Draft</GovStatusBadge>
    },
    {
      key: "corporateEnquiry",
      label: "Project Status",
      render: (_: unknown, row: Record<string, unknown>) => {
        const r = row as unknown as Appointment;
        const status = r.corporateEnquiry?.status || r.governmentPitch?.status || "—";
        return <GovStatusBadge variant="info">{status.replace(/_/g, " ")}</GovStatusBadge>;
      }
    },
    {
      key: "id",
      label: "Action",
      align: "right" as const,
      render: (v: unknown) => (
        <GovButton variant="primary" onClick={() => router.push(`/js/nodal-appointments/${v as string}`)} style={{ fontSize: 11, padding: "4px 10px", minHeight: 28 }}>View Details</GovButton>
      )
    }
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Nodal Appointments"
        title="Nodal Appointments Queue"
        description="Monitor, view, and replace Nodal Officers appointed to oversee approved CSR projects."
        actions={
          <GovButton variant="primary" onClick={() => router.push("/js/nodal-appointments/new")}>
            New Appointment
          </GovButton>
        }
      >
        {error && <GovAlert variant="danger">{error}</GovAlert>}

        {/* Filter */}
        <GovCard style={{ marginBottom: 16 }}>
          <GovCardBody>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label className="gov-label" style={{ fontWeight: 700, margin: 0 }}>Filter by District:</label>
              <select className="gov-select" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} style={{ maxWidth: 220 }}>
                <option value="">All Districts</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "var(--gov-text-muted)", marginLeft: "auto" }}>
                Showing {filtered.length} of {appointments.length} appointments
              </span>
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
              emptyMessage="No nodal appointments issued yet."
              onRowClick={(row) => router.push(`/js/nodal-appointments/${row.id}`)}
            />
          </GovCardBody>
        </GovCard>
      </GovPageShell>
    </GovPortalLayout>
  );
}
