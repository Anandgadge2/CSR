"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";

export default function InterestsPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["company-interests"],
    "/company-interests"
  );

  const interests = envelope?.data?.interests || envelope?.data || envelope?.interests || (Array.isArray(envelope) ? envelope : []);

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Corporate Interests"
        title="Corporate Expression of Interest"
        description="Expressions of interest logged by corporates for specific government development needs and district projects."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Expressions of Interest from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Logged Expressions of Interest ({interests.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Corporate Partner</th>
                    <th>Target Need / Pitch</th>
                    <th>Proposed Outlay</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {interests.length > 0 ? (
                    interests.map((i: any) => (
                      <tr key={i.id}>
                        <td className="font-mono text-xs font-bold text-blue-900">{i.id.slice(0, 8)}</td>
                        <td className="font-semibold">{i.companyName || i.company?.name || "Corporate"}</td>
                        <td>{i.needTitle || i.pitchTitle || "Development Need"}</td>
                        <td className="font-mono">₹{i.proposedOutlay ? Number(i.proposedOutlay).toLocaleString("en-IN") : "0"}</td>
                        <td>
                          <GovStatusBadge variant={i.status === "ACCEPTED" ? "success" : "warning"}>
                            {i.status || "LOGGED"}
                          </GovStatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                        No expressions of interest recorded in database
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
