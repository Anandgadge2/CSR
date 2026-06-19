import { PrismaClient } from "@prisma/client";

// Initialized Prisma Client with environment-based logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prisma;
