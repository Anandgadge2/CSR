import prisma from "../config/db";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface SessionInfo {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export async function createSession(info: SessionInfo): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      userId: info.userId,
      ipAddress: info.ipAddress || null,
      lastActivityIp: info.ipAddress || null,
      userAgent: info.userAgent || null,
      expiry: expiresAt,
      expiresAt,
    }
  });

  return session.id;
}

export async function validateSession(sessionId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (session && !session.isRevoked && (session.expiresAt > new Date() || (session.expiry && session.expiry > new Date()))) {
    updateLastActivity(sessionId).catch(() => {});
    return true;
  }

  return false;
}

export async function revokeSession(sessionId: string, revokedByUserId?: string, reason?: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedByUserId: revokedByUserId || null,
    }
  });
}

export async function revokeAllUserSessions(userId: string, revokedByUserId?: string, reason?: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, isRevoked: false },
    data: {
      isRevoked: true,
      revokedByUserId: revokedByUserId || null,
    }
  });
}

export async function getSingleSessionPolicy(tenantId: string): Promise<"REPLACE" | "REJECT"> {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: `single_session_policy:${tenantId}` }
  });
  return (setting?.value as "REPLACE" | "REJECT") || "REPLACE";
}

async function updateLastActivity(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { lastActivity: new Date() }
  });
}
