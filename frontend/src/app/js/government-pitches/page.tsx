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
import { hasPageAccess, JS_ACCESS_PERMS } from "@/lib/roleAccess";

interface PendingPitch {
  id: string;
  pitchReferenceId: string;
  officialName: string;
  department: string;
  district: string;
  estimatedCost: string | number;
  govtFundDeclaration: boolean;
  jsApprovalDueAt: string;
  status: string;
}

export default function JSGovernmentPitchesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pitches, setPitches] = useState<PendingPitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchPitches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: PendingPitch[] }>("/js/government-pitches");
      setPitches(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load government pitches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasPageAccess(JS_ACCESS_PERMS)) {
      fetchPitches();
    }
  }, [mounted, fetchPitches]);

  if (!mounted) return null;
  if (!hasPageAccess(JS_ACCESS_PERMS)) {
    return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;
  }

  const filtered = pitches.filter((p) => {
    if (filterDistrict && p.district !== filterDistrict) return false;
    return true;
  });

  const MAHARASHTRA_DISTRICTS = [
    "Mumbai City",
    "Mumbai Suburban",
    "Thane",
    "Palghar",
    "Raigad",
    "Ratnagiri",
    "Sindhudurg",
    "Nashik",
    "Dhule",
    "Nandurbar",
    "Jalgaon",
    "Ahmednagar",
    "Pune",
    "Satara",
    "Sangli",
    "Solapur",
    "Kolhapur",
    "Aurangabad",
    "Jalna",
    "Beed",
    "Osmanabad",
    "Nanded",
    "Latur",
    "Parbhani",
    "Hingoli",
    "Amravati",
    "Akola",
    "Washim",
    "Buldhana",
    "Yavatmal",
    "Wardha",
    "Nagpur",
    "Bhandara",
    "Gondia",
    "Chandrapur",
    "Gadchiroli",
  ];

  const districts = MAHARASHTRA_DISTRICTS;
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtCurrency = (v: string | number) => `₹${Number(v).toLocaleString("en-IN")}`;

  const columns = [
    { key: "pitchReferenceId", label: "Pitch Reference ID", render: (v: unknown) => <span style={{ fontWeight: 700 }}>{v as string}</span> },
    { key: "officialName", label: "Official Name" },
    { key: "department", label: "Department" },
    { key: "district", label: "District" },
    { key: "estimatedCost", label: "Estimated Cost", render: (v: unknown) => fmtCurrency(v as string | number) },
    { key: "govtFundDeclaration", label: "Govt Fund Decl.", render: (v: unknown) => (v as boolean) ? "Decl. Confirmed" : "No Decl." },
    { key: "jsApprovalDueAt", label: "JS Due Date", render: (v: unknown) => fmtDate(v as string) },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => <GovStatusBadge variant={statusToVariant(v as string)}>{(v as string).replace(/_/g, " ")}</GovStatusBadge>
    },
    {
      key: "id",
      label: "Action",
      align: "right" as const,
      render: (v: unknown) => (
        <GovButton variant="primary" onClick={() => router.push(`/js/government-pitches/${v as string}`)} style={{ fontSize: 11, padding: "4px 10px", minHeight: 28 }}>Review</GovButton>
      )
    }
  ];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Government Pitch Approvals"
        title="Government Pitch Approvals"
        description="Approve RM-verified government department CSR requirements for public listing."
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
                Showing {filtered.length} of {pitches.length} pending pitches
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
              emptyMessage="No pending government pitches awaiting approval."
              onRowClick={(row) => router.push(`/js/government-pitches/${row.id}`)}
            />
          </GovCardBody>
        </GovCard>
      </GovPageShell>
    </GovPortalLayout>
  );
}
