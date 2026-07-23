"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { apiFetch } from "@/lib/api";
import "@/styles/gov-theme.css";

type OrganizationDocument = {
  id: string;
  documentType: string;
  fileUrl: string;
  fileName?: string | null;
  verificationStatus: string;
  remarks?: string | null;
  createdAt?: string;
};

type OnboardingReview = {
  id: string;
  reviewAction: string;
  remarks?: string | null;
  createdAt: string;
};

type Organization = {
  id: string;
  organizationType?: string;
  name?: string;
  legalName?: string | null;
  displayName?: string | null;
  registrationNumber?: string | null;
  cin?: string | null;
  llpin?: string | null;
  pan?: string | null;
  gst?: string | null;
  gstin?: string | null;
  departmentCode?: string | null;
  parentDepartment?: string | null;
  email?: string | null;
  officialEmail?: string | null;
  phone?: string | null;
  officialPhone?: string | null;
  website?: string | null;
  address?: string | null;
  district?: string | null;
  taluka?: string | null;
  onboardingStatus?: string;
  status?: string;
  documents?: OrganizationDocument[];
  csrCompanyProfile?: Record<string, any> | null;
  governmentDepartmentProfile?: Record<string, any> | null;
  onboardingReviews?: OnboardingReview[];
};

const statusVariant = (status?: string) => {
  if (status === "APPROVED") return "success" as const;
  if (["REJECTED", "SUSPENDED"].includes(status || "")) return "danger" as const;
  if (["SUBMITTED_FOR_REVIEW", "UNDER_VERIFICATION"].includes(status || "")) return "info" as const;
  return "warning" as const;
};

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// Profile keys hidden from the read-only view (internal/relational fields)
const HIDDEN_PROFILE_KEYS = new Set([
  "id",
  "organizationId",
  "tenantId",
  "createdAt",
  "updatedAt",
]);

function DetailGrid({ rows }: { rows: Array<[string, any]> }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900 break-words">{formatValue(value)}</div>
        </div>
      ))}
    </div>
  );
}

export default function OnboardingDetailsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Organization>("/onboarding/status")
      .then(setOrganization)
      .catch((err) => setError(err.message || "Failed to load onboarding details"))
      .finally(() => setLoading(false));
  }, []);

  const org: Organization = organization || ({ id: "" } as Organization);
  const profile = org.csrCompanyProfile || org.governmentDepartmentProfile || null;

  const organizationRows: Array<[string, any]> = [
    ["Legal Name", org.legalName || org.name],
    ["Display Name", org.displayName],
    ["Organization Type", org.organizationType?.replace(/_/g, " ")],
    ["Registration Number", org.registrationNumber],
    ["CIN", org.cin],
    ["LLPIN", org.llpin],
    ["PAN", org.pan],
    ["GSTIN", org.gstin || org.gst],
    ["Department Code", org.departmentCode],
    ["Parent Department", org.parentDepartment],
    ["Official Email", org.officialEmail || org.email],
    ["Official Phone", org.officialPhone || org.phone],
    ["Website", org.website],
    ["Address", org.address],
    ["District", org.district],
    ["Taluka", org.taluka],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "") as Array<[string, any]>;

  const profileRows: Array<[string, any]> = profile
    ? Object.entries(profile)
        .filter(([key, value]) => !HIDDEN_PROFILE_KEYS.has(key) && value !== null && value !== undefined && value !== "")
        .map(([key, value]) => [formatLabel(key), value])
    : [];

  return (
    <GovPortalLayout>
      <GovPageHeader
        title="Onboarding Details"
        breadcrumb="Organization / Onboarding / Details"
        description="Read-only record of the details submitted during organization onboarding. These details cannot be edited after submission."
        actions={
          <Link href="/organization/onboarding/status" passHref legacyBehavior>
            <GovButton variant="secondary">Onboarding Status</GovButton>
          </Link>
        }
      />

      <div className="gov-container">
        {error && <div className="gov-alert gov-alert-danger gov-mb-4">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 bg-white py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#14274e]" />
            <span className="text-xs font-semibold text-slate-500">Loading onboarding details...</span>
          </div>
        ) : !organization?.id ? (
          <div className="gov-empty">
            No onboarding submission found yet.{" "}
            <Link href="/organization/onboarding" className="font-semibold text-blue-700 underline">
              Start onboarding
            </Link>
          </div>
        ) : (
          <>
            {/* Status summary */}
            <div className="gov-grid gov-grid-cols-3 gov-mb-4">
              <GovCard>
                <GovCardBody>
                  <div className="gov-text-sm gov-text-muted gov-mb-1">Organization</div>
                  <div className="text-xl font-extrabold text-[#14274e]">{org.name || "—"}</div>
                </GovCardBody>
              </GovCard>
              <GovCard>
                <GovCardBody>
                  <div className="gov-text-sm gov-text-muted gov-mb-1">Onboarding Status</div>
                  <div className="mt-1">
                    <GovStatusBadge variant={statusVariant(org.onboardingStatus)}>
                      {(org.onboardingStatus || "REGISTERED").replace(/_/g, " ")}
                    </GovStatusBadge>
                  </div>
                </GovCardBody>
              </GovCard>
              <GovCard>
                <GovCardBody>
                  <div className="gov-text-sm gov-text-muted gov-mb-1">Account Status</div>
                  <div className="text-xl font-extrabold text-[#14274e]">{org.status || "—"}</div>
                </GovCardBody>
              </GovCard>
            </div>

            {/* Organization profile */}
            <GovCard className="gov-mb-4">
              <GovCardHeader>
                <GovCardTitle>Organization Profile</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                {organizationRows.length ? (
                  <DetailGrid rows={organizationRows} />
                ) : (
                  <div className="gov-empty">No profile details submitted.</div>
                )}
              </GovCardBody>
            </GovCard>

            {/* Entity profile (company compliance / department details) */}
            {profileRows.length > 0 && (
              <GovCard className="gov-mb-4">
                <GovCardHeader>
                  <GovCardTitle>
                    {org.csrCompanyProfile ? "CSR Compliance & Preferences" : "Department Details"}
                  </GovCardTitle>
                </GovCardHeader>
                <GovCardBody>
                  <DetailGrid rows={profileRows} />
                </GovCardBody>
              </GovCard>
            )}

            {/* Documents */}
            <GovCard className="gov-mb-4">
              <GovCardHeader>
                <GovCardTitle>Submitted Documents ({org.documents?.length || 0})</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                {org.documents?.length ? (
                  <div className="gov-table-container">
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>Document Type</th>
                          <th>File</th>
                          <th>Uploaded</th>
                          <th>Remarks</th>
                          <th>Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {org.documents.map((doc) => (
                          <tr key={doc.id}>
                            <td className="gov-font-semibold">{doc.documentType.replace(/_/g, " ")}</td>
                            <td>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                              >
                                <FileText size={14} /> {doc.fileName || "View"}
                              </a>
                            </td>
                            <td className="gov-text-sm">
                              {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("en-IN") : "—"}
                            </td>
                            <td className="gov-text-sm gov-text-muted">{doc.remarks || "—"}</td>
                            <td>
                              <GovStatusBadge
                                variant={
                                  doc.verificationStatus === "VERIFIED"
                                    ? "success"
                                    : doc.verificationStatus === "REJECTED"
                                    ? "danger"
                                    : "warning"
                                }
                              >
                                {doc.verificationStatus.replace(/_/g, " ")}
                              </GovStatusBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="gov-empty">No documents uploaded.</div>
                )}
              </GovCardBody>
            </GovCard>

            {/* Review timeline */}
            {(org.onboardingReviews?.length || 0) > 0 && (
              <GovCard>
                <GovCardHeader>
                  <GovCardTitle>Review Timeline</GovCardTitle>
                </GovCardHeader>
                <GovCardBody>
                  <div className="flex flex-col gap-3">
                    {org.onboardingReviews!.map((review) => (
                      <div key={review.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{review.reviewAction.replace(/_/g, " ")}</div>
                          {review.remarks && <div className="text-sm text-slate-600">{review.remarks}</div>}
                        </div>
                        <div className="whitespace-nowrap text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </GovCardBody>
              </GovCard>
            )}
          </>
        )}
      </div>
    </GovPortalLayout>
  );
}
