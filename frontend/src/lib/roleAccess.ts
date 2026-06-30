import { getStoredUser } from "./api";

export interface StoredUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  tenantId?: string;
}

/** Get the current user from localStorage (client-side only). */
export function getCurrentUser(): StoredUser | null {
  const raw = getStoredUser();
  if (!raw || !raw.role) return null;
  return raw as StoredUser;
}

/** Check if the current user's role is in the allowed list. */
export function hasRoleAccess(allowedRoles: string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/** Admin roles that have global access to most features. */
export const ADMIN_ROLES = [
  "MASTER_ADMIN",
  "SUPER_ADMIN",
  "PORTAL_ADMIN",
  "CSR_ADMIN",
] as const;

/** Roles that can access grievance list (raise/view own). */
export const GRIEVANCE_ACCESS_ROLES = [
  ...ADMIN_ROLES,
  "CORPORATE_USER",
  "COMPANY_ADMIN",
  "COMPANY_MEMBER",
  "IMPLEMENTING_AGENCY_USER",
  "NGO_ADMIN",
  "NGO_MEMBER",
  "DISTRICT_NODAL_OFFICER",
  "DISTRICT_ADMIN",
  "STATE_CSR_CELL",
  "JOINT_SECRETARY",
  "PLANNING_SECRETARY",
  "CSR_RELATIONSHIP_MANAGER",
  "GOVERNMENT_OFFICER",
  "BENEFICIARY_AGENCY",
];

/** Roles that see the Nodal Officer grievance queue. */
export const NODAL_GRIEVANCE_ROLES = [
  ...ADMIN_ROLES,
  "DISTRICT_NODAL_OFFICER",
  "DISTRICT_ADMIN",
];

/** Roles that see the State CSR Cell grievance queue. */
export const STATE_CELL_GRIEVANCE_ROLES = [
  ...ADMIN_ROLES,
  "STATE_CSR_CELL",
  "JOINT_SECRETARY",
  "PLANNING_SECRETARY",
];

/** Roles that can access convergence projects. */
export const CONVERGENCE_PROJECT_ROLES = [
  ...ADMIN_ROLES,
  "CORPORATE_USER",
  "COMPANY_ADMIN",
  "COMPANY_MEMBER",
  "IMPLEMENTING_AGENCY_USER",
  "NGO_ADMIN",
  "NGO_MEMBER",
  "DISTRICT_NODAL_OFFICER",
  "DISTRICT_ADMIN",
  "CSR_RELATIONSHIP_MANAGER",
  "JOINT_SECRETARY",
  "PLANNING_SECRETARY",
  "STATE_CSR_CELL",
  "GOVERNMENT_OFFICER",
  "BENEFICIARY_AGENCY",
];

/** Roles that can respond to grievances (nodal/state cell/JS). */
export const GRIEVANCE_RESPOND_ROLES = [
  ...ADMIN_ROLES,
  "DISTRICT_NODAL_OFFICER",
  "DISTRICT_ADMIN",
  "STATE_CSR_CELL",
  "JOINT_SECRETARY",
];

/** Roles that can escalate grievances. */
export const GRIEVANCE_ESCALATE_ROLES = [
  ...ADMIN_ROLES,
  "DISTRICT_NODAL_OFFICER",
  "STATE_CSR_CELL",
  "JOINT_SECRETARY",
];

/** Roles that can close grievances. */
export const GRIEVANCE_CLOSE_ROLES = [
  ...ADMIN_ROLES,
  "STATE_CSR_CELL",
  "JOINT_SECRETARY",
];

/** Check if user is logged in. */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}

/** Joint Secretary role access list. */
export const JS_ROLES = [
  ...ADMIN_ROLES,
  "JOINT_SECRETARY",
];
