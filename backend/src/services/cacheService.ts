import { getCache, setCache, delCache, clearCachePattern } from "../config/redis";

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

export class CacheService {
  /**
   * Get cached permissions / user payload from Redis
   */
  static async getPermissions(userId: string): Promise<any | null> {
    const key = `permissions:${userId}`;
    return await getCache<any>(key);
  }

  /**
   * Set cached permissions / user payload in Redis
   */
  static async setPermissions(
    userId: string,
    permissions: any,
    ttlSeconds = DEFAULT_TTL_SECONDS
  ): Promise<void> {
    const key = `permissions:${userId}`;
    await setCache(key, permissions, ttlSeconds);
  }

  /**
   * Invalidate cached permissions for a user in Redis
   */
  static async invalidatePermissions(userId: string): Promise<void> {
    const key = `permissions:${userId}`;
    await delCache(key);
    console.log(`[CacheService] Invalidated permissions Redis cache for user: ${userId}`);
  }

  /**
   * Invalidate all permissions cache in Redis (during global role/permission updates)
   */
  static async invalidateAll(): Promise<void> {
    await clearCachePattern("permissions:*");
    console.log("[CacheService] Invalidated all permissions Redis cache");
  }
}
