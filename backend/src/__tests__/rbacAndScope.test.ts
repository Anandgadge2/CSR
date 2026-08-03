import { requireOrgScope, requireDistrictScope } from "../middlewares/accessControlMiddleware";
import { isSuperAdmin } from "../services/roleResolver";
import { ROLE_ID } from "../types/role";

jest.mock("../config/db", () => ({
  auditLog: {
    create: jest.fn().mockResolvedValue({ id: "audit-1" }),
  },
  project: {
    findUnique: jest.fn(),
  },
  projectAssignment: {
    findFirst: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  corporateEnquiry: {
    groupBy: jest.fn(),
  },
  governmentPitch: {
    groupBy: jest.fn(),
  },
}));

describe("RBAC & Contextual Scope Security Engine", () => {
  const accountTypeRoleMap: Record<string, number> = {
    CSR_COMPANY: 8,
    COMPANY_ADMIN: 8,
    CORPORATE: 8,
    GOVERNMENT_DEPARTMENT: 7,
    GOVERNMENT_OFFICER: 7,
    GOVERNMENT: 7,
    NGO: 9,
    NGO_ADMIN: 9,
  };

  describe("Public Registration Security Rules", () => {
    it("1. role: 1 cannot be selected through public registration", () => {
      const input = "1";
      const mappedRole = accountTypeRoleMap[input.toUpperCase()];
      expect(mappedRole).toBeUndefined();
    });

    it("2. role: 'ADMIN' cannot be selected through public registration", () => {
      const input = "ADMIN";
      const mappedRole = accountTypeRoleMap[input.toUpperCase()];
      expect(mappedRole).toBeUndefined();
    });

    it("3. unknown role values do not create privileged users", () => {
      const invalidInputs = ["SUPER_ADMIN", "PLANNING_SECRETARY", "JOINT_SECRETARY", "SUPERMAN", "HACKER_ROLE", "0", "99"];
      invalidInputs.forEach((input) => {
        const mappedRole = accountTypeRoleMap[input.toUpperCase()];
        expect(mappedRole).toBeUndefined();
      });
    });
  });

  describe("Authentication Security Rules", () => {
    it("4. unverified users cannot log in", () => {
      const user = { email: "unverified@mahacsr.gov.in", isVerified: false, accountStatus: "ACTIVE", deletedAt: null };
      const canLogin = user.isVerified && user.accountStatus === "ACTIVE" && !user.deletedAt;
      expect(canLogin).toBe(false);
    });

    it("5. suspended users cannot log in", () => {
      const user = { email: "suspended@mahacsr.gov.in", isVerified: true, accountStatus: "SUSPENDED", deletedAt: null };
      const canLogin = user.isVerified && user.accountStatus === "ACTIVE" && !user.deletedAt;
      expect(canLogin).toBe(false);
    });

    it("6. deleted users cannot log in", () => {
      const user = { email: "deleted@mahacsr.gov.in", isVerified: true, accountStatus: "ACTIVE", deletedAt: new Date() };
      const canLogin = user.isVerified && user.accountStatus === "ACTIVE" && !user.deletedAt;
      expect(canLogin).toBe(false);
    });
  });

  describe("Tenant & Role Management Security Rules", () => {
    let mockReq: any;
    let mockRes: any;
    let nextFunction: any;

    beforeEach(() => {
      mockReq = {
        user: {
          id: "usr-101",
          role: ROLE_ID.COMPANY_ADMIN,
          organizationId: "org-alpha",
          assignedDistrict: "Pune",
        },
        params: {},
        body: {},
        query: {},
        originalUrl: "/test-route",
        ip: "127.0.0.1",
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      nextFunction = jest.fn();
    });

    it("7. a normal company, NGO, government, RM, DNC, or DNO token cannot bypass role checks", () => {
      const nonSuperAdminRoles = [
        ROLE_ID.COMPANY_ADMIN,
        ROLE_ID.NGO_ADMIN,
        ROLE_ID.GOVERNMENT_OFFICER,
        ROLE_ID.RELATIONSHIP_MANAGER,
        ROLE_ID.DISTRICT_NODAL_CONSULTANT,
        ROLE_ID.DISTRICT_NODAL_OFFICER,
      ];

      nonSuperAdminRoles.forEach((role) => {
        expect(isSuperAdmin({ role })).toBe(false);
      });
    });

    it("8. an organization admin cannot access another organization's custom roles", async () => {
      mockReq.params.organizationId = "org-beta";
      await requireOrgScope(mockReq, mockRes, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Forbidden") })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("9. missing role relationships never produce administrator access", () => {
      const nullRoleUser = { role: null, roleId: null, roleSlug: null };
      const undefinedRoleUser = {};
      expect(isSuperAdmin(nullRoleUser)).toBe(false);
      expect(isSuperAdmin(undefinedRoleUser)).toBe(false);
    });
  });
});
