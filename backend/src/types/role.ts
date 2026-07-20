/**
 * Role identity model for MahaCSR — SINGLE SOURCE OF TRUTH.
 *
 * The Prisma `User.role` enum column holds ONLY three coarse buckets:
 *   SUPER_ADMIN | CORPORATE_USER | GOVERNMENT_OFFICER
 * It is an AUDIT/legacy tag only. Authorization is driven by the dynamic
 * `OrganizationRole.slug` (carried in the JWT as `roleSlug`) — see
 * `userHasRole` / `getRoleIdentity` in ../services/roleResolver.
 *
 * ── THE 9 SEEDED, ASSIGNABLE ROLES ──────────────────────────────────────────
 *   1. super-admin                — full platform control
 *   2. planning-secretary         — approve / suspend / release funds
 *   3. joint-secretary            — approve / assign / publish
 *   4. district-nodal-consultant  — read + update advisor
 *   5. district-nodal-officer     — verify / assign / create (district-scoped)
 *   6. relationship-manager       — enquiry handling
 *   7. company-admin              — corporate/funder admin (label "Corporate Admin")
 *   8. government-officer         — government-department user (demand side)
 *   9. ngo-admin                  — implementing-agency admin
 *
 * Anything beyond these 9 is added at runtime via the dynamic roles module
 * (OrganizationRole rows with custom permission sets). The constants in the
 * DEPRECATED ALIAS block below are retained ONLY so historical call sites keep
 * compiling; each resolves to one of the 9 canonical slugs. They are never
 * seeded and no user can hold them directly.
 */

/** The three values that physically exist in the Prisma Role enum column. */
export const BASE_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CORPORATE_USER: "CORPORATE_USER",
  GOVERNMENT_OFFICER: "GOVERNMENT_OFFICER",
} as const;

export type BaseRole = (typeof BASE_ROLE)[keyof typeof BASE_ROLE];

/**
 * Canonical slugs. The first 9 are the SEEDED, ASSIGNABLE roles. Below them are
 * a scoping identity (not a role) and deprecated aliases kept for compile-compat.
 * `slug` values are stable across renames and are what business logic compares.
 */
export const ROLE_SLUG = {
  // ── The 9 canonical seeded roles ──
  SUPER_ADMIN: "super-admin",
  PLANNING_SECRETARY: "planning-secretary",
  JOINT_SECRETARY: "joint-secretary",
  DISTRICT_NODAL_CONSULTANT: "district-nodal-consultant",
  DISTRICT_NODAL_OFFICER: "district-nodal-officer",
  RELATIONSHIP_MANAGER: "relationship-manager",
  COMPANY_ADMIN: "company-admin", // display label: "Corporate Admin"
  GOVERNMENT_OFFICER: "government-officer",
  NGO_ADMIN: "ngo-admin",
  CORPORATE_USER: "corporate-user", // base-enum companion of company-admin

  // ── Scoping identity (NOT an assignable role) ──
  // Row-level ownership marker for corporate sub-users; queries filter on this
  // slug (e.g. implementingAgencyUserId). Never seeded as a standalone role.
  IMPLEMENTING_AGENCY_USER: "implementing-agency-user",

  // ── DEPRECATED ALIASES — resolve to a canonical slug, never seeded ──
  // @deprecated collapse admin variants → super-admin
  ADMIN: "super-admin",
  PORTAL_ADMIN: "super-admin",
  CSR_ADMIN: "super-admin",
  // @deprecated district staff → district-nodal-officer
  DISTRICT_ADMIN: "district-nodal-officer",
  // @deprecated government demand-side → government-officer
  BENEFICIARY_AGENCY: "government-officer",
  // @deprecated org sub-users collapse into their org admin
  NGO_MEMBER: "ngo-admin",
  COMPANY_MEMBER: "company-admin",
  AUTHORIZED_SIGNATORY: "ngo-admin",
  // @deprecated dropped — retained inert so historical guard lists compile.
  // No user holds these; guards referencing them simply never match.
  STATE_CSR_CELL: "state-csr-cell",
  ANALYST_REVIEWER: "analyst-reviewer",
  COMPLIANCE_REVIEWER: "compliance-reviewer",
  FINANCE_USER: "finance-user",
  APPROVER: "approver",
  AUDITOR: "auditor",
} as const;

export type RoleSlug = (typeof ROLE_SLUG)[keyof typeof ROLE_SLUG];

/**
 * The 9 canonical seeded role slugs — the definitive assignable set. Used by
 * the seed and by the drift-guard test so the count can never silently grow.
 */
export const SEEDED_ROLE_SLUGS = [
  ROLE_SLUG.SUPER_ADMIN,
  ROLE_SLUG.PLANNING_SECRETARY,
  ROLE_SLUG.JOINT_SECRETARY,
  ROLE_SLUG.DISTRICT_NODAL_CONSULTANT,
  ROLE_SLUG.DISTRICT_NODAL_OFFICER,
  ROLE_SLUG.RELATIONSHIP_MANAGER,
  ROLE_SLUG.COMPANY_ADMIN,
  ROLE_SLUG.GOVERNMENT_OFFICER,
  ROLE_SLUG.NGO_ADMIN,
] as const;

/**
 * Unified `Role` map. Each key resolves to a stable identity string:
 *   - the three base roles resolve to their enum value
 *   - all other roles resolve to their canonical slug
 * Legacy references (`Role.PORTAL_ADMIN`, `Role.NGO_MEMBER`, …) still compile
 * and now resolve to the correct canonical slug.
 */
export const Role = {
  // Base enum roles (value === enum column value).
  SUPER_ADMIN: BASE_ROLE.SUPER_ADMIN,
  CORPORATE_USER: BASE_ROLE.CORPORATE_USER,
  GOVERNMENT_OFFICER: BASE_ROLE.GOVERNMENT_OFFICER,

  // Canonical dynamic roles (value === slug).
  PLANNING_SECRETARY: ROLE_SLUG.PLANNING_SECRETARY,
  JOINT_SECRETARY: ROLE_SLUG.JOINT_SECRETARY,
  DISTRICT_NODAL_CONSULTANT: ROLE_SLUG.DISTRICT_NODAL_CONSULTANT,
  DISTRICT_NODAL_OFFICER: ROLE_SLUG.DISTRICT_NODAL_OFFICER,
  CSR_RELATIONSHIP_MANAGER: ROLE_SLUG.RELATIONSHIP_MANAGER,
  RELATIONSHIP_MANAGER: ROLE_SLUG.RELATIONSHIP_MANAGER,
  COMPANY_ADMIN: ROLE_SLUG.COMPANY_ADMIN,
  NGO_ADMIN: ROLE_SLUG.NGO_ADMIN,

  // Scoping identity.
  IMPLEMENTING_AGENCY_USER: ROLE_SLUG.IMPLEMENTING_AGENCY_USER,

  // Deprecated aliases (value === canonical slug they collapse into).
  ADMIN: ROLE_SLUG.ADMIN,
  PORTAL_ADMIN: ROLE_SLUG.PORTAL_ADMIN,
  CSR_ADMIN: ROLE_SLUG.CSR_ADMIN,
  DISTRICT_ADMIN: ROLE_SLUG.DISTRICT_ADMIN,
  STATE_CSR_CELL: ROLE_SLUG.STATE_CSR_CELL,
  NGO_MEMBER: ROLE_SLUG.NGO_MEMBER,
  COMPANY_MEMBER: ROLE_SLUG.COMPANY_MEMBER,
  BENEFICIARY_AGENCY: ROLE_SLUG.BENEFICIARY_AGENCY,
  AUTHORIZED_SIGNATORY: ROLE_SLUG.AUTHORIZED_SIGNATORY,
  ANALYST_REVIEWER: ROLE_SLUG.ANALYST_REVIEWER,
  COMPLIANCE_REVIEWER: ROLE_SLUG.COMPLIANCE_REVIEWER,
  FINANCE_USER: ROLE_SLUG.FINANCE_USER,
  APPROVER: ROLE_SLUG.APPROVER,
  AUDITOR: ROLE_SLUG.AUDITOR,
} as const;

/**
 * A role identity is any base-enum value OR any dynamic slug. This is the type
 * accepted by `authorizeRoles` and comparisons throughout the codebase.
 */
export type Role = (typeof Role)[keyof typeof Role];

/** True if the given identity is one of the 3 physical enum column values. */
export const isBaseRole = (value: string | null | undefined): value is BaseRole =>
  value === BASE_ROLE.SUPER_ADMIN ||
  value === BASE_ROLE.CORPORATE_USER ||
  value === BASE_ROLE.GOVERNMENT_OFFICER;
