/**
 * Strict 9 System Roles & Numeric IDs for MahaCSR — Single Source of Truth.
 */
import { SYSTEM_ROLE_IDS } from "../config/platformAccess";

export const ROLE_ID = SYSTEM_ROLE_IDS;

export type RoleID = (typeof ROLE_ID)[keyof typeof ROLE_ID];

export const SYSTEM_ROLES = {
  SUPER_ADMIN: { id: 1, name: "Super Administrator" },
  PLANNING_SECRETARY: { id: 2, name: "Planning Secretary" },
  JOINT_SECRETARY: { id: 3, name: "Joint Secretary" },
  DISTRICT_NODAL_OFFICER: { id: 4, name: "District Nodal Officer" },
  DISTRICT_NODAL_CONSULTANT: { id: 5, name: "District Nodal Consultant" },
  RELATIONSHIP_MANAGER: { id: 6, name: "CSR Relationship Manager" },
  GOVERNMENT_OFFICER: { id: 7, name: "Government Department Officer" },
  COMPANY_ADMIN: { id: 8, name: "Corporate Admin" },
  NGO_ADMIN: { id: 9, name: "NGO / Implementing Agency Admin" },
} as const;

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

export const SYSTEM_ROLE_TEMPLATE_MAP: Record<number, { code: string; displayName: string; defaultScope: "GLOBAL" | "ORGANIZATION" | "DISTRICT" | "PROJECT" }> = {
  1: { code: "SUPER_ADMIN", displayName: "Super Administrator", defaultScope: "GLOBAL" },
  2: { code: "PLANNING_SECRETARY", displayName: "Planning Secretary", defaultScope: "GLOBAL" },
  3: { code: "JOINT_SECRETARY", displayName: "Joint Secretary", defaultScope: "GLOBAL" },
  4: { code: "DISTRICT_NODAL_OFFICER", displayName: "District Nodal Officer", defaultScope: "DISTRICT" },
  5: { code: "DISTRICT_NODAL_CONSULTANT", displayName: "District Nodal Consultant", defaultScope: "DISTRICT" },
  6: { code: "RELATIONSHIP_MANAGER", displayName: "CSR Relationship Manager", defaultScope: "GLOBAL" },
  7: { code: "GOVERNMENT_OFFICER", displayName: "Government Department Officer", defaultScope: "ORGANIZATION" },
  8: { code: "COMPANY_ADMIN", displayName: "Corporate Admin", defaultScope: "ORGANIZATION" },
  9: { code: "NGO_ADMIN", displayName: "NGO / Implementing Agency Admin", defaultScope: "ORGANIZATION" },
};

export const Role = {
  SUPER_ADMIN: 1,
  PLANNING_SECRETARY: 2,
  JOINT_SECRETARY: 3,
  DISTRICT_NODAL_OFFICER: 4,
  DISTRICT_NODAL_CONSULTANT: 5,
  RELATIONSHIP_MANAGER: 6,
  GOVERNMENT_OFFICER: 7,
  COMPANY_ADMIN: 8,
  NGO_ADMIN: 9,
  CORPORATE_USER: 8,
  NGO_USER: 9,
  FIELD_OFFICER: 5,
  IMPLEMENTING_AGENCY_USER: 9,
  STATE_CSR_CELL: 2,
  ADMIN: 1,
  PORTAL_ADMIN: 1,
  CSR_ADMIN: 1,
  DISTRICT_ADMIN: 4,
  BENEFICIARY_AGENCY: 7,
  NGO_MEMBER: 9,
  COMPANY_MEMBER: 8,
  AUTHORIZED_SIGNATORY: 9,
  CSR_RELATIONSHIP_MANAGER: 6,
  ANALYST_REVIEWER: 3,
  COMPLIANCE_REVIEWER: 3,
  FINANCE_USER: 2,
  APPROVER: 2,
  AUDITOR: 2,
  "super-admin": 1,
  "planning-secretary": 2,
  "joint-secretary": 3,
  "district-nodal-officer": 4,
  "district-nodal-consultant": 5,
  "relationship-manager": 6,
  "government-officer": 7,
  "company-admin": 8,
  "corporate-user": 8,
  "ngo-admin": 9,
  GOV_ENTITY: 7,
  GOVERNMENT_ENTITY: 7,
  GOVERNMENT: 7,
  12: 7,
} as const;

export type Role = number | string;

export function getRoleId(roleInput: number | string | null | undefined): number | null {
  if (roleInput == null) return null;
  if (typeof roleInput === "number") {
    if (roleInput === 12) return 7;
    return roleInput;
  }
  const parsed = parseInt(roleInput, 10);
  if (!isNaN(parsed)) {
    if (parsed === 12) return 7;
    return parsed;
  }
  return (Role as Record<string, number>)[roleInput] ?? null;
}
