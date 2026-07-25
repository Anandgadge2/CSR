import crypto from "crypto";
import { getVerificationEncryptionKey } from "../config/env";

const VERSION = "v1";
const IV_LENGTH = 12;

/**
 * Gets master encryption key (32 bytes / 64 hex chars).
 */
const getMasterKey = (): Buffer => {
  const hexKey = process.env.FIELD_ENCRYPTION_KEY || getVerificationEncryptionKey();
  if (!hexKey) {
    throw new Error("FIELD_ENCRYPTION_KEY or VERIFICATION_ENCRYPTION_KEY is not configured");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(hexKey)) {
    throw new Error("Encryption key must be exactly 64 hex characters (32 bytes)");
  }
  return Buffer.from(hexKey, "hex");
};

/**
 * Salted secret for HMAC-SHA256 Blind Hash.
 */
const getBlindHashSecret = (): string => {
  return process.env.BLIND_HASH_SECRET || "mahacsr_blind_hash_salt_secret_2026";
};

/**
 * AES-256-GCM Encrypt a plaintext field value.
 * Format: v1:<iv_b64>:<authTag_b64>:<ciphertext_b64>
 */
export const encryptField = (plaintext: string | null | undefined): string | null => {
  if (!plaintext) return null;
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
};

/**
 * AES-256-GCM Decrypt an encrypted field value.
 */
export const decryptField = (encrypted: string | null | undefined): string | null => {
  if (!encrypted) return null;
  if (!encrypted.startsWith(`${VERSION}:`)) return encrypted;

  const parts = encrypted.split(":");
  if (parts.length !== 4) return encrypted;

  try {
    const [, ivB64, tagB64, ctB64] = parts;
    const key = getMasterKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]).toString("utf8");
  } catch (error) {
    console.error("Failed to decrypt field:", error);
    return null;
  }
};

/**
 * HMAC-SHA256 Blind Hash for exact-match database indexing and unique constraint enforcement.
 * Automatically normalizes value (.trim().toUpperCase()) before hashing.
 */
export const computeBlindHash = (val: string | null | undefined): string | null => {
  if (!val) return null;
  const normalized = val.trim().toUpperCase();
  return crypto.createHmac("sha256", getBlindHashSecret()).update(normalized).digest("hex");
};
