/**
 * env hardening unit tests.
 *
 * Verifies that production startup refuses insecure secret configuration and
 * that secret getters throw defensively in production. We re-require the module
 * per case because `isProduction` is evaluated at import time.
 */

const DEV_JWT_SECRET = "dev_only_mahacsr_access_secret";
const DEV_JWT_REFRESH_SECRET = "dev_only_mahacsr_refresh_secret";
const DEV_ENC_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const GOOD_ENC_KEY = "a".repeat(64);

const ORIGINAL_ENV = process.env;

function loadEnv() {
  let mod: typeof import("../env");
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require("../env");
  });
  // @ts-expect-error assigned inside isolateModules
  return mod;
}

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("assertProductionEnv", () => {
  it("does not throw outside production even with missing secrets", () => {
    process.env.NODE_ENV = "development";
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    const env = loadEnv();
    expect(() => env.assertProductionEnv()).not.toThrow();
  });

  it("throws in production when JWT secrets are missing", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://u:p@h:5432/db";
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    process.env.VERIFICATION_ENCRYPTION_KEY = GOOD_ENC_KEY;
    const env = loadEnv();
    expect(() => env.assertProductionEnv()).toThrow(/JWT_SECRET/);
  });

  it("throws in production when a secret uses the committed dev default", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://u:p@h:5432/db";
    process.env.JWT_SECRET = DEV_JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = "a_real_refresh_secret_value_1234567890";
    process.env.VERIFICATION_ENCRYPTION_KEY = GOOD_ENC_KEY;
    const env = loadEnv();
    expect(() => env.assertProductionEnv()).toThrow(/dev default/);
  });

  it("throws in production when the encryption key is not 64 hex chars", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://u:p@h:5432/db";
    process.env.JWT_SECRET = "a_real_access_secret_value_1234567890";
    process.env.JWT_REFRESH_SECRET = "a_real_refresh_secret_value_1234567890";
    process.env.VERIFICATION_ENCRYPTION_KEY = "too-short";
    const env = loadEnv();
    expect(() => env.assertProductionEnv()).toThrow(/64 hexadecimal/);
  });

  it("passes in production with all secrets set to strong values", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://u:p@h:5432/db";
    process.env.JWT_SECRET = "a_real_access_secret_value_1234567890";
    process.env.JWT_REFRESH_SECRET = "a_real_refresh_secret_value_1234567890";
    process.env.VERIFICATION_ENCRYPTION_KEY = GOOD_ENC_KEY;
    const env = loadEnv();
    expect(() => env.assertProductionEnv()).not.toThrow();
  });
});

describe("secret getters", () => {
  it("returns dev fallbacks outside production", () => {
    process.env.NODE_ENV = "development";
    delete process.env.JWT_SECRET;
    delete process.env.VERIFICATION_ENCRYPTION_KEY;
    const env = loadEnv();
    expect(env.getJwtSecret()).toBe(DEV_JWT_SECRET);
    expect(env.getJwtRefreshSecret()).toBe(DEV_JWT_REFRESH_SECRET);
    expect(env.getVerificationEncryptionKey()).toBe(DEV_ENC_KEY);
  });

  it("throws in production when getters see missing/default secrets", () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;
    const env = loadEnv();
    expect(() => env.getJwtSecret()).toThrow();
  });

  it("returns configured secrets in production", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "a_real_access_secret_value_1234567890";
    const env = loadEnv();
    expect(env.getJwtSecret()).toBe("a_real_access_secret_value_1234567890");
  });
});
