import crypto from "crypto";

/**
 * Security primitives shared across auth flows.
 *
 * Design notes:
 * - OTPs and refresh tokens are NEVER stored in plaintext. We persist a SHA-256
 *   hash and compare hashes in constant time. SHA-256 (not bcrypt) is used here
 *   because these secrets are already high-entropy and short-lived, so the goal
 *   is only to prevent a DB leak from exposing usable credentials, not to resist
 *   offline brute force of a low-entropy human password.
 * - Random values use crypto.randomInt / crypto.randomBytes (CSPRNG), never
 *   Math.random(), which is predictable and unsafe for security tokens.
 */

/** Generate a cryptographically secure numeric OTP of the given length. */
export const generateNumericOtp = (length = 6): string => {
  const max = 10 ** length;
  // randomInt is uniform over [0, max); pad to preserve leading zeros.
  return crypto.randomInt(0, max).toString().padStart(length, "0");
};

/** Generate a high-entropy opaque token (URL-safe). */
export const generateOpaqueToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString("base64url");

/** Deterministic SHA-256 hash used for at-rest storage + lookup of tokens/OTPs. */
export const hashToken = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");

/**
 * Constant-time string comparison. Prevents timing side-channels when comparing
 * secrets (OTPs, tokens). Returns false on length mismatch without leaking which.
 */
export const constantTimeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // timingSafeEqual throws on length mismatch; do a dummy compare to keep timing flat.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};
