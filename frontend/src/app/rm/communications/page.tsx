"use client";

import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovDataTable from "@/components/gov/GovDataTable";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import GovButton from "@/components/gov/GovButton";
import { useApiQuery } from "@/lib/apiHooks";

interface Enquiry {
  id: string;
  trackingId: string;
  companyName: string;
  contactPersonName: string;
  mobile: string;
  email: string;
  status: string;
  firstContactedAt: string | null;
  updatedAt?: string;
  interactions?: { id: string; interactionType: string; interactionDate: string; summary: string }[];
}

export default function RMCommunicationsPage() {
  const { data, isLoading, error } = useApiQuery<{ data: Enquiry[] } | Enquiry[]>(
    ["rm", "communications"],
    "/rm/enquiries?limit=100",
    { staleTime: 30 * 1000 }
  );

  const enquiries = (Array.isArray(data) ? data : data?.data || []).map((enquiry) => ({
    ...enquiry,
    lastInteraction: enquiry.interactions?.[0]?.summary || (enquiry.firstContactedAt ? "First contact recorded" : "Contact pending"),
    lastInteractionAt: enquiry.interactions?.[0]?.interactionDate || enquiry.firstContactedAt || enquiry.updatedAt || null,
  }));

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title="Communication Log"
        description="Track RM follow-ups, first-contact SLA status, and enquiry interaction history."
        breadcrumb="Home / Communication Log"
      />

      {error && <GovAlert variant="danger" style={{ marginBottom: 16 }}>Failed to load communication log.</GovAlert>}

      <GovCard>
        <GovCardBody style={{ padding: 0 }}>
          <GovDataTable
            loading={isLoading}
            emptyMessage="No enquiry communications found."
            data={enquiries as unknown as Record<string, unknown>[]}
            columns={[
              { key: "trackingId", label: "Tracking ID", render: (value, row) => (
                <Link href={`/rm/enquiries/${(row as unknown as Enquiry).id}`} style={{ fontWeight: 700, color: "var(--gov-link)" }}>
                  {value as string}
                </Link>
              ) },
              { key: "companyName", label: "Company" },
              { key: "contactPersonName", label: "Contact" },
              { key: "email", label: "Email" },
              { key: "lastInteraction", label: "Last Log" },
              { key: "lastInteractionAt", label: "Logged At", render: (value) => value ? new Date(value as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-" },
              { key: "status", label: "Status", render: (value) => (
                <GovStatusBadge variant={statusToVariant(String(value || ""))}>
                  {String(value || "UNKNOWN").replace(/_/g, " ")}
                </GovStatusBadge>
              ) },
              { key: "action", label: "Action", render: (_value, row) => (
                <Link href={`/rm/enquiries/${(row as unknown as Enquiry).id}`}>
                  <GovButton variant="secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }}>Open</GovButton>
                </Link>
              ) },
            ]}
          />
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
