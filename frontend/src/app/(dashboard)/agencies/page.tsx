"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";

export default function AgenciesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["implementing-agencies"],
    "/org?kind=NGO"
  );

  const agencies = envelope?.data?.organizations || envelope?.data || envelope?.organizations || (Array.isArray(envelope) ? envelope : []);

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Implementing Agencies"
        title="Implementing Agencies Registry"
        description="Emphasized register of verified NGOs, Trust entities, and Section 8 implementing agencies."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Implementing Agencies from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Verified Implementing Agencies ({agencies.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Agency Name</th>
                    <th>Darpan / Registration ID</th>
                    <th>District</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.length > 0 ? (
                    agencies.map((a: any) => (
                      <tr key={a.id}>
                        <td className="font-semibold">{a.name || a.legalName}</td>
                        <td className="font-mono text-xs">{a.darpanId || a.id.slice(0, 8)}</td>
                        <td>{a.district || "Maharashtra"}</td>
                        <td>
                          <GovStatusBadge variant={a.status === "VERIFIED" || a.status === "ACTIVE" ? "success" : "warning"}>
                            {a.status || "VERIFIED"}
                          </GovStatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500 font-medium">
                        No implementing agencies registered in database
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
