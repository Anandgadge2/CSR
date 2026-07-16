import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting role migration...");
  try {
    const count = await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET role = NULL
      WHERE role::text NOT IN ('SUPER_ADMIN', 'CORPORATE_USER', 'GOVERNMENT_OFFICER')
    `);
    console.log(`Updated ${count} users to have role = NULL`);
  } catch (error) {
    console.error("Error executing role migration SQL:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
