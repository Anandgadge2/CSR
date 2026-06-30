"use client";

import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import { useApiQuery } from "@/lib/apiHooks";

interface Company {
  id: string;
  name: string;
  cin: string;
  officialEmail: string;
  officialPhone: string;
  district: string;
  status: string;
  annualCsrBudget?: number;
}

export default function RMCompaniesPage() {
  const { data, isLoading, error } = useApiQuery<Company[] | { data: Company[] }>(
    ["rm", "companies"],
    "/companies",
    { staleTime: 60 * 1000 }
  );

  const companies = Array.isArray(data) ? data : data?.data || [];

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title="Company Directory"
        description="CSR companies available for enquiry matching, follow-up, and partnership coordination."
        breadcrumb="Home / Company Directory"
      />

      {error && <GovAlert variant="danger" style={{ marginBottom: 16 }}>Failed to load company directory.</GovAlert>}

      <GovCard>
        <GovCardBody style={{ padding: 0 }}>
          <GovDataTable
            loading={isLoading}
            emptyMessage="No companies found."
            data={companies as unknown as Record<string, unknown>[]}
            columns={[
              { key: "name", label: "Company", render: (value, row) => (
                <div>
                  <strong>{value as string}</strong>
                  <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>CIN: {(row as unknown as Company).cin || "-"}</div>
                </div>
              ) },
              { key: "officialEmail", label: "Email" },
              { key: "officialPhone", label: "Phone" },
              { key: "district", label: "District" },
              { key: "annualCsrBudget", label: "CSR Budget", render: (value) => value ? `₹${Number(value).toLocaleString("en-IN")}` : "-" },
              { key: "status", label: "Status", render: (value) => (
                <GovStatusBadge variant={statusToVariant(String(value || ""))}>
                  {String(value || "UNKNOWN").replace(/_/g, " ")}
                </GovStatusBadge>
              ) },
            ]}
          />
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
