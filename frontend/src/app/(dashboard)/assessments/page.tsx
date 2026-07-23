"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";

export default function AssessmentsPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["feasibility-assessments"],
    "/feasibility"
  );

  const assessments = envelope?.data?.assessments || envelope?.data || envelope?.assessments || (Array.isArray(envelope) ? envelope : []);

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Feasibility Assessments"
        title="Feasibility Reports & Assessments"
        description="Technical assessment, financial viability evaluation, and risk reports compiled by Relationship Managers and Officers."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Assessments from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Feasibility Reports Register ({assessments.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Assessment Ref</th>
                    <th>Proposal / Project</th>
                    <th>Evaluator</th>
                    <th>Viability Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.length > 0 ? (
                    assessments.map((a: any) => (
                      <tr key={a.id}>
                        <td className="font-mono text-xs font-bold text-blue-900">{a.id.slice(0, 8)}</td>
                        <td className="font-semibold">{a.projectTitle || a.proposalTitle || "Assessment Report"}</td>
                        <td>{a.evaluatorName || a.evaluatorRole || "Relationship Manager"}</td>
                        <td className="font-bold">{a.score ? `${a.score}/100` : "Verified"}</td>
                        <td>
                          <GovStatusBadge variant={a.status === "APPROVED" ? "success" : "warning"}>
                            {a.status || "COMPLETED"}
                          </GovStatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                        No feasibility assessment reports in database
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
