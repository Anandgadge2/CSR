/**
 * Role identity model for MahaCSR.
 *
 * The Prisma `User.role` enum column holds ONLY three coarse buckets:
 *   SUPER_ADMIN | CORPORATE_USER | GOVERNMENT_OFFICER
 *
 * Every other "role" (Joint Secretary, Relationship Manager, Nodal Officer,
 * Admin, etc.) is a dynamic `OrganizationRole` row identified by a stable
 * `slug`. Those slugs are what business logic and route guards compare against.
 *
 * `Role` below is a UNION of both worlds so existing call sites like
 * `authorizeRoles([Role.JOINT_SECRETARY])` and `userRole === Role.RELATIONSHIP_MANAGER`
 * keep compiling. The value of each dynamic entry is the role's canonical slug.
 *
 * IMPORTANT: the JWT only carries the 3-value enum in `user.role`. To compare a
 * user against a dynamic role, resolve the user's role identity first
 * (see `getRoleIdentity` / `userHasRole` in ../services/roleResolver).
 */

/** The three values that physically exist in the Prisma Role enum column. */
export const BASE_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CORPORATE_USER: "CORPORATE_USER",
  GOVERNMENT_OFFICER: "GOVERNMENT_OFFICER",
} as const;

export type BaseRole = (typeof BASE_ROLE)[keyof typeof BASE_ROLE];

/**
 * Canonical slugs for the well-known dynamic roles. These live in
 * OrganizationRole.slug and are stable across renames.
 */
export const ROLE_SLUG = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  PLANNING_SECRETARY: "planning-secretary",
  JOINT_SECRETARY: "joint-secretary",
  DISTRICT_NODAL_CONSULTANT: "district-nodal-consultant",
  DISTRICT_NODAL_OFFICER: "district-nodal-officer",
  RELATIONSHIP_MANAGER: "relationship-manager",
  CORPORATE_USER: "corporate-user",
  GOVERNMENT_OFFICER: "government-officer",
  // Legacy identities retained so historical checks still resolve.
  PORTAL_ADMIN: "portal-admin",
  CSR_ADMIN: "csr-admin",
  DISTRICT_ADMIN: "district-admin",
  STATE_CSR_CELL: "state-csr-cell",
  NGO_ADMIN: "ngo-admin",
  NGO_MEMBER: "ngo-member",
  COMPANY_ADMIN: "company-admin",
  COMPANY_MEMBER: "company-member",
  BENEFICIARY_AGENCY: "beneficiary-agency",
  IMPLEMENTING_AGENCY_USER: "implementing-agency-user",
  AUTHORIZED_SIGNATORY: "authorized-signatory",
  ANALYST_REVIEWER: "analyst-reviewer",
  COMPLIANCE_REVIEWER: "compliance-reviewer",
  FINANCE_USER: "finance-user",
  APPROVER: "approver",
  AUDITOR: "auditor",
} as const;

export type RoleSlug = (typeof ROLE_SLUG)[keyof typeof ROLE_SLUG];

/**
 * Unified `Role` map. Each key resolves to a stable identity string:
 *   - the three base roles resolve to their enum value (also a valid slug context)
 *   - all other roles resolve to their canonical slug.
 * This lets legacy references (`Role.JOINT_SECRETARY`) compile while carrying a
 * stable value usable by the role resolver.
 */
export const Role = {
  // Base enum roles (value === enum column value).
  SUPER_ADMIN: BASE_ROLE.SUPER_ADMIN,
  CORPORATE_USER: BASE_ROLE.CORPORATE_USER,
  GOVERNMENT_OFFICER: BASE_ROLE.GOVERNMENT_OFFICER,

  // Dynamic roles (value === canonical slug).
  ADMIN: ROLE_SLUG.ADMIN,
  PLANNING_SECRETARY: ROLE_SLUG.PLANNING_SECRETARY,
  JOINT_SECRETARY: ROLE_SLUG.JOINT_SECRETARY,
  DISTRICT_NODAL_CONSULTANT: ROLE_SLUG.DISTRICT_NODAL_CONSULTANT,
  DISTRICT_NODAL_OFFICER: ROLE_SLUG.DISTRICT_NODAL_OFFICER,
  CSR_RELATIONSHIP_MANAGER: ROLE_SLUG.RELATIONSHIP_MANAGER,
  RELATIONSHIP_MANAGER: ROLE_SLUG.RELATIONSHIP_MANAGER,

  // Legacy dynamic roles.
  PORTAL_ADMIN: ROLE_SLUG.PORTAL_ADMIN,
  CSR_ADMIN: ROLE_SLUG.CSR_ADMIN,
  DISTRICT_ADMIN: ROLE_SLUG.DISTRICT_ADMIN,
  STATE_CSR_CELL: ROLE_SLUG.STATE_CSR_CELL,
  NGO_ADMIN: ROLE_SLUG.NGO_ADMIN,
  NGO_MEMBER: ROLE_SLUG.NGO_MEMBER,
  COMPANY_ADMIN: ROLE_SLUG.COMPANY_ADMIN,
  COMPANY_MEMBER: ROLE_SLUG.COMPANY_MEMBER,
  BENEFICIARY_AGENCY: ROLE_SLUG.BENEFICIARY_AGENCY,
  IMPLEMENTING_AGENCY_USER: ROLE_SLUG.IMPLEMENTING_AGENCY_USER,
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
