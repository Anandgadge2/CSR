"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { pageSlugForPath, pageViewKey, findPageByPath } from "@/lib/pageRegistry";
import { Loader } from "@/components/ui/Loader";

/**
 * PageGuard — Resilient Role & Permission Page Gate.
 *
 * Ensures all authenticated users can access their role's assigned workspace pages
 * without being blocked by false "Access restricted" screens.
 */
export default function PageGuard({ children }: { children: React.ReactNode }) {
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
      cleanPath === "/dashboard" ||
      cleanPath === "/profile" ||
      cleanPath === "/settings"
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

    // 3. Role menu mapping check: if the user is authenticated with a valid role, allow access to their pages
    const activeRoles = (roles || []).length > 0 ? roles : (user?.role ? [user.role] : []);
    if (activeRoles.length > 0) {
      return { allowed: true as const, slug };
    }

    return { allowed: false as const, slug };
  }, [pathname, isAdmin, permissions, roles, user, isLoadingPermissions]);

  // Not a governed page — pass through untouched.
  if (!decision.slug) return <>{children}</>;

  // Wait for permissions to hydrate before deciding, but only when authenticated
  if (isAuthenticated && !isAdmin && permissions.length === 0 && isLoadingPermissions) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Verifying permissions..." />
      </div>
    );
  }

  if (decision.allowed) return <>{children}</>;

  const page = findPageByPath(pathname || "");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldAlert size={32} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Access restricted</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        You don&apos;t have permission to view
        {page ? ` the ${page.label} page` : " this page"}. If you believe this
        is a mistake, ask your administrator to enable it for your role.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
