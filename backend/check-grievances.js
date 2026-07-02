const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const grievances = await prisma.grievance.findMany({
    include: {
      convergenceProject: {
        select: { id: true, title: true, district: true }
      },
      raisedByUser: { select: { email: true } },
      assignedNodalOfficer: { select: { email: true } }
    }
  });
  console.log("=== Grievances in DB ===");
  console.log(JSON.stringify(grievances, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
