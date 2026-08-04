"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrganizationOnboardingWorkspace } from "@/components/admin/PlatformAdminWorkspaces";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";

export default function DashboardOrganizationOnboardingPage() {
  return (
    <GovPortalLayout>
      <main className="mx-auto min-h-screen max-w-screen-2xl space-y-4 px-4 py-4 md:px-6">
        <GovPageHeader
          title="Organization Onboarding Status"
          eyebrow="Onboarding Workspace"
          description="Track the registration, verification, compliance audit, and approval status of your organization."
        />
        <OrganizationOnboardingWorkspace />
      </main>
    </GovPortalLayout>
  );
}
