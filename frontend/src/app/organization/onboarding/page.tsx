"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OrganizationOnboardingWorkspace } from "@/components/admin/PlatformAdminWorkspaces";
import { apiFetch, getStoredUser } from "@/lib/api";

type OrganizationStatus = {
  organizationType?: string;
};

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const [showGenericWorkspace, setShowGenericWorkspace] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const role = user?.role as string | undefined;
    const storedOrganizationType = user?.organization?.organizationType as string | undefined;

    const routeByType = (organizationType?: string) => {
      if (organizationType === "GOVERNMENT_DEPARTMENT" || role === "BENEFICIARY_AGENCY") {
        router.replace("/organization/onboarding/department");
        return true;
      }
      if (organizationType === "CSR_COMPANY" || role === "COMPANY_ADMIN" || role === "COMPANY_MEMBER") {
        router.replace("/organization/onboarding/company");
        return true;
      }
      return false;
    };

    if (routeByType(storedOrganizationType)) return;

    apiFetch<OrganizationStatus>("/onboarding/status")
      .then((organization) => {
        if (!routeByType(organization?.organizationType)) {
          setShowGenericWorkspace(true);
        }
      })
      .catch(() => setShowGenericWorkspace(true));
  }, [router]);

  if (showGenericWorkspace) return <OrganizationOnboardingWorkspace />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 text-sm text-gov-muted md:px-8">
      <div className="border border-gov-line bg-white p-8 shadow-sm">
        <Loader2 className="mr-2 inline animate-spin" size={16} /> Loading organization onboarding...
      </div>
    </section>
  );
}
