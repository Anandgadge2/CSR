import { Request, Response, NextFunction } from "express";
import { getCache, setCache } from "../config/redis";

interface CacheOptions {
  ttlSeconds?: number; // Cache duration in seconds (default 300 = 5 minutes)
  keyPrefix?: string;
  userScoped?: boolean; // If true, caches per user ID (for user-specific views)
}

/**
 * Express middleware to transparently cache GET API endpoint responses in Redis.
 */
export const httpCache = (options: CacheOptions = {}) => {
  const ttlSeconds = options.ttlSeconds ?? 300;
  const prefix = options.keyPrefix ? `${options.keyPrefix}:` : "api_cache:";

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const userId = (req as any).user?.id || "public";
    const userScope = options.userScoped ? `u:${userId}:` : "";
    const cacheKey = `${prefix}${userScope}${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await getCache<any>(cacheKey);
      if (cachedResponse !== null) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Response-Time", "Redis Fast Cache");
        return res.json(cachedResponse);
      }
    } catch (err) {
      console.warn("[httpCache Middleware Error]", err);
    }

    // Intercept res.json to cache response before sending
    const originalJson = res.json.bind(res);
    res.json = ((body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && body !== null && body !== undefined) {
        setCache(cacheKey, body, ttlSeconds).catch((err) => {
          console.warn(`[httpCache SET Error] Key: ${cacheKey}`, err);
        });
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    }) as any;

    next();
  };
};
