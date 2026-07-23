"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";

export default function AdminRiskReviewPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["risk-review"],
    "/org?status=UNDER_VERIFICATION"
  );

  const orgs = envelope?.data?.organizations || envelope?.data || envelope?.organizations || [];

  return (
    <GovPortalLayout userRole="ADMIN">
      <GovPageHeader
        breadcrumb="Admin / Risk Review"
        title="Risk Review Desk"
        description="Review compliance flags, duplicate records, document mismatches, and funding exception signals."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Risk Indicators from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Entities Requiring Compliance & Risk Evaluation ({orgs.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Kind</th>
                    <th>Risk Category</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.length > 0 ? (
                    orgs.map((org: any) => (
                      <tr key={org.id}>
                        <td className="font-semibold">{org.name || org.legalName || "Organization"}</td>
                        <td>{org.kind || "NGO"}</td>
                        <td>Compliance Check</td>
                        <td>
                          <GovStatusBadge variant="warning">{org.status || "REVIEW"}</GovStatusBadge>
                        </td>
                        <td>
                          <Link href={`/admin/applications/${org.id}`}>
                            <GovButton variant="primary">Evaluate Risk</GovButton>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                        No risk flags or pending compliance reviews in database
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GovCardBody>
        </GovCard>
      )}
    </GovPortalLayout>
  );
}
