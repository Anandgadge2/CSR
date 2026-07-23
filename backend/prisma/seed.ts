import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "111111";

async function main() {
  console.log("Starting database seed...");
  const defaultPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 1. Seed System Roles (IDs 1 - 9)
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
    await prisma.role.upsert({
      where: { id: role.id },
      create: role,
      update: { name: role.name, description: role.description }
    });
  }
  console.log("✓ System roles seeded (1 to 9).");

  // 2. Create Default System Organization
  console.log("Seeding system organization...");
  const mainOrg = await prisma.organization.upsert({
    where: { registrationNumber: "MAHACSR-ORG-001" },
    create: {
      registrationNumber: "MAHACSR-ORG-001",
      name: "Maharashtra CSR Authority",
      kind: "PORTAL_ADMIN_ORG",
      state: "Maharashtra",
      district: "Mumbai",
      status: "ACTIVE"
    },
    update: {}
  });

  const companyOrg = await prisma.organization.upsert({
    where: { registrationNumber: "MAHACSR-COMP-001" },
    create: {
      registrationNumber: "MAHACSR-COMP-001",
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
    await prisma.user.upsert({
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
        roleId: user.roleId,
        organizationId: user.orgId,
        accountStatus: "ACTIVE",
        isVerified: true
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
