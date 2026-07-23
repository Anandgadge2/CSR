import prisma from "../config/db";
import { ROLE_ID } from "../types/role";

export const SYSTEM_USER_EMAIL = "system@mahacsr.gov.in";

let cachedSystemUserId: string | null = null;

/**
 * Resolve (and cache) the seeded system user used for automated workflow actions.
 */
export async function getSystemUserId(): Promise<string> {
  if (cachedSystemUserId) return cachedSystemUserId;

  const existing = await prisma.user.findUnique({ where: { email: SYSTEM_USER_EMAIL } });
  if (existing) {
    cachedSystemUserId = existing.id;
    return existing.id;
  }

  const crypto = await import("crypto");
  const created = await prisma.user.create({
    data: {
      email: SYSTEM_USER_EMAIL,
      passwordHash: crypto.randomBytes(48).toString("hex"),
      roleId: ROLE_ID.SUPER_ADMIN,
      accountStatus: "INACTIVE",
      isVerified: false
    }
  });
  cachedSystemUserId = created.id;
  return created.id;
}

export async function isSystemUser(userId: string): Promise<boolean> {
  return (await getSystemUserId()) === userId;
}
