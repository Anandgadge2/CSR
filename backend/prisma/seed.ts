import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeBlindHash, encryptField } from "../src/utils/fieldCrypto";
import { PERMISSIONS, PAGE_PERMISSIONS, resolveSeedRolePermissionKeys } from "../src/config/platformAccess";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "MahaCSR@SecureSeed2026!";

async function main() {
  console.log("Starting database seed...");
  if (process.env.NODE_ENV === "production" && !process.env.SEED_DEFAULT_PASSWORD) {
    throw new Error("SEED_DEFAULT_PASSWORD environment variable must be set in production.");
  }
  const defaultPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // 1. Seed System Roles & Permissions Matrix
  console.log("Seeding permissions matrix...");
  const allDefs = [
    ...PERMISSIONS.map(([key, description, module]) => ({ key, description, module })),
    ...PAGE_PERMISSIONS.map(([key, description, module]) => ({ key, description, module }))
  ];

  await prisma.permission.createMany({
    data: allDefs,
    skipDuplicates: true,
  });

  console.log("Seeding system roles 1 to 9...");
  const roles = [
    { id: 1, name: "SUPER_ADMIN", description: "Super Administrator", isSystemRole: true, isProtected: true },
    { id: 2, name: "PLANNING_SECRETARY", description: "Planning Secretary", isSystemRole: true, isProtected: true },
    { id: 3, name: "JOINT_SECRETARY", description: "Joint Secretary", isSystemRole: true, isProtected: true },
    { id: 4, name: "DISTRICT_NODAL_OFFICER", description: "District Nodal Officer", isSystemRole: true, isProtected: true },
    { id: 5, name: "DISTRICT_NODAL_CONSULTANT", description: "District Nodal Consultant", isSystemRole: true, isProtected: true },
    { id: 6, name: "RELATIONSHIP_MANAGER", description: "Relationship Manager", isSystemRole: true, isProtected: true },
    { id: 7, name: "GOVERNMENT_OFFICER", description: "Government Officer / Department", isSystemRole: true, isProtected: true },
    { id: 8, name: "COMPANY_ADMIN", description: "CSR Company Administrator", isSystemRole: true, isProtected: true },
    { id: 9, name: "NGO_ADMIN", description: "NGO Administrator", isSystemRole: true, isProtected: true },
  ];

  for (const role of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { id: role.id },
      create: role,
      update: { name: role.name, description: role.description }
    });

    const rolePermKeys = resolveSeedRolePermissionKeys(role.name);
    if (rolePermKeys.length > 0) {
      const permsInDb = await prisma.permission.findMany({
        where: { key: { in: rolePermKeys as string[] } },
        select: { id: true }
      });

      if (permsInDb.length > 0) {
        await prisma.rolePermission.createMany({
          data: permsInDb.map((p) => ({
            roleId: roleRecord.id,
            permissionId: p.id,
          })),
          skipDuplicates: true,
        });
      }
    }
  }
  console.log("✓ System roles & permissions seeded (1 to 9).");

  // 2. Create Default System Organization
  console.log("Seeding system organization...");
  const mainOrgRegNo = "MAHACSR-ORG-001";
  const mainOrgRegHash = computeBlindHash(mainOrgRegNo)!;

  const mainOrg = await prisma.organization.upsert({
    where: { registrationNumberHash: mainOrgRegHash },
    create: {
      registrationNumber: encryptField(mainOrgRegNo),
      registrationNumberHash: mainOrgRegHash,
      name: "Maharashtra CSR Authority",
      kind: "PORTAL_ADMIN_ORG",
      state: "Maharashtra",
      district: "Mumbai",
      status: "ACTIVE"
    },
    update: {}
  });

  const companyOrgRegNo = "MAHACSR-COMP-001";
  const companyOrgRegHash = computeBlindHash(companyOrgRegNo)!;

  const companyOrg = await prisma.organization.upsert({
    where: { registrationNumberHash: companyOrgRegHash },
    create: {
      registrationNumber: encryptField(companyOrgRegNo),
      registrationNumberHash: companyOrgRegHash,
      name: "TATA CSR Foundation",
      kind: "CSR_COMPANY",
      state: "Maharashtra",
      district: "Mumbai",
      status: "ACTIVE"
    },
    update: {}
  });

  // 3. Seed Demo Users
  console.log("Seeding demo accounts...");
  const demoUsers = [
    { email: "admin@mahacsr.gov.in", firstName: "Super", lastName: "Admin", roleId: 1, orgId: mainOrg.id },
    { email: "js@mahacsr.gov.in", firstName: "Joint", lastName: "Secretary", roleId: 3, orgId: mainOrg.id },
    { email: "nodal@mahacsr.gov.in", firstName: "Nodal", lastName: "Officer", roleId: 4, orgId: mainOrg.id },
    { email: "rm@mahacsr.gov.in", firstName: "Relationship", lastName: "Manager", roleId: 6, orgId: mainOrg.id },
    { email: "company.admin@mahacsr.gov.in", firstName: "Company", lastName: "Admin", roleId: 8, orgId: companyOrg.id },
    { email: "ngo.admin@mahacsr.gov.in", firstName: "NGO", lastName: "Admin", roleId: 9, orgId: mainOrg.id }
  ];

  for (const user of demoUsers) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        passwordHash: defaultPasswordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        organizationId: user.orgId,
        isVerified: true,
        accountStatus: "ACTIVE"
      },
      update: {
        passwordHash: defaultPasswordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        organizationId: user.orgId,
        accountStatus: "ACTIVE",
        isVerified: true
      }
    });

    await prisma.userOfficerProfile.upsert({
      where: { userId: createdUser.id },
      create: {
        userId: createdUser.id,
        fullName: `${user.firstName} ${user.lastName}`,
        designation: "Platform Administrator",
        department: "Maharashtra State CSR Cell",
      },
      update: {
        fullName: `${user.firstName} ${user.lastName}`,
      }
    });
    console.log(`✓ User created/updated: ${user.email} (Role ID: ${user.roleId})`);
  }

  // 4. Seed Default Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: "hero_slides" },
    create: {
      key: "hero_slides",
      value: JSON.parse(JSON.stringify([{ title: "MahaCSR Convergence Platform", active: true }]))
    },
    update: {}
  });

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
