"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";

export default function CompaniesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["companies"],
    "/companies"
  );

  const companies = envelope?.data?.companies || envelope?.data || envelope?.companies || (Array.isArray(envelope) ? envelope : []);

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Company Directory"
        title="Company Directory"
        description="Statewide registry of corporate partners, CSR commitment profiles, CIN compliance, and active allocations."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Company Directory from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Registered Corporate Partners ({companies.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>CIN Number</th>
                    <th>District</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length > 0 ? (
                    companies.map((c: any) => (
                      <tr key={c.id}>
                        <td className="font-semibold">{c.name || c.legalName}</td>
                        <td className="font-mono text-xs">{c.cin || "N/A"}</td>
                        <td>{c.district || "Maharashtra"}</td>
                        <td>
                          <GovStatusBadge variant={c.status === "VERIFIED" || c.status === "ACTIVE" ? "success" : "warning"}>
                            {c.status || "VERIFIED"}
                          </GovStatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500 font-medium">
                        No companies registered in database
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
