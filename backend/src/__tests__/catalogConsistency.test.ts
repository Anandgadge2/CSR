import { SYSTEM_ROLE_TEMPLATE_MAP, SYSTEM_ROLES } from "../types/role";
import { ROUTE_POLICY_REGISTRY } from "../config/routePolicyRegistry";
import { NAVIGATION_MANIFEST } from "../../../frontend/src/lib/navigationManifest";

// Authoritative Permission Catalog keys list
const AUTHORITATIVE_PERMISSIONS = [
  "dashboard:view",
  "profile:view",
  "profile:update",
  "organization:approve",
  "organization:reject",
  "organization:view",
  "organization:update",
  "role:view",
  "role:create",
  "role:update",
  "role:configure",
  "role:delete",
  "user:view",
  "user:create",
  "user:update",
  "user:suspend",
  "user:activate",
  "user:assign-role",
  "pitch:create",
  "pitch:view",
  "pitch:verify",
  "pitch:approve",
  "pitch:reject",
  "pitch:assign",
  "pitch:convert",
  "assessment:create",
  "assessment:view",
  "assessment:recommend",
  "assessment:decision",
  "enquiry:create",
  "enquiry:view",
  "enquiry:respond",
  "enquiry:assign",
  "enquiry:convert",
  "project:create",
  "project:view",
  "project:update",
  "project:approve",
  "project:assign",
  "project:execute",
  "project:verify",
  "project:complete",
  "milestone:submit",
  "milestone:verify",
  "milestone:approve",
  "financial:allocate",
  "financial:disburse",
  "financial:verify_uc",
  "audit:view",
  "audit:export",
  "system:configure",
];

describe("Permission Catalog & CI Consistency Enforcement Suite", () => {
  const permSet = new Set(AUTHORITATIVE_PERMISSIONS);

  // 1. Check for duplicate permission keys in catalog
  test("1. Authoritative permission catalog has zero duplicate keys", () => {
    const duplicates = AUTHORITATIVE_PERMISSIONS.filter(
      (item, index) => AUTHORITATIVE_PERMISSIONS.indexOf(item) !== index
    );
    expect(duplicates).toEqual([]);
  });

  // 2. Check system role codes for duplicates
  test("2. Protected system role codes have zero duplicates", () => {
    const codes = Object.values(SYSTEM_ROLE_TEMPLATE_MAP).map((t) => t.code);
    const duplicates = codes.filter((c, i) => codes.indexOf(c) !== i);
    expect(duplicates).toEqual([]);
  });

  // 3. Route policy registry references valid permissions
  test("3. All permissions referenced in ROUTE_POLICY_REGISTRY exist in authoritative catalog", () => {
    const invalidPermissions: string[] = [];

    ROUTE_POLICY_REGISTRY.forEach((policy) => {
      if (policy.requiredPermission && !permSet.has(policy.requiredPermission)) {
        invalidPermissions.push(`${policy.route} -> ${policy.requiredPermission}`);
      }
    });

    expect(invalidPermissions).toEqual([]);
  });

  // 4. Navigation manifest references valid permissions
  test("4. All permissions referenced in NAVIGATION_MANIFEST exist in authoritative catalog", () => {
    const invalidPermissions: string[] = [];

    NAVIGATION_MANIFEST.forEach((navItem) => {
      if (navItem.requiredAnyPermissions) {
        navItem.requiredAnyPermissions.forEach((p) => {
          if (!permSet.has(p)) {
            invalidPermissions.push(`${navItem.id} (any) -> ${p}`);
          }
        });
      }
      if (navItem.requiredAllPermissions) {
        navItem.requiredAllPermissions.forEach((p) => {
          if (!permSet.has(p)) {
            invalidPermissions.push(`${navItem.id} (all) -> ${p}`);
          }
        });
      }
    });

    expect(invalidPermissions).toEqual([]);
  });

  // 5. Verify no hardcoded production passwords or secret keys in route policies
  test("5. Route policies contain zero hardcoded demo credentials or raw secret strings", () => {
    ROUTE_POLICY_REGISTRY.forEach((policy) => {
      expect(policy.route).not.toContain("password");
      expect(policy.route).not.toContain("secret123");
    });
  });
});
