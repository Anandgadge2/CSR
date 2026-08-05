import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("Testing connection to DATABASE_URL:", process.env.DATABASE_URL);
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log("SUCCESSFULLY CONNECTED TO DB!");
    const userCount = await prisma.user.count();
    console.log("USER COUNT:", userCount);
    process.exit(0);
  } catch (err: any) {
    console.error("CONNECTION FAILED:", err.message);
    process.exit(1);
  }
}

test();
