"use client";

import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import Link from "next/link";
import { Loader } from "@/components/ui/Loader";

export default function EnquiriesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["corporate-enquiries"],
    "/corporate-enquiries"
  );

  const enquiries = envelope?.data?.enquiries || envelope?.data || envelope?.enquiries || (Array.isArray(envelope) ? envelope : []);

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Corporate Enquiries"
        title="Corporate Enquiries"
        description="Statewide corporate partnership proposals, indicative budgets, and assigned relationship managers."
      />

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader label="Loading Corporate Enquiries from Database..." />
        </div>
      ) : (
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Corporate Partnership Register ({enquiries.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div className="overflow-x-auto">
              <table className="gov-table w-full">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Company Name</th>
                    <th>Sector</th>
                    <th>Indicative Budget</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length > 0 ? (
                    enquiries.map((e: any) => (
                      <tr key={e.id}>
                        <td className="font-mono text-xs font-bold text-blue-900">{e.trackingId || e.id.slice(0, 8)}</td>
                        <td className="font-semibold">{e.companyName || e.company?.name || "Corporate Partner"}</td>
                        <td>{e.sector || "General"}</td>
                        <td className="font-mono">₹{e.indicativeBudget ? Number(e.indicativeBudget).toLocaleString("en-IN") : "0"}</td>
                        <td>
                          <GovStatusBadge variant={e.status === "APPROVED" ? "success" : "warning"}>
                            {e.status || "PENDING"}
                          </GovStatusBadge>
                        </td>
                        <td>
                          <Link href={`/track?id=${e.trackingId || e.id}`}>
                            <GovButton variant="secondary">Track / Inspect</GovButton>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                        No corporate enquiries recorded in database
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
