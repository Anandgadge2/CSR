"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";

export default function QueriesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["queries"],
    "/helpdesk"
  );

  const queries = envelope?.data?.queries || envelope?.data || envelope?.queries || [];

  return (
    <GovPortalLayout userRole="USER">
      <GovPageHeader
        breadcrumb="Dashboard / Queries"
        title="Queries and Clarifications"
        description="Respond to administrator document queries, compliance observations, and project review remarks."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Queries from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Helpdesk & Clarifications ({queries.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Query Ref</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.length > 0 ? (
                    queries.map((q: any) => (
                      <tr key={q.id}>
                        <td className="font-mono text-xs">{q.id.slice(0, 8)}</td>
                        <td className="font-semibold">{q.subject || q.title || "Query"}</td>
                        <td>{q.category || "General"}</td>
                        <td>
                          <GovStatusBadge variant={q.status === "RESOLVED" ? "success" : "warning"}>
                            {q.status || "OPEN"}
                          </GovStatusBadge>
                        </td>
                        <td>
                          {q.createdAt
                            ? new Date(q.createdAt).toLocaleDateString("en-IN")
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                        No active queries in database
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
