"use client";

import { useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { pageSlugForPath, pageViewKey, findPageByPath } from "@/lib/pageRegistry";
import { useToastActions } from "@/components/ui/Toast";

/**
 * PageGuard — Resilient Role & Permission Page Gate.
 *
 * Intercepts unauthorized navigation, shows a toast notification,
 * and seamlessly redirects unauthorized users back to /dashboard.
 */
export default function PageGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const toast = useToastActions();
  const pathname = usePathname();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const permissions = useAuthStore((s) => s.permissions);
  const roles = useAuthStore((s) => s.roles);
  const user = useAuthStore((s) => s.user);
  const isLoadingPermissions = useAuthStore((s) => s.isLoadingPermissions);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const decision = useMemo(() => {
    const cleanPath = pathname || "";
    const slug = pageSlugForPath(cleanPath);

    // Route not governed by the registry → always allow.
    if (!slug) return { allowed: true as const, slug: null };

    // Universal routes for all authenticated users or platform admins
    if (
      isAdmin ||
      slug === "dashboard" ||
      slug === "profile" ||
      slug === "settings" ||
      slug === "notifications" ||
      cleanPath === "/dashboard" ||
      cleanPath === "/profile" ||
      cleanPath === "/settings" ||
      cleanPath === "/notifications"
    ) {
      return { allowed: true as const, slug };
    }

    // While permissions are hydrating during initial login, allow access to prevent false 403 screens
    if (isLoadingPermissions || !Array.isArray(permissions) || permissions.length === 0) {
      return { allowed: true as const, slug };
    }

    // 1. Direct permission checks (exact slug, page:<slug>:view, wildcard)
    if (
      permissions.includes(pageViewKey(slug)) ||
      permissions.includes(`${slug}:view`) ||
      permissions.includes("*")
    ) {
      return { allowed: true as const, slug };
    }

    // 2. Singular/Plural permission mapping check (e.g. enquiries -> enquiry:view)
    const singularMap: Record<string, string[]> = {
      enquiries: ["enquiry:view", "enquiry:create", "enquiry:respond"],
      pitches: ["pitch:view", "pitch:create", "pitch:approve"],
      interests: ["interest:view", "interest:express", "interest:create"],
      assessments: ["assessment:view", "assessment:create", "assessment:review"],
      requirements: ["requirement:view", "requirement:create"],
      "convergence-projects": ["project:view", "project:view_assigned", "project:create"],
      companies: ["organization:view", "company_profile:manage"],
      agencies: ["organization:view", "ngo_login:create"],
      "ngo-registry": ["organization:view"],
      "fund-releases": ["fund:view", "fund:release", "fund:commit"],
      funds: ["fund:view", "fund:release"],
      reports: ["report:view", "report:generate"],
      "organization/onboarding": ["organization:view", "org-onboarding"],
      "org-onboarding": ["organization:view"],
      marketplace: ["marketplace:view", "project:view"],
      escalations: ["escalation:resolve", "project:view", "dashboard:view"],
      decisions: ["grievance:final_decision", "project:approve", "dashboard:view"],
      "nodal-appointments": ["dno:assign", "project:view", "dashboard:view"],
      inspections: ["inspection:upload", "site_visit:submit", "project:view"],
      handover: ["mou:sign", "project:close", "dashboard:view"],
      communications: ["enquiry:view", "meeting:schedule", "dashboard:view"],
      helpdesk: ["query:respond", "dashboard:view"],
    };

    const actionPerms = singularMap[slug] || [];
    if (actionPerms.some((p) => permissions.includes(p))) {
      return { allowed: true as const, slug };
    }

    return { allowed: false as const, slug };
  }, [pathname, isAdmin, permissions, roles, user, isLoadingPermissions]);

  useEffect(() => {
    if (!decision.allowed && decision.slug && !isLoadingPermissions) {
      const page = findPageByPath(pathname || "");
      toast.error(
        "Access Restricted",
        `You do not have permission to view the ${page ? page.label : "requested"} page.`
      );
      router.replace("/dashboard");
    }
  }, [decision.allowed, decision.slug, isLoadingPermissions, pathname, router, toast]);

  // Not a governed page or allowed → pass through untouched.
  if (!decision.slug || decision.allowed) return <>{children}</>;

  // Returning null prevents rendering the "Access restricted" error box on screen
  return null;
}
