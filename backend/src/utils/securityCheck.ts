/**
 * Startup security checks preventing weak/demo credentials in production.
 */
export function runStartupSecurityCheck(): void {
  if (process.env.NODE_ENV === "production") {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    const weakSecrets = ["secret", "jwt_secret", "123456", "dev_secret", "change_me", "supersecret"];

    if (!jwtSecret || weakSecrets.includes(jwtSecret.toLowerCase())) {
      console.error("[CRITICAL SECURITY ERROR] Insecure JWT_SECRET configured in production environment!");
      process.exit(1);
    }

    if (!jwtRefreshSecret || weakSecrets.includes(jwtRefreshSecret.toLowerCase())) {
      console.error("[CRITICAL SECURITY ERROR] Insecure JWT_REFRESH_SECRET configured in production environment!");
      process.exit(1);
    }

    console.log("[SECURITY CHECK] Production environment security validations passed.");
  }
}
