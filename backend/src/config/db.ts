import { PrismaClient } from "@prisma/client";

// Initialized Prisma Client with minimal logging
// Only errors are logged to keep terminal output clean and concise
const prisma = new PrismaClient({
  log: ["error"],
});

export default prisma;
