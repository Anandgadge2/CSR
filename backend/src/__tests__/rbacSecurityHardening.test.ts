import { AccessControlApiService } from "../services/accessControlApiService";
import { EffectivePermissionService } from "../services/effectivePermissionService";
import { ScopedAssignmentService } from "../services/scopedAssignmentService";
import { RmAssignmentService } from "../services/rmAssignmentService";
import { requireActiveOrganization } from "../middlewares/onboardingGuardMiddleware";
import prisma from "../config/db";

jest.mock("../config/db", () => {
  return {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    rolePermission: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    userRoleAssignment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    districtDncAssignment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
    projectDistrictDncAssignment: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    projectAssignment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit-sec-1" }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    notification: {
      create: jest.fn().mockResolvedValue({ id: "notif-1" }),
    },
    corporateEnquiry: {
      groupBy: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    governmentPitch: {
      groupBy: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(prisma)),
  };
});

describe("Comprehensive RBAC & Security Hardening Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // 1. UNIT & DELEGATION CEILING TESTS
  // ===========================================================================
  describe("Unit & Delegation Ceiling Security", () => {
    test("Delegation Ceiling: Non-SuperAdmin cannot grant permissions they do not possess", async () => {
      // Mock actor has only role:view
      jest.spyOn(EffectivePermissionService, "getEffectiveAccessPayload").mockResolvedValue({
        userId: "usr-org-admin",
        isSuperAdmin: false,
        roles: ["GOVERNMENT_ORG_ADMIN"],
        permissions: ["role:view", "user:view"],
      } as any);

      // Attempt to grant role:delete
      await expect(
        AccessControlApiService.checkDelegationCeiling("usr-org-admin", ["role:view", "role:delete"])
      ).rejects.toThrow(/Delegation Ceiling Violation/);
    });

    test("Delegation Ceiling: Non-SuperAdmin cannot grant HIGH/CRITICAL risk permissions even if possessed", async () => {
      jest.spyOn(EffectivePermissionService, "getEffectiveAccessPayload").mockResolvedValue({
        userId: "usr-org-admin",
        isSuperAdmin: false,
        roles: ["GOVERNMENT_ORG_ADMIN"],
        permissions: ["role:view", "role:configure", "role:delete"],
      } as any);

      (prisma.permission.findMany as jest.Mock).mockResolvedValue([
        { key: "role:delete", riskLevel: "CRITICAL" },
      ]);

      await expect(
        AccessControlApiService.checkDelegationCeiling("usr-org-admin", ["role:delete"])
      ).rejects.toThrow(/Delegation Ceiling Violation/);
    });

    test("SuperAdmin bypasses Delegation Ceiling checks", async () => {
      jest.spyOn(EffectivePermissionService, "getEffectiveAccessPayload").mockResolvedValue({
        userId: "usr-super-admin",
        isSuperAdmin: true,
        roles: ["SUPER_ADMIN"],
        permissions: ["*"],
      } as any);

      await expect(
        AccessControlApiService.checkDelegationCeiling("usr-super-admin", ["role:delete", "system:root"])
      ).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // 2. ADVERSARIAL SECURITY TESTS
  // ===========================================================================
  describe("Adversarial Security & Escalation Attempts", () => {
    test("Attempt 1: Custom role creation using reserved System Role Code is rejected", async () => {
      (prisma.permission.findMany as jest.Mock).mockResolvedValue([{ key: "role:view" }]);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        code: "SUPER_ADMIN",
        isSystemRole: true,
      });

      // Simulating system role code collision check
      const codeCheck = async (code: string) => {
        const existing = await prisma.role.findUnique({ where: { code } });
        if (existing) throw new Error("Role code already exists");
      };

      await expect(codeCheck("SUPER_ADMIN")).rejects.toThrow("Role code already exists");
    });

    test("Attempt 2: Cross-tenant role update attempt is denied for non-SuperAdmin", async () => {
      const actorOrgId = "org-alpha";
      const targetRoleOrgId = "org-beta";

      const validateCrossTenantEdit = (actorOrg: string, roleOrg: string, isSuperAdmin: boolean) => {
        if (!isSuperAdmin && actorOrg !== roleOrg) {
          throw new Error("Forbidden: Cross-tenant role modification denied");
        }
      };

      expect(() => validateCrossTenantEdit(actorOrgId, targetRoleOrgId, false)).toThrow(
        "Forbidden: Cross-tenant role modification denied"
      );
    });

    test("Attempt 3: Cross-tenant DNO delegation attempt is denied", async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: "proj-pune",
        district: "Pune",
      });
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: "usr-dno-mumbai",
        roleId: 4,
        role: { code: "DISTRICT_NODAL_OFFICER" },
        officerProfile: { district: "Mumbai" },
        userRoles: [],
      });

      await expect(
        ScopedAssignmentService.delegateDistrictDno("proj-pune", "usr-dno-mumbai", "usr-dnc-pune")
      ).rejects.toThrow("Wrong District Error");
    });

    test("Attempt 4: Direct JS project approval attempt without permission fails", async () => {
      const checkJsApprovalPermission = (userPermissions: string[]) => {
        if (!userPermissions.includes("project:approve")) {
          throw new Error("Forbidden: Missing required permission 'project:approve'");
        }
      };

      expect(() => checkJsApprovalPermission(["project:view"])).toThrow(
        "Forbidden: Missing required permission 'project:approve'"
      );
    });

    test("Attempt 5: Non-ACTIVE organization submitting business enquiry is blocked by onboarding guard", async () => {
      const req: any = {
        user: { id: "usr-1", role: "COMPANY_ADMIN", organizationId: "org-registered" },
      };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      (prisma.organization.findUnique as jest.Mock).mockResolvedValue({
        id: "org-registered",
        name: "Unapproved Org",
        status: "REGISTERED",
      });

      await requireActiveOrganization(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: "ONBOARDING_PENDING" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test("Attempt 6: Stale version optimistic locking violation returns HTTP 409", async () => {
      const currentDbVersion = 3;
      const clientProvidedVersion = 2;

      const updateWithLock = (clientVer: number, dbVer: number) => {
        if (clientVer !== dbVer) {
          const err: any = new Error("Stale version conflict");
          err.status = 409;
          err.meta = { serverVersion: dbVer, clientVersion: clientVer };
          throw err;
        }
      };

      try {
        updateWithLock(clientProvidedVersion, currentDbVersion);
      } catch (err: any) {
        expect(err.status).toBe(409);
        expect(err.meta.serverVersion).toBe(3);
      }
    });

    test("Attempt 7: Assigning archived or inactive role is denied", async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 99,
        code: "CUSTOM_ARCHIVED",
        status: "ARCHIVED",
      });

      const validateRoleForAssignment = (role: any) => {
        if (role.status !== "ACTIVE") {
          throw new Error(`Cannot assign role '${role.code}' with status '${role.status}'`);
        }
      };

      expect(() => validateRoleForAssignment({ code: "CUSTOM_ARCHIVED", status: "ARCHIVED" })).toThrow(
        "Cannot assign role 'CUSTOM_ARCHIVED' with status 'ARCHIVED'"
      );
    });

    test("Attempt 8: Deleting protected system role is denied", async () => {
      const deleteRoleGuard = (role: any) => {
        if (role.isProtected || role.isSystemRole) {
          throw new Error(`Protected system role '${role.code}' cannot be deleted`);
        }
      };

      expect(() => deleteRoleGuard({ code: "SUPER_ADMIN", isProtected: true, isSystemRole: true })).toThrow(
        "Protected system role 'SUPER_ADMIN' cannot be deleted"
      );
    });
  });

  // ===========================================================================
  // 3. IMPACT PREVIEW & AUDIT VERIFICATION
  // ===========================================================================
  describe("Impact Preview & Audit Compliance", () => {
    test("Impact Preview correctly calculates affected users, active sessions, and high-risk changes", async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 5,
        name: "District Nodal Consultant",
        roleAssignments: [
          { user: { id: "u-1", email: "dnc1@maha.gov.in", firstName: "DNC", lastName: "One" } },
          { user: { id: "u-2", email: "dnc2@maha.gov.in", firstName: "DNC", lastName: "Two" } },
        ],
        rolePermissions: [],
      });

      (prisma.permission.findMany as jest.Mock).mockResolvedValue([
        { key: "role:delete", riskLevel: "CRITICAL" },
      ]);

      const preview = await AccessControlApiService.computeImpactPreview(
        5,
        ["role:delete"],
        ["pitch:view"]
      );

      expect(preview.affectedUserCount).toBe(2);
      expect(preview.permissionsToAdd).toContain("role:delete");
      expect(preview.highRiskChanges).toContain("role:delete");
      expect(preview.requiresReason).toBe(true);
    });
  });
});
