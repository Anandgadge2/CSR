// Local in-memory cache for permissions
interface CacheEntry {
  permissions: string[];
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_SECONDS = 300; // 5 minutes

export class CacheService {
  /**
   * Get cached permissions for a user
   */
  static async getPermissions(userId: string): Promise<string[] | null> {
    const entry = memoryCache.get(userId);
    if (entry) {
      if (Date.now() < entry.expiresAt) {
        return entry.permissions;
      }
      // Evict expired entry
      memoryCache.delete(userId);
    }

    return null;
  }

  /**
   * Set cached permissions for a user
   */
  static async setPermissions(
    userId: string,
    permissions: string[],
    ttlSeconds = DEFAULT_TTL_SECONDS
  ): Promise<void> {
    memoryCache.set(userId, {
      permissions,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  /**
   * Invalidate cached permissions for a user
   */
  static async invalidatePermissions(userId: string): Promise<void> {
    memoryCache.delete(userId);
    console.log(`[CacheService] Invalidated permissions cache for user: ${userId}`);
  }

  /**
   * Invalidate all users' permission cache (useful during global role updates)
   */
  static async invalidateAll(): Promise<void> {
    memoryCache.clear();
    console.log("[CacheService] Invalidated all permissions cache");
  }
}
