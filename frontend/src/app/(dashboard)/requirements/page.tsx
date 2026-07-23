"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";

export default function RequirementsPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["csr-requirements"],
    "/csr-requirements"
  );

  const requirements = envelope?.data?.requirements || envelope?.data || envelope?.requirements || (Array.isArray(envelope) ? envelope : []);

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / CSR Requirements"
        title="Department CSR Requirements"
        description="Public development needs and government department project requirements posted across districts."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Requirements from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Submitted CSR Requirements ({requirements.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Requirement Title</th>
                    <th>Sector</th>
                    <th>District</th>
                    <th>Estimated Cost</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.length > 0 ? (
                    requirements.map((r: any) => (
                      <tr key={r.id}>
                        <td className="font-mono text-xs font-bold text-blue-900">{r.id.slice(0, 8)}</td>
                        <td className="font-semibold">{r.title || r.projectName || "CSR Need"}</td>
                        <td>{r.category || r.sector || "General"}</td>
                        <td>{r.district || "Maharashtra"}</td>
                        <td className="font-mono">₹{r.estimatedCost ? Number(r.estimatedCost).toLocaleString("en-IN") : "0"}</td>
                        <td>
                          <GovStatusBadge variant={r.status === "APPROVED" || r.status === "ACTIVE" ? "success" : "warning"}>
                            {r.status || "SUBMITTED"}
                          </GovStatusBadge>
                        </td>
                        <td>
                          <Link href={`/convergence-projects`}>
                            <GovButton variant="secondary">View Details</GovButton>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 font-medium">
                        No CSR requirements recorded in database
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
