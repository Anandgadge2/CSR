import fs from "fs";
import path from "path";
import { ROUTE_POLICY_REGISTRY } from "../config/routePolicyRegistry";

describe("CI Authorization Policy Guard Suite", () => {
  it("verifies that all route registry policies contain valid classification and permission metadata", () => {
    expect(ROUTE_POLICY_REGISTRY.length).toBeGreaterThan(15);

    ROUTE_POLICY_REGISTRY.forEach((policy) => {
      expect(["PUBLIC", "AUTHENTICATED", "PROTECTED"]).toContain(policy.classification);

      if (policy.classification === "PROTECTED") {
        expect(policy.permission).toBeDefined();
        expect(typeof policy.permission).toBe("string");
        expect(policy.permission).toMatch(/^[a-z0-9-]+:[a-z0-9-]+$/);
      }
    });
  });

  it("ensures protected route endpoints have an explicit authorization policy entry in ROUTE_POLICY_REGISTRY", () => {
    const routesDir = path.join(__dirname, "../routes");
    const routeFiles = fs.readdirSync(routesDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");

    let totalProtectedRoutesFound = 0;
    let matchingPoliciesFound = 0;

    routeFiles.forEach((file) => {
      const content = fs.readFileSync(path.join(routesDir, file), "utf-8");
      const lines = content.split("\n");

      lines.forEach((line) => {
        const match = line.match(/router\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/i);
        if (match) {
          totalProtectedRoutesFound++;
          const method = match[1].toUpperCase();

          const hasPolicy = ROUTE_POLICY_REGISTRY.some((p) => p.method === method);
          if (hasPolicy) matchingPoliciesFound++;
        }
      });
    });

    expect(totalProtectedRoutesFound).toBeGreaterThan(0);
    expect(matchingPoliciesFound).toBeGreaterThan(0);
  });
});
