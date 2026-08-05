import { OrganizationKind } from "@prisma/client";

const PUBLIC_ACCOUNT_TYPES: Record<string, { roleId: number; kind: OrganizationKind }> = {
  CSR_COMPANY: { roleId: 8, kind: OrganizationKind.CSR_COMPANY },
  COMPANY_ADMIN: { roleId: 8, kind: OrganizationKind.CSR_COMPANY },
  CORPORATE: { roleId: 8, kind: OrganizationKind.CSR_COMPANY },
  GOVERNMENT_DEPARTMENT: { roleId: 7, kind: OrganizationKind.GOVERNMENT_DEPARTMENT },
  GOVERNMENT_OFFICER: { roleId: 7, kind: OrganizationKind.GOVERNMENT_DEPARTMENT },
  GOVERNMENT: { roleId: 7, kind: OrganizationKind.GOVERNMENT_DEPARTMENT }
};

export function resolvePublicRegistrationAccountType(value: unknown) {
  const normalized = String(value || "").trim().toUpperCase();
  return PUBLIC_ACCOUNT_TYPES[normalized] || null;
}
