/**
 * RoleHierarchy Governance Service
 * 
 * NOTE: Role hierarchy features are intentionally DISABLED in MahaCSR access control engine
 * to eliminate risks of cyclic inheritance and non-transitive permission leakage.
 * All access resolution is flat, direct, and explicit via UserRoleAssignment.
 */

export class RoleHierarchyService {
  public static isHierarchyEnabled(): boolean {
    return false; // Intentionally disabled per architecture policy
  }

  public static async getInheritedRoleIds(_roleId: number): Promise<number[]> {
    // Explicitly returns only the target role ID without hierarchy expansion
    return [];
  }
}
