import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma Client with event-based error logging to prevent noisy terminal outputs on Neon idle connection drops
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "stdout", level: "warn" },
    ],
    errorFormat: "minimal",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Suppress transient Neon serverless idle connection drop logs (E57P01)
(prisma as any).$on("error", (e: any) => {
  const msg = e?.message || "";
  if (
    msg.includes("E57P01") ||
    msg.includes("terminating connection due to administrator command") ||
    msg.includes("Closed connection")
  ) {
    // Transient Neon idle socket drop — automatically retried by query middleware
    return;
  }
  console.error("[Prisma Engine Error]", e.message);
});

/**
 * Resilient DB Query Middleware.
 * Automatically catches Neon Serverless connection drop errors (E57P01, P1001, P1017, P2024),
 * reconnects Prisma Client, and retries the query up to 3 times before failing.
 */
prisma.$use(async (params, next) => {
  let retries = 0;
  const maxRetries = 3;

  while (true) {
    try {
      return await next(params);
    } catch (error: any) {
      const msg = error?.message || "";
      const code = error?.code || "";

      const isConnError =
        msg.includes("E57P01") ||
        msg.includes("terminating connection due to administrator command") ||
        msg.includes("Closed connection") ||
        msg.includes("Connection lost") ||
        code === "P1001" ||
        code === "P1017" ||
        code === "P2024";

      if (isConnError && retries < maxRetries) {
        retries++;
        try {
          await prisma.$connect();
        } catch {
          // Suppress error during reconnect attempt
        }
        await new Promise((resolve) => setTimeout(resolve, 250 * retries));
        continue;
      }
      throw error;
    }
  }
});

export default prisma;
