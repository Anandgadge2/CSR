import prisma from "../config/db";
import { SEED_ROLE_PERMISSIONS } from "../config/platformAccess";
import { ROLE_SLUG } from "../types/role";
import { RoleScope, OrganizationKind } from "@prisma/client";

/**
 * Ensures that the system role for an organization exists, and that the organization's registering user
 * is mapped to this role in the UserOrganizationRole table.
 */
export async function ensureOrganizationAdminRole(organizationId: string) {
  try {
    // 1. Get the organization to determine its type
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    if (!organization) {
      console.warn(`[ensureOrganizationAdminRole] Organization not found: ${organizationId}`);
      return;
    }

    // 2. Map organization kind to role name (seed key) + stable role slug.
    let roleName = "";
    let roleSlug = "";
    if (organization.organizationType === OrganizationKind.NGO) {
      roleName = "NGO_ADMIN";
      roleSlug = ROLE_SLUG.NGO_ADMIN;
    } else if (organization.organizationType === OrganizationKind.CSR_COMPANY) {
      roleName = "COMPANY_ADMIN";
      roleSlug = ROLE_SLUG.COMPANY_ADMIN;
    } else if (organization.organizationType === OrganizationKind.GOVERNMENT_DEPARTMENT) {
      // Government departments (demand side) use the government-officer role.
      // The former BENEFICIARY_AGENCY role was folded into it.
      roleName = "GOVERNMENT_OFFICER";
      roleSlug = ROLE_SLUG.GOVERNMENT_OFFICER;
    } else {
      console.log(`[ensureOrganizationAdminRole] Organization type ${organization.organizationType} does not require default roles`);
      return;
    }

    console.log(`[ensureOrganizationAdminRole] Syncing system role ${roleName} for organization ${organizationId}`);

    // 3. Find or create the system role for this organization
    let orgRole = await prisma.organizationRole.findFirst({
      where: {
        organizationId,
        name: roleName
      }
    });

    if (!orgRole) {
      const permissions = await prisma.permission.findMany();
      const permissionIdByKey = new Map(permissions.map(p => [p.key, p.id]));
      const rolePermissions = SEED_ROLE_PERMISSIONS[roleName] || [];

      orgRole = await prisma.organizationRole.create({
        data: {
          organizationId,
          name: roleName,
          slug: roleSlug,
          description: `${roleName.replace(/_/g, " ")} system role`,
          scope: RoleScope.ORGANIZATION,
          isSystemRole: true,
          rolePermissions: {
            create: rolePermissions
              .map((key: string) => ({ permissionId: permissionIdByKey.get(key)! }))
              .filter((item: { permissionId: string | undefined }) => !!item.permissionId)
          }
        }
      });
      console.log(`[ensureOrganizationAdminRole] Created system role: ${orgRole.id} (${orgRole.name})`);
    }

    // 4. Find all users in this organization mapped to this dynamic role
    //    (via User.roleId). The legacy `User.role` enum no longer carries
    //    org-specific identities, so we match on the dynamic role relation.
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        roleId: orgRole.id
      }
    });

    // 5. Create UserOrganizationRole assignments for these users if they don't already exist
    for (const user of users) {
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
