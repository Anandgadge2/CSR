/**
 * Row-level authorization — buildScopeFilter(user, entity).
 *
 * Returns a Prisma `where`-fragment that narrows a query to the rows a given
 * principal is allowed to see for a given entity. This is the data-layer
 * complement to permission checks (which gate whether an action is allowed at
 * all): once a user is permitted to view "enquiries", this decides *which*
 * enquiries.
 *
 * Design rules:
 *   1. SUPER_ADMIN (and the super-admin slug) → no filter (`{}`), sees everything.
 *   2. Platform-wide staff (planning secretary, joint secretary, RM, state cell,
 *      admin variants) → no filter for the core workflow entities they operate
 *      on state-wide.
 *   3. District-scoped staff (district nodal officer/consultant, district admin)
 *      → filtered to their `assignedDistrict`.
 *   4. Ownership-scoped principals (corporate users, government officers,
 *      implementing agencies) → filtered to rows they submitted / are assigned to.
 *   5. FAIL CLOSED: if none of the above match, return a filter that matches no
 *      rows (`{ id: "__no_access__" }`) rather than leaking data.
 *
 * The returned object is spread directly into a Prisma `where`, e.g.
 *   prisma.corporateEnquiry.findMany({ where: { ...scope, status: "OPEN" } })
 */
import { Role } from "../types/role";
import { ROLE_SLUG } from "../types/role";
import { getRoleIdentity, isSuperAdmin } from "./roleResolver";

/** Principal fields consumed by scoping. Superset of the JWT payload. */
export interface ScopePrincipal {
  id: string;
  role?: Role | string | null;
  roleSlug?: string | null;
  organizationId?: string | null;
  ngoId?: string | null;
  companyId?: string | null;
  assignedDistrict?: string | null;
  beneficiaryProfileId?: string | null;
}

/** Entities that support row-level scoping. */
export type ScopableEntity =
  | "corporateEnquiry"
  | "governmentPitch"
  | "convergenceProject"
  | "projectAssignment"
  | "csrRequirement"
  | "feasibilityAssessment";

/** A Prisma where-fragment. `{}` = unrestricted; NO_ACCESS = matches nothing. */
export type ScopeFilter = Record<string, unknown>;

/** Sentinel filter that matches no rows — used to fail closed. */
const NO_ACCESS: ScopeFilter = { id: "__no_access__" };

/** Roles that operate state-wide over the core CSR workflow (no district cap). */
const STATE_WIDE_SLUGS: string[] = [
  ROLE_SLUG.SUPER_ADMIN,
  ROLE_SLUG.ADMIN,
  ROLE_SLUG.PORTAL_ADMIN,
  ROLE_SLUG.CSR_ADMIN,
  ROLE_SLUG.PLANNING_SECRETARY,
  ROLE_SLUG.JOINT_SECRETARY,
  ROLE_SLUG.RELATIONSHIP_MANAGER,
  ROLE_SLUG.STATE_CSR_CELL,
  ROLE_SLUG.AUDITOR,
];

/** Roles scoped to a single district via `assignedDistrict`. */
const DISTRICT_SCOPED_SLUGS: string[] = [
  ROLE_SLUG.DISTRICT_ADMIN,
  ROLE_SLUG.DISTRICT_NODAL_OFFICER,
  ROLE_SLUG.DISTRICT_NODAL_CONSULTANT,
];

/**
 * Build the row-level scope filter for a principal + entity.
 *
 * @returns a Prisma where-fragment. `{}` means unrestricted (see everything);
 *          any non-empty object narrows the result set. Fails closed to a
 *          no-rows sentinel when the principal has no defined scope.
 */
export function buildScopeFilter(
  user: ScopePrincipal | null | undefined,
  entity: ScopableEntity
): ScopeFilter {
  if (!user) return NO_ACCESS;

  // 1. Super admin sees everything.
  if (isSuperAdmin(user)) return {};

  const identity = getRoleIdentity(user);

  // 2. State-wide workflow staff: unrestricted over these workflow entities.
  if (identity && STATE_WIDE_SLUGS.includes(identity)) {
    return {};
  }

  // 3. District-scoped staff: cap to their assigned district where the entity
  //    carries a `district` column. Entities without one fall through to
  //    ownership / fail-closed so we never accidentally widen access.
  if (identity && DISTRICT_SCOPED_SLUGS.includes(identity)) {
    const district = user.assignedDistrict;
    if (!district) return NO_ACCESS; // scoped role with no district = no rows
    switch (entity) {
      case "corporateEnquiry":
        return { preferredDistricts: { has: district } };
      case "governmentPitch":
      case "convergenceProject":
      case "csrRequirement":
        return { district };
      case "projectAssignment":
        // Assignments have no district column; district staff see the ones
        // addressed to them.
        return { assignedToId: user.id };
      case "feasibilityAssessment":
        // Feasibility rows reach district via their linked pitch.
        return { governmentPitch: { district } };
      default:
        return NO_ACCESS;
    }
  }

  // 4. Ownership-scoped principals: corporate users, government officers,
  //    implementing agencies — see only rows they submitted / are assigned to.
  return ownershipScope(user, entity);
}

/**
 * Ownership scoping for non-staff principals. Each entity resolves to the
 * column that ties a row to this user (submission, assignment, or org link).
 */
function ownershipScope(user: ScopePrincipal, entity: ScopableEntity): ScopeFilter {
  switch (entity) {
    case "corporateEnquiry":
      // Corporate users see enquiries they submitted; RMs are handled state-wide.
      return { submittedByUserId: user.id };
    case "governmentPitch":
      return { submittedByUserId: user.id };
    case "convergenceProject":
      // A project touches several principals; match any role this user fills.
      return {
        OR: [
          { nodalOfficerUserId: user.id },
          { implementingAgencyUserId: user.id },
          { corporateUserId: user.id },
        ],
      };
    case "projectAssignment":
      return { assignedToId: user.id };
    case "csrRequirement":
      // Beneficiary agencies own requirements via their profile.
      return user.beneficiaryProfileId
        ? { beneficiaryProfileId: user.beneficiaryProfileId }
        : NO_ACCESS;
    case "feasibilityAssessment":
      // No ownership handle for non-staff — fail closed.
      return NO_ACCESS;
    default:
      return NO_ACCESS;
  }
}

/** True when a scope fragment permits at least some rows (not the fail-closed sentinel). */
export function scopeAllowsAny(scope: ScopeFilter): boolean {
  return scope !== NO_ACCESS && !(("id" in scope) && scope.id === "__no_access__");
}
