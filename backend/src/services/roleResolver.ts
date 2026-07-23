import { ROLE_ID, getRoleId } from "../types/role";

export interface RolePrincipal {
  role?: string | number | null;
  roleId?: number | string | null;
  roleSlug?: string | null;
}

export function userHasRole(
  user: RolePrincipal | null | undefined,
  target: string | number
): boolean {
  if (!user) return false;
  const userRoleId = getRoleId(user.roleId ?? user.role);
  const targetRoleId = getRoleId(target);

  if (userRoleId !== null && targetRoleId !== null) {
    return userRoleId === targetRoleId;
  }
  return false;
}

export function userHasAnyRole(
  user: RolePrincipal | null | undefined,
  targets: Array<string | number>
): boolean {
  return targets.some((t) => userHasRole(user, t));
}

export function isSuperAdmin(user: RolePrincipal | null | undefined): boolean {
  return userHasRole(user, ROLE_ID.SUPER_ADMIN);
}

export function getRoleIdentity(user: RolePrincipal | null | undefined): number | null {
  if (!user) return null;
  return getRoleId(user.roleId ?? user.role);
}
