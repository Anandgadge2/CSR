import prisma from "../config/db";
import { ROLE_ID } from "../types/role";
import { OrganizationKind } from "@prisma/client";

/**
 * Ensures that the system role for an organization exists, and that the organization's registering user
 * is mapped to this role in the UserOrganizationRole table.
 */
export async function ensureOrganizationAdminRole(organizationId: string) {
  try {
    // 1. Get the organization to determine its kind
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    if (!organization) {
      console.warn(`[ensureOrganizationAdminRole] Organization not found: ${organizationId}`);
      return;
    }

    // 2. Map organization kind to role ID + role name
    let roleId: number;
    let roleName: string;

    if (organization.kind === OrganizationKind.NGO) {
      roleId = ROLE_ID.NGO_ADMIN;
      roleName = "NGO_ADMIN";
    } else if (organization.kind === OrganizationKind.CSR_COMPANY) {
      roleId = ROLE_ID.COMPANY_ADMIN;
      roleName = "COMPANY_ADMIN";
    } else if (organization.kind === OrganizationKind.GOVERNMENT_DEPARTMENT) {
      roleId = ROLE_ID.GOVERNMENT_OFFICER;
      roleName = "GOVERNMENT_OFFICER";
    } else {
      console.log(`[ensureOrganizationAdminRole] Organization kind ${organization.kind} does not require default roles`);
      return;
    }

    console.log(`[ensureOrganizationAdminRole] Syncing system role ${roleName} (${roleId}) for organization ${organizationId}`);

    // 3. Find or create the system role for this organization
    let orgRole = await prisma.role.findFirst({
      where: {
        id: roleId
      }
    });

    if (!orgRole) {
      orgRole = await prisma.role.create({
        data: {
          id: roleId,
          name: roleName,
          description: `${roleName.replace(/_/g, " ")} system role`,
          isSystemRole: true,
          isProtected: true,
          organizationId
        }
      });
      console.log(`[ensureOrganizationAdminRole] Created system role: ${orgRole.id} (${orgRole.name})`);
    }

    // 4. Assign this system role to the organization's users
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        OR: [{ roleId: null }, { roleId: orgRole.id }]
      }
    });

    for (const user of users) {
      if (user.roleId !== orgRole.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: orgRole.id }
        });
      }

      const existingAssignment = await prisma.userOrganizationRole.findFirst({
        where: {
          userId: user.id,
          roleId: orgRole.id,
          organizationId
        }
      });

      if (!existingAssignment) {
        await prisma.userOrganizationRole.create({
          data: {
            userId: user.id,
            roleId: orgRole.id,
            organizationId
          }
        });
        console.log(`[ensureOrganizationAdminRole] Assigned user ${user.email} (${user.id}) to role ${orgRole.name}`);
      }
    }
  } catch (error) {
    console.error(`[ensureOrganizationAdminRole] Error syncing organization admin roles:`, error);
  }
}
