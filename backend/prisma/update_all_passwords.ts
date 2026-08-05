import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating all passwords in database to '111111'...");
  const passwordHash = await bcrypt.hash("111111", 10);
  
  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  });

  console.log(`Found ${users.length} users to update.`);

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
    console.log(`✓ Updated password for: ${user.email}`);
  }

  console.log("All passwords updated successfully!");
}

main()
  .catch((e) => {
    console.error("Error updating passwords:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
