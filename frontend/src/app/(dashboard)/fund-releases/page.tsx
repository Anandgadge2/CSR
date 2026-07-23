"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";

export default function FundReleasesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["fund-releases"],
    "/convergence-projects"
  );

  const projects = envelope?.data?.projects || envelope?.data || envelope?.projects || [];

  return (
    <GovPortalLayout userRole="USER">
      <GovPageHeader
        breadcrumb="Dashboard / Fund Releases"
        title="Fund Release Queue"
        description="Review tranche readiness after milestone evidence is verified and approved for release."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Fund Releases from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Fund Release Register ({projects.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>District</th>
                    <th>Approved Budget</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length > 0 ? (
                    projects.map((p: any) => (
                      <tr key={p.id}>
                        <td className="font-semibold">{p.title || p.name}</td>
                        <td>{p.district || "Maharashtra"}</td>
                        <td className="font-mono">₹{p.approvedBudget ? Number(p.approvedBudget).toLocaleString("en-IN") : "0"}</td>
                        <td>
                          <GovStatusBadge variant={p.status === "COMPLETED" ? "success" : "warning"}>
                            {p.status || "IN_PROGRESS"}
                          </GovStatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500 font-medium">
                        No pending fund releases in database
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
