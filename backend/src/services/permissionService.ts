import { EffectivePermissionService } from "./effectivePermissionService";

export interface UserPermissionPayload {
  permissions: string[];
  roles: string[];
  roleDetails: {
    id: number;
    numericId: number;
    name: string;
    isSystemRole: boolean;
  }[];
  isAdmin: boolean;
}

export async function resolveUserPermission(
  userId: string,
  permissionKey: string,
  _options?: { role?: string | number | null; organizationId?: string | null }
): Promise<boolean> {
  return EffectivePermissionService.hasPermission(userId, permissionKey);
}

export async function computeUserPermissions(principal: {
  userId: string;
  role?: string | number | null;
  roleId?: number | string | null;
  organizationId?: string | null;
}): Promise<UserPermissionPayload> {
  return EffectivePermissionService.computeLegacyPermissions(principal);
}
