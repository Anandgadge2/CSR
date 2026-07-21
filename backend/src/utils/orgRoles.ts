import prisma from "../config/db";
import { resolveSeedRolePermissionKeys } from "../config/platformAccess";
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
      // Use the SAME resolver the seed uses so the org role gets ACTION + bulk +
      // PAGE-visibility grants (page:<slug>:view). Granting only the action set
      // (the old SEED_ROLE_PERMISSIONS) left the role without page permissions,
      // so PageGuard blocked the onboarding pages for fresh org users.
      const rolePermissions = resolveSeedRolePermissionKeys(roleName);

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

    // 4. Assign this system role to the organization's users who do not yet
    //    carry a dynamic role. At registration the User row is created BEFORE
    //    this role exists (see authController.register), so the registrant's
    //    `roleId` is null. Matching on `roleId: orgRole.id` here would find
    //    nobody — leaving the fresh corporate/government user with NO dynamic
    //    role and therefore NO permissions, which blocks the onboarding pages
    //    behind PageGuard ("Access restricted"). Match the roleless org users
    //    (plus any already pointed at this role) and wire them up.
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        OR: [{ roleId: null }, { roleId: orgRole.id }]
      }
    });

    // 5. Point each user's primary dynamic role at this system role AND create
    //    the UserOrganizationRole mapping (both axes) if missing.
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
