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

// ────────────────────────────────────────────────────────────────────────────
// Area authorization (which route-prefix "areas" an identity may enter).
//
// This replaces the old role-NAME string gate in SaaSLayout. Access is keyed on
// CANONICAL identity tokens — stable role slugs plus the three base-enum buckets
// — never on editable display names. Super Admin bypasses everything.
//
// An "identity token" is any of: a role slug ("joint-secretary"), or a base enum
// bucket ("SUPER_ADMIN" | "CORPORATE_USER" | "GOVERNMENT_OFFICER"). A user's
// token set is the union of every dynamic role slug they hold plus their base
// enum. A user may enter an area if their token set intersects the area's
// allow-list.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Ordered area rules. First rule whose `prefixes` matches the pathname wins.
 * `allow` lists the canonical identity tokens permitted in that area.
 * A rule with `allow: null` is open to any authenticated user.
 */
interface AreaRule {
  prefixes: string[];
  /** Canonical tokens (slugs + base-enum) allowed, or null for any authed user. */
  allow: string[] | null;
}

const AREA_RULES: AreaRule[] = [
  // Persona home areas — gated to the matching canonical identities.
  { prefixes: ["/ngo-dashboard", "/ngo"], allow: ["ngo-admin", "SUPER_ADMIN"] },
  { prefixes: ["/company-dashboard", "/company"], allow: ["company-admin", "corporate-user", "CORPORATE_USER", "SUPER_ADMIN"] },
  { prefixes: ["/partner"], allow: ["corporate-user", "company-admin", "CORPORATE_USER", "SUPER_ADMIN"] },
  { prefixes: ["/beneficiary", "/department"], allow: ["government-officer", "GOVERNMENT_OFFICER", "SUPER_ADMIN"] },
  { prefixes: ["/rm"], allow: ["relationship-manager", "joint-secretary", "planning-secretary", "SUPER_ADMIN"] },
  { prefixes: ["/js"], allow: ["joint-secretary", "planning-secretary", "SUPER_ADMIN"] },
  { prefixes: ["/secretary"], allow: ["planning-secretary", "SUPER_ADMIN"] },
  { prefixes: ["/nodal"], allow: ["district-nodal-officer", "district-nodal-consultant", "joint-secretary", "planning-secretary", "SUPER_ADMIN"] },
  { prefixes: ["/agency"], allow: ["implementing-agency-user", "corporate-user", "CORPORATE_USER", "SUPER_ADMIN"] },
  { prefixes: ["/government-portal", "/district", "/admin"], allow: ["SUPER_ADMIN"] },
  // Organization self-service — any org persona plus admin.
  { prefixes: ["/organization"], allow: ["ngo-admin", "company-admin", "corporate-user", "government-officer", "CORPORATE_USER", "GOVERNMENT_OFFICER", "SUPER_ADMIN"] },

  // Shared authenticated areas — open to any logged-in user (no persona gate).
  {
    prefixes: [
      "/dashboard", "/onboarding", "/queries", "/csr-projects", "/payments",
      "/fund-releases", "/reports", "/audit-logs", "/profile", "/settings",
      "/chat", "/analytics", "/grievances", "/convergence-projects", "/projects",
      "/public-development-needs", "/pitch-development-need",
      "/partner-with-maharashtra", "/track",
    ],
    allow: null,
  },
];

/**
 * Build the canonical identity-token set for a user from every stable signal we
 * hold: their dynamic role slugs (from roleDetails + the stored roleSlug) and
 * their base enum bucket. Display names are deliberately excluded.
 */
export function buildIdentityTokens(input: {
  roleSlug?: string | null;
  role?: string | null;
  roleDetailSlugs?: Array<string | null | undefined>;
}): string[] {
  const tokens = new Set<string>();
  if (input.roleSlug) tokens.add(input.roleSlug);
  if (input.role) tokens.add(input.role);
  (input.roleDetailSlugs ?? []).forEach((s) => {
    if (s) tokens.add(s);
  });
  return Array.from(tokens);
}

/**
 * True if a user holding `identityTokens` may enter the area that owns
 * `pathname`. Super Admin (enum bucket OR slug) always passes. Unmatched paths
 * default to allowed (they are not persona-gated areas). `isAdmin` short-circuits.
 */
export function canAccessArea(
  pathname: string,
  identityTokens: string[],
  isAdmin = false
): boolean {
  if (isAdmin) return true;
  if (identityTokens.includes("SUPER_ADMIN") || identityTokens.includes("super-admin")) {
    return true;
  }

  const rule = AREA_RULES.find((r) =>
    r.prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))
  );

  // No rule governs this path → not a persona-gated area → allow.
  if (!rule) return true;
  // Open authenticated area.
  if (rule.allow === null) return true;
  return rule.allow.some((token) => identityTokens.includes(token));
}
