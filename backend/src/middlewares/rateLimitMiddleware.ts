import { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const rateLimit = (options: { windowMs: number; max: number; keyPrefix?: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${options.keyPrefix || "default"}:${req.ip}:${req.originalUrl}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (bucket.count >= options.max) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    bucket.count += 1;
    return next();
  };
};
