"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";

export default function PitchesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["government-pitches"],
    "/government-pitches"
  );

  const pitches = envelope?.data?.pitches || envelope?.data || envelope?.pitches || (Array.isArray(envelope) ? envelope : []);

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Government Pitches"
        title="Government Pitches & Proposals"
        description="District development needs, government department project proposals, and CSR sponsorship pitches."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Pitches from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Submitted Pitch Proposals ({pitches.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Project Title</th>
                    <th>Department</th>
                    <th>Estimated Outlay</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pitches.length > 0 ? (
                    pitches.map((p: any) => (
                      <tr key={p.id}>
                        <td className="font-mono text-xs font-bold text-blue-900">{p.id.slice(0, 8)}</td>
                        <td className="font-semibold">{p.title || p.projectName || "Pitch Proposal"}</td>
                        <td>{p.department || "Government Department"}</td>
                        <td className="font-mono">₹{p.estimatedOutlay ? Number(p.estimatedOutlay).toLocaleString("en-IN") : "0"}</td>
                        <td>
                          <GovStatusBadge variant={p.status === "APPROVED" ? "success" : "warning"}>
                            {p.status || "SUBMITTED"}
                          </GovStatusBadge>
                        </td>
                        <td>
                          <Link href={`/convergence-projects`}>
                            <GovButton variant="secondary">View Project</GovButton>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                        No pitch proposals recorded in database
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
