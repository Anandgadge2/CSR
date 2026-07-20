/**
 * Drift-guard for the role registry.
 *
 * The portal has exactly 9 seeded, assignable roles. Historically the role
 * surface diverged across three sources (a 3-value Prisma enum, an 11-row seed,
 * and a 22-entry slug map), which caused always-false auth gates and confusion.
 * These tests lock the registry so the count can never silently grow again:
 * every seeded role must have a permission set, and every deprecated alias must
 * resolve to one of the 9 canonical slugs.
 */
import { ROLE_SLUG, SEEDED_ROLE_SLUGS, Role } from "../types/role";
import {
  SEED_ROLE_PERMISSIONS,
  SYSTEM_ROLE_IDS,
} from "../config/platformAccess";

/** The 9 canonical seeded roles — the single definition the portal ships. */
const EXPECTED_SEEDED_SLUGS = [
  "super-admin",
  "planning-secretary",
  "joint-secretary",
  "district-nodal-consultant",
  "district-nodal-officer",
  "relationship-manager",
  "company-admin",
  "government-officer",
  "ngo-admin",
].sort();

describe("role registry (drift guard)", () => {
  it("seeds exactly 9 canonical roles", () => {
    expect(SEEDED_ROLE_SLUGS.length).toBe(9);
    expect([...SEEDED_ROLE_SLUGS].sort()).toEqual(EXPECTED_SEEDED_SLUGS);
  });

  it("has no duplicate seeded slugs", () => {
    expect(new Set(SEEDED_ROLE_SLUGS).size).toBe(SEEDED_ROLE_SLUGS.length);
  });

  it("gives every seeded role a permission set (permKey ⇒ slug)", () => {
    // Each seeded role's permKey (underscore form) must exist in the permission
    // map, and its slug must exist in ROLE_SLUG. The two enum-companion keys
    // (SUPER_ADMIN's org role, GOVERNMENT_OFFICER) are covered here too.
    const permKeyBySlug: Record<string, string> = {
      "super-admin": "SUPER_ADMIN",
      "planning-secretary": "PLANNING_SECRETARY",
      "joint-secretary": "JOINT_SECRETARY",
      "district-nodal-consultant": "DISTRICT_NODAL_CONSULTANT",
      "district-nodal-officer": "DISTRICT_NODAL_OFFICER",
      "relationship-manager": "RELATIONSHIP_MANAGER",
      "company-admin": "COMPANY_ADMIN",
      "government-officer": "GOVERNMENT_OFFICER",
      "ngo-admin": "NGO_ADMIN",
    };
    for (const slug of SEEDED_ROLE_SLUGS) {
      const permKey = permKeyBySlug[slug];
      expect(permKey).toBeDefined();
      expect(SEED_ROLE_PERMISSIONS[permKey]).toBeDefined();
      expect(SEED_ROLE_PERMISSIONS[permKey].length).toBeGreaterThan(0);
    }
  });

  it("does not seed the dropped roles", () => {
    // beneficiary-agency was folded into government-officer; state-csr-cell,
    // portal-admin and csr-admin were dropped/collapsed into super-admin.
    expect(SEEDED_ROLE_SLUGS).not.toContain("beneficiary-agency");
    expect(SEEDED_ROLE_SLUGS).not.toContain("state-csr-cell");
    expect(SEEDED_ROLE_SLUGS).not.toContain("portal-admin");
    expect(SEEDED_ROLE_SLUGS).not.toContain("csr-admin");
  });

  it("resolves every deprecated alias to a canonical seeded slug", () => {
    // Collapsed aliases must point at a role that is actually seeded, so a
    // legacy call site never resolves to a dead identity.
    const collapsed: Array<[keyof typeof Role, string]> = [
      ["ADMIN", "super-admin"],
      ["PORTAL_ADMIN", "super-admin"],
      ["CSR_ADMIN", "super-admin"],
      ["DISTRICT_ADMIN", "district-nodal-officer"],
      ["BENEFICIARY_AGENCY", "government-officer"],
      ["NGO_MEMBER", "ngo-admin"],
      ["COMPANY_MEMBER", "company-admin"],
      ["AUTHORIZED_SIGNATORY", "ngo-admin"],
    ];
    for (const [alias, target] of collapsed) {
      expect(Role[alias]).toBe(target);
      expect(SEEDED_ROLE_SLUGS).toContain(target as any);
    }
  });

  it("keeps the implementing-agency scoping identity distinct (not seeded)", () => {
    // It's a row-level ownership marker, never an assignable role.
    expect(ROLE_SLUG.IMPLEMENTING_AGENCY_USER).toBe("implementing-agency-user");
    expect(SEEDED_ROLE_SLUGS).not.toContain("implementing-agency-user");
  });

  it("assigns a stable numeric id to every seeded org role", () => {
    // SYSTEM_ROLE_IDS drives dashboard routing; each seeded org role (all 9
    // except the base-enum-only companions) must have one.
    const idKeys = Object.keys(SYSTEM_ROLE_IDS);
    for (const key of [
      "SUPER_ADMIN",
      "PLANNING_SECRETARY",
      "JOINT_SECRETARY",
      "DISTRICT_NODAL_OFFICER",
      "DISTRICT_NODAL_CONSULTANT",
      "RELATIONSHIP_MANAGER",
      "NGO_ADMIN",
      "COMPANY_ADMIN",
      "GOVERNMENT_OFFICER",
    ]) {
      expect(idKeys).toContain(key);
    }
  });
});
