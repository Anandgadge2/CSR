import { Role, isBaseRole } from "../types/role";

/**
 * Minimal shape of the authenticated principal needed for role checks.
 * `role` is the coarse Prisma enum bucket (SUPER_ADMIN | CORPORATE_USER |
 * GOVERNMENT_OFFICER). `roleSlug` is the stable slug of the user's dynamic
 * OrganizationRole (e.g. "joint-secretary"), carried in the JWT.
 */
export interface RolePrincipal {
  role?: string | null;
  roleSlug?: string | null;
}

/**
 * True if the principal holds the given role identity, checking BOTH axes:
 *   1. the base enum bucket (role === "SUPER_ADMIN")
 *   2. the dynamic role slug (roleSlug === "joint-secretary")
 *
 * `target` is any value from the `Role` map — a base enum value or a slug.
 * This is the single primitive that replaces the old
 * `user.role === Role.X` comparisons, which no longer work now that
 * every internal staff user shares one of only three enum buckets.
 */
export function userHasRole(
  user: RolePrincipal | null | undefined,
  target: Role | string
): boolean {
  if (!user) return false;
  if (user.role && user.role === target) return true;
  if (user.roleSlug && user.roleSlug === target) return true;
  return false;
}

/** True if the principal holds ANY of the given role identities. */
export function userHasAnyRole(
  user: RolePrincipal | null | undefined,
  targets: Array<Role | string>
): boolean {
  return targets.some((t) => userHasRole(user, t));
}

/**
 * Super Admin bypass check — used by permission middleware / resolvers.
 * Recognises both the enum bucket and the protected slug.
 */
export function isSuperAdmin(user: RolePrincipal | null | undefined): boolean {
  return userHasRole(user, Role.SUPER_ADMIN) || user?.roleSlug === "super-admin";
}

/**
 * Best-effort single identity string for logging / routing decisions.
 * Prefers the dynamic slug, falls back to the base enum bucket.
 */
export function getRoleIdentity(user: RolePrincipal | null | undefined): string | null {
  if (!user) return null;
  if (user.roleSlug) return user.roleSlug;
  if (isBaseRole(user.role)) return user.role;
  return user.role ?? null;
}
