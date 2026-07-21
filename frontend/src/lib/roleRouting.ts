/**
 * Dashboard routing by CANONICAL role identity.
 *
 * Per the dynamic-RBAC identity decision, role *names* are editable labels and
 * MUST NEVER drive behaviour. Routing keys off, in priority order:
 *   1. `roleNumericId` — the stable numeric id of the user's seeded OrganizationRole
 *      (mirror of backend SYSTEM_ROLE_IDS; never changes on rename).
 *   2. `roleSlug`      — the stable machine key (fallback for the non-seeded
 *      scoping identity and any custom role that maps onto a known slug).
 *   3. base `role` enum — last resort for enum-only users (CORPORATE_USER /
 *      GOVERNMENT_OFFICER / SUPER_ADMIN) that carry no dynamic OrganizationRole.
 *
 * This is the single source of truth for "which dashboard does this user land on".
 * Keep the maps below in sync with backend `config/platformAccess.ts`
 * (SYSTEM_ROLE_IDS) and `types/role.ts` (ROLE_SLUG).
 */

/** Frontend mirror of backend SYSTEM_ROLE_IDS. Stable, never reused. */
export const SYSTEM_ROLE_IDS = {
  SUPER_ADMIN: 1,
  PLANNING_SECRETARY: 2,
  JOINT_SECRETARY: 3,
  DISTRICT_NODAL_OFFICER: 4,
  DISTRICT_NODAL_CONSULTANT: 5,
  RELATIONSHIP_MANAGER: 6,
  NGO_ADMIN: 7,
  COMPANY_ADMIN: 8,
  GOVERNMENT_OFFICER: 12,
} as const;

/** numericId → dashboard route. The canonical routing map. */
export const DASHBOARD_BY_NUMERIC_ID: Record<number, string> = {
  [SYSTEM_ROLE_IDS.SUPER_ADMIN]: "/admin/dashboard",
  [SYSTEM_ROLE_IDS.PLANNING_SECRETARY]: "/secretary/dashboard",
  [SYSTEM_ROLE_IDS.JOINT_SECRETARY]: "/js/dashboard",
  [SYSTEM_ROLE_IDS.DISTRICT_NODAL_OFFICER]: "/nodal/dashboard",
  [SYSTEM_ROLE_IDS.DISTRICT_NODAL_CONSULTANT]: "/nodal/dashboard",
  [SYSTEM_ROLE_IDS.RELATIONSHIP_MANAGER]: "/rm/dashboard",
  [SYSTEM_ROLE_IDS.NGO_ADMIN]: "/ngo/dashboard",
  [SYSTEM_ROLE_IDS.COMPANY_ADMIN]: "/company/dashboard",
  [SYSTEM_ROLE_IDS.GOVERNMENT_OFFICER]: "/department/dashboard",
};

/**
 * slug → dashboard route. Fallback when numericId is absent (custom roles that
 * reuse a canonical slug, or the non-seeded `implementing-agency-user` scoping
 * identity which has no numericId).
 */
export const DASHBOARD_BY_SLUG: Record<string, string> = {
  "super-admin": "/admin/dashboard",
  "planning-secretary": "/secretary/dashboard",
  "joint-secretary": "/js/dashboard",
  "district-nodal-officer": "/nodal/dashboard",
  "district-nodal-consultant": "/nodal/dashboard",
  "relationship-manager": "/rm/dashboard",
  "ngo-admin": "/ngo/dashboard",
  "company-admin": "/company/dashboard",
  "government-officer": "/department/dashboard",
  "implementing-agency-user": "/convergence-projects",
};

/** base enum → dashboard route. Last-resort for users with no dynamic role. */
export const DASHBOARD_BY_BASE_ROLE: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  CORPORATE_USER: "/partner/dashboard",
  GOVERNMENT_OFFICER: "/department/dashboard",
};

export interface RoutableIdentity {
  /** Canonical numeric id of the user's seeded OrganizationRole. */
  roleNumericId?: number | null;
  /** Stable machine slug of the user's OrganizationRole. */
  roleSlug?: string | null;
  /** Base Prisma role enum bucket. */
  role?: string | null;
}

/**
 * Resolve the dashboard landing route for a user, keying off the canonical
 * identity in priority order (numericId → slug → base enum). Returns `fallback`
 * (default "/") when nothing matches.
 */
export function resolveDashboardPath(
  identity: RoutableIdentity,
  fallback = "/"
): string {
  const { roleNumericId, roleSlug, role } = identity;

  if (roleNumericId != null && DASHBOARD_BY_NUMERIC_ID[roleNumericId]) {
    return DASHBOARD_BY_NUMERIC_ID[roleNumericId];
  }
  if (roleSlug && DASHBOARD_BY_SLUG[roleSlug]) {
    return DASHBOARD_BY_SLUG[roleSlug];
  }
  if (role && DASHBOARD_BY_BASE_ROLE[role]) {
    return DASHBOARD_BY_BASE_ROLE[role];
  }
  return fallback;
}
