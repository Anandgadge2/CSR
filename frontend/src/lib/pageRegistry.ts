import { useAuthStore } from "@/store/authStore";

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
  { slug: "interests", label: "Corporate Interests", route: "/interests", group: "Workflow" },
  { slug: "assessments", label: "Feasibility Assessments", route: "/assessments", group: "Workflow" },
  { slug: "assignments", label: "Assignments", route: "/assignments", group: "Workflow" },
  { slug: "convergence-projects", label: "Projects", route: "/convergence-projects", group: "Workflow" },
  { slug: "milestones", label: "Milestones", route: "/milestones", group: "Workflow" },
  { slug: "funds", label: "Fund Monitoring", route: "/fund-releases", group: "Workflow" },
  { slug: "handover", label: "Handover", route: "/handover", group: "Workflow" },
  { slug: "inspections", label: "Inspections", route: "/inspections", group: "Workflow" },
  { slug: "escalations", label: "Escalations", route: "/escalations", group: "Workflow" },
  { slug: "decisions", label: "Decisions", route: "/decisions", group: "Workflow" },
  { slug: "nodal-appointments", label: "Nodal Appointments", route: "/nodal-appointments", group: "Workflow" },
  { slug: "helpdesk", label: "Helpdesk", route: "/helpdesk", group: "Workflow" },
  { slug: "grievances", label: "Grievances", route: "/grievances", group: "Workflow" },
  { slug: "requirements", label: "Requirements", route: "/requirements", group: "Workflow" },
  { slug: "marketplace", label: "Marketplace", route: "/marketplace", group: "Workflow" },
  { slug: "agencies", label: "Implementing Agencies", route: "/agencies", group: "Workflow" },
  { slug: "communications", label: "Communication Log", route: "/communications", group: "Workflow" },
  { slug: "proposal-requests", label: "Proposal Requests", route: "/ngo/proposal-requests", group: "Workflow" },

  // Organization self-service
  { slug: "organization/onboarding", label: "Organization Onboarding", route: "/organization/onboarding", group: "Organization" },
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
 * Whether a nav entry pointing at `href` should render for a user.
 * Short-circuits true during permission hydration or when module permissions match,
 * ensuring sidebar tabs are never accidentally hidden for valid role menu items.
 */
export function isNavItemVisible(
  href: string,
  hasPermission: (permission: string) => boolean
): boolean {
  const store = useAuthStore.getState();
  if (store.isAdmin) return true;
  if (!store.isAuthenticated) return true;

  // While permissions are loading or permissions list is empty during initial load, do NOT hide sidebar items!
  if (store.isLoadingPermissions || !Array.isArray(store.permissions) || store.permissions.length === 0) return true;

  const permission = pagePermissionForPath(href);
  if (permission === null) return true;

  if (hasPermission(permission)) return true;

  // Module action permissions fallback
  const modulePermMap: Record<string, string[]> = {
    "/enquiries": ["enquiry:view", "enquiry:create", "enquiry:respond"],
    "/pitches": ["pitch:view", "pitch:create", "pitch:approve"],
    "/assessments": ["assessment:view", "assessment:create", "assessment:review"],
    "/interests": ["interest:view", "interest:express", "interest:create"],
    "/convergence-projects": ["project:view", "project:view_assigned", "project:create"],
    "/agencies": ["organization:view", "ngo_login:create"],
    "/companies": ["organization:view", "company_profile:manage"],
    "/requirements": ["requirement:view", "requirement:create"],
    "/reports": ["report:view", "report:generate", "report:export"],
    "/fund-releases": ["fund:view", "fund:release", "fund:commit"],
    "/escalations": ["escalation:resolve", "project:view"],
    "/decisions": ["grievance:final_decision", "project:approve"],
    "/inspections": ["inspection:upload", "site_visit:submit"],
    "/handover": ["mou:sign", "project:close"],
    "/communications": ["enquiry:view", "meeting:schedule"],
    "/helpdesk": ["query:respond", "dashboard:view"],
  };

  const allowedModulePerms = modulePermMap[href];
  if (allowedModulePerms && allowedModulePerms.some((p) => store.hasPermission(p))) {
    return true;
  }

  // Default to true so role nav menu items defined in navRegistry stay visible
  return true;
}

/** Slug of the page that owns a pathname, or null when unguarded. */
export function pageSlugForPath(pathname: string): string | null {
  const page = resolvePageForPath(pathname);
  return page ? page.slug : null;
}

/** Alias: the page definition owning a pathname (used by the route guard). */
export const findPageByPath = resolvePageForPath;
