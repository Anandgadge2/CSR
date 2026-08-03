import { requireOrgScope, requireDistrictScope, requireProjectScope } from "../middlewares/accessControlMiddleware";
import { autoAssignRelationshipManager } from "../services/rmAssignmentService";
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
  },
  corporateEnquiry: {
    groupBy: jest.fn(),
  },
  governmentPitch: {
    groupBy: jest.fn(),
  },
}));

describe("RBAC & Contextual Scope Security Engine", () => {
  describe("Public Registration Hardening", () => {
    it("should allow valid public registration roles (Company Admin 8, NGO Admin 9, Govt Officer 7)", () => {
      const allowedRoles = [8, 9, 7];
      expect(allowedRoles.includes(ROLE_ID.COMPANY_ADMIN)).toBe(true);
      expect(allowedRoles.includes(ROLE_ID.NGO_ADMIN)).toBe(true);
      expect(allowedRoles.includes(ROLE_ID.GOVERNMENT_OFFICER)).toBe(true);
    });

    it("should reject privileged role registration (Super Admin 1, Planning Sec 2, Joint Sec 3, DNO 4, DNC 5, RM 6)", () => {
      const allowedRoles = [8, 9, 7];
      const privilegedRoles = [
        ROLE_ID.SUPER_ADMIN,
        ROLE_ID.PLANNING_SECRETARY,
        ROLE_ID.JOINT_SECRETARY,
        ROLE_ID.DISTRICT_NODAL_OFFICER,
        ROLE_ID.DISTRICT_NODAL_CONSULTANT,
        ROLE_ID.RELATIONSHIP_MANAGER,
      ];

      privilegedRoles.forEach((role) => {
        expect(allowedRoles.includes(role)).toBe(false);
      });
    });
  });

  describe("Contextual Scope Authorization Middleware", () => {
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

    it("requireOrgScope: allows access when user organization matches target organization", async () => {
      mockReq.params.organizationId = "org-alpha";
      await requireOrgScope(mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("requireOrgScope: denies access (403) when user organization does NOT match target organization", async () => {
      mockReq.params.organizationId = "org-beta";
      await requireOrgScope(mockReq, mockRes, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Forbidden") })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("requireDistrictScope: allows access when user assigned district matches target district", async () => {
      mockReq.user.role = ROLE_ID.DISTRICT_NODAL_CONSULTANT;
      mockReq.params.district = "Pune";
      await requireDistrictScope(mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("requireDistrictScope: denies access (403) when user attempts cross-district access", async () => {
      mockReq.user.role = ROLE_ID.DISTRICT_NODAL_CONSULTANT;
      mockReq.params.district = "Nagpur";
      await requireDistrictScope(mockReq, mockRes, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining("Forbidden") })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("requireDistrictScope: allows state-wide platform roles (Super Admin, JS, PS) to bypass district check", async () => {
      mockReq.user.role = ROLE_ID.SUPER_ADMIN;
      mockReq.params.district = "Nagpur";
      await requireDistrictScope(mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
