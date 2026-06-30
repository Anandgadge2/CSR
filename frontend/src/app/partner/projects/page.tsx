"use client";

import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";

export default function PartnerProjectsPage() {
  return (
    <GovPortalLayout userRole="CORPORATE_USER">
      <GovPageHeader
        title="My Projects"
        description="Corporate partner convergence projects and utilization status"
        breadcrumb="Home / Partner / Projects"
      />
      <GovCard>
        <GovCardBody>
          <div className="p-8 text-center text-slate-500">
            Convergence project read APIs exist under `/api/convergence-projects`, but the corporate partner project list currently needs a connected backend implementation.
          </div>
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
