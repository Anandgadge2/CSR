import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("----------------------------------------");
  console.log("Clearing all data from PostgreSQL database...");
  console.log("----------------------------------------");

  try {
    // Delete transactional and child records first
    await prisma.rolePermission.deleteMany({});
    await prisma.userOrganizationRole.deleteMany({});
    await prisma.userOfficerProfile.deleteMany({});
    await prisma.otpVerification.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.bankAccount.deleteMany({});
    await prisma.cSRCompanyProfile.deleteMany({});
    await prisma.nGOProfile.deleteMany({});
    await prisma.govDepartmentProfile.deleteMany({});
    await prisma.projectAssignment.deleteMany({});
    await prisma.projectInspection.deleteMany({});
    await prisma.grievanceActionLog.deleteMany({});
    await prisma.grievance.deleteMany({});
    await prisma.helpdeskQuery.deleteMany({});
    await prisma.verificationRecord.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.sLAEscalation.deleteMany({});
    await prisma.project.deleteMany({});
    
    // Delete core entities
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.roleHierarchy.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.role.deleteMany({});

    console.log("✓ Database cleared successfully (all tables wiped clean).");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

clearDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
