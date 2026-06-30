"use client";

import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";

export default function PartnerEnquiriesPage() {
  return (
    <GovPortalLayout userRole="CORPORATE_USER">
      <GovPageHeader
        title="My Enquiries"
        description="Corporate enquiries submitted through Partner with Maharashtra"
        breadcrumb="Home / Partner / Enquiries"
      />
      <GovCard>
        <GovCardBody>
          <div className="p-8 text-center text-slate-500">
            Submit an enquiry from `/partner-with-maharashtra` and track it from `/track`. A corporate-authenticated list endpoint is not implemented yet.
          </div>
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
