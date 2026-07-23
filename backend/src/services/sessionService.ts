import prisma from "../config/db";
import { getRedisClient } from "../utils/redis";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface SessionInfo {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export async function createSession(info: SessionInfo): Promise<string> {
  const redis = await getRedisClient();
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

  if (redis) {
    try {
      await redis.set(`session:${session.id}`, "ACTIVE", { EX: SESSION_TTL_SECONDS });
    } catch (err) {
      console.warn("Failed to save session to Redis cache:", err);
    }
  }
  return session.id;
}

export async function validateSession(sessionId: string): Promise<boolean> {
  const redis = await getRedisClient();
  let cachedStatus = null;

  if (redis) {
    try {
      cachedStatus = await redis.get(`session:${sessionId}`);
    } catch (err) {
      console.warn("Failed to get session from Redis cache:", err);
    }
  }

  if (cachedStatus === "ACTIVE") {
    updateLastActivity(sessionId).catch(() => {});
    return true;
  }

  if (cachedStatus === "REVOKED") {
    return false;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (session && !session.isRevoked && (session.expiresAt > new Date() || (session.expiry && session.expiry > new Date()))) {
    if (redis) {
      try {
        const remainingTime = Math.max(0, Math.floor(((session.expiry || session.expiresAt).getTime() - Date.now()) / 1000));
        await redis.set(`session:${sessionId}`, "ACTIVE", { EX: remainingTime });
      } catch (err) {
        console.warn("Failed to populate session Redis cache:", err);
      }
    }
    return true;
  }

  return false;
}

export async function revokeSession(sessionId: string, revokedByUserId?: string, reason?: string): Promise<void> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      await redis.set(`session:${sessionId}`, "REVOKED", { EX: 60 * 60 });
    } catch (err) {
      console.warn("Failed to write revoked session to Redis cache:", err);
    }
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isRevoked: true,
      revokedByUserId: revokedByUserId || null,
    }
  });
}

export async function revokeAllUserSessions(userId: string, revokedByUserId?: string, reason?: string): Promise<void> {
  const redis = await getRedisClient();
  
  const activeSessions = await prisma.session.findMany({
    where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
    select: { id: true }
  });

  if (redis) {
    try {
      for (const session of activeSessions) {
        await redis.set(`session:${session.id}`, "REVOKED", { EX: 60 * 60 });
      }
    } catch (err) {
      console.warn("Failed to write revoked user sessions to Redis cache:", err);
    }
  }

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
