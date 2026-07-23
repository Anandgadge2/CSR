/**
 * Frontend mirror of the backend PAGE_REGISTRY
 * (backend/src/config/platformAccess.ts).
 *
 * Single source of truth for which navigable pages exist and the permission
 * that governs each one. A role that holds `page:<slug>:view` sees the page's
 * nav entry and can open its route; a role that lacks it gets the nav entry
 * hidden AND the route blocked (403). SUPER_ADMIN bypasses all of this.
 *
 * Keep this list in sync with the backend registry. The backend also exposes
 * it at GET /api/roles/pages, which the roles editor loads at runtime so the
 * admin sees the authoritative list even if this mirror lags.
 */
export interface PageDef {
  slug: string;
  label: string;
  route: string;
  group: string;
}

export const PAGE_REGISTRY: PageDef[] = [
  // Shared
  { slug: "dashboard", label: "Dashboard", route: "/dashboard", group: "General" },
  { slug: "profile", label: "Profile", route: "/profile", group: "General" },
  { slug: "settings", label: "Settings", route: "/settings", group: "General" },
  { slug: "reports", label: "Reports", route: "/reports", group: "General" },
  { slug: "audit-trail", label: "Audit Trail", route: "/audit-logs", group: "General" },

  // Admin / platform administration
  { slug: "admin-dashboard", label: "Admin Dashboard", route: "/dashboard", group: "Administration" },
  { slug: "user-management", label: "User Management", route: "/admin/user-management", group: "Administration" },
  { slug: "roles-permissions", label: "Roles & Permissions", route: "/admin/roles-permissions", group: "Administration" },
  { slug: "onboarding-approvals", label: "Onboarding Approvals", route: "/admin/onboarding-approvals", group: "Administration" },
  { slug: "organizations", label: "Organizations", route: "/admin/organizations", group: "Administration" },
  { slug: "companies", label: "Companies", route: "/admin/companies", group: "Administration" },
  { slug: "ngo-registry", label: "Implementing Agencies", route: "/admin/ngo-registry", group: "Administration" },
  { slug: "sla-config", label: "SLA Configuration", route: "/admin/sla-config", group: "Administration" },

  // Workflow / applications
  { slug: "enquiries", label: "Corporate Enquiries", route: "/enquiries", group: "Workflow" },
  { slug: "pitches", label: "Government Pitches", route: "/pitches", group: "Workflow" },
  { slug: "feasibility", label: "Feasibility Assessments", route: "/feasibility", group: "Workflow" },
  { slug: "assignments", label: "Assignments", route: "/assignments", group: "Workflow" },
  { slug: "convergence-projects", label: "Projects", route: "/convergence-projects", group: "Workflow" },
  { slug: "milestones", label: "Milestones", route: "/milestones", group: "Workflow" },
  { slug: "funds", label: "Fund Monitoring", route: "/admin/fund-monitoring", group: "Workflow" },

  // Organization self-service
  { slug: "org-onboarding", label: "Organization Onboarding", route: "/organization/onboarding", group: "Organization" },
  { slug: "sub-logins", label: "Implementing Agency Logins", route: "/organization/sub-logins", group: "Organization" },
];

/** Permission key that governs visibility of a page slug. */
export const pageViewKey = (slug: string): string => `page:${slug}:view`;

/**
 * Resolve the page definition that owns a given pathname. Picks the entry
 * whose route is the longest matching prefix, so `/admin/fund-monitoring/x`
 * maps to the funds page and `/admin/dashboard` never collides with `/admin`.
 * Returns null when no registered page governs the path (unguarded route).
 */
export function resolvePageForPath(pathname: string): PageDef | null {
  let best: PageDef | null = null;
  for (const page of PAGE_REGISTRY) {
    if (pathname === page.route || pathname.startsWith(page.route + "/")) {
      if (!best || page.route.length > best.route.length) {
        best = page;
      }
    }
  }
  return best;
}

/**
 * The `page:<slug>:view` permission that governs a pathname, or null when the
 * path maps to no registered page (unguarded route — always allowed).
 */
export function pagePermissionForPath(pathname: string): string | null {
  const page = resolvePageForPath(pathname);
  return page ? pageViewKey(page.slug) : null;
}

/**
 * Whether a nav entry pointing at `href` should render for a user, given a
 * `hasPermission` checker (which already short-circuits true for SUPER_ADMIN).
 * Nav hrefs that map to no registered page are always shown — page-visibility
 * only governs registered pages; other gating stays with requiredPermission.
 */
export function isNavItemVisible(
  href: string,
  hasPermission: (permission: string) => boolean
): boolean {
  const permission = pagePermissionForPath(href);
  return permission === null || hasPermission(permission);
}

/** Slug of the page that owns a pathname, or null when unguarded. */
export function pageSlugForPath(pathname: string): string | null {
  const page = resolvePageForPath(pathname);
  return page ? page.slug : null;
}

/** Alias: the page definition owning a pathname (used by the route guard). */
export const findPageByPath = resolvePageForPath;
