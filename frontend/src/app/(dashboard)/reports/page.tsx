"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import { Loader } from "@/components/ui/Loader";

export default function ReportsPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["reports"],
    "/reports"
  );

  const reports = envelope?.data?.reports || envelope?.data || envelope?.reports || [];

  return (
    <GovPortalLayout userRole="USER">
      <GovPageHeader
        breadcrumb="Dashboard / Reports"
        title="Reports Desk"
        description="Generate official summaries for onboarding status, CSR utilization, milestone releases, and audit registers."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Reports from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Available Compliance & Analytical Reports</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Report Code</th>
                    <th>Report Name</th>
                    <th>Category</th>
                    <th>Format</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((rpt: any) => (
                      <tr key={rpt.id || rpt.code}>
                        <td className="font-mono text-xs">{rpt.code || "RPT"}</td>
                        <td className="font-semibold">{rpt.name || rpt.title}</td>
                        <td>{rpt.category || "CSR Compliance"}</td>
                        <td>PDF / CSV</td>
                        <td>
                          <GovButton variant="primary">Generate Report</GovButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                        No report templates currently registered in database
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
