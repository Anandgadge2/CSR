"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrganizationOnboardingWorkspace } from "@/components/admin/PlatformAdminWorkspaces";
import { apiFetch, getStoredUser } from "@/lib/api";

type OrganizationStatus = {
  organizationType?: string;
};

export default function OrganizationOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    const role = user?.role as string | undefined;
    const storedOrganizationType = user?.organization?.organizationType as string | undefined;

    const routeByType = (organizationType?: string) => {
      if (organizationType === "GOVERNMENT_DEPARTMENT" || role === "BENEFICIARY_AGENCY") {
        router.replace("/organization/onboarding/department");
        return true;
      }
      if (
        organizationType === "CSR_COMPANY" ||
        role === "COMPANY_ADMIN" ||
        role === "COMPANY_MEMBER" ||
        role === "CORPORATE_USER"
      ) {
        router.replace("/organization/onboarding/company");
        return true;
      }
      return false;
    };

    if (routeByType(storedOrganizationType)) return;

    apiFetch<any>("/onboarding/status")
      .then((res) => {
        const org = res?.data || res || {};
        const currentStatus = (org.onboardingStatus || org.status || "").toUpperCase();
        const locked = ["SUBMITTED_FOR_REVIEW", "UNDER_VERIFICATION", "APPROVED", "ACTIVE", "SUSPENDED"];
        if (currentStatus && locked.includes(currentStatus)) {
          router.replace(currentStatus === "APPROVED" || currentStatus === "ACTIVE" ? "/organization/onboarding/details" : "/organization/onboarding/status");
          return;
        }
        routeByType(org.organizationType);
      })
      .catch(() => {});
  }, [router]);

  return <OrganizationOnboardingWorkspace />;
}

