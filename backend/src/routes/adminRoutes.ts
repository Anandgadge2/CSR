import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { checkPermission, checkTenantActive, resolveTenantContext } from "../middlewares/tenantMiddleware";
import { getAdminOverview, listUsers, updateUserRole } from "../controllers/adminController";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  approveRequirement,
  getVerificationQueue,
  publishRequirement,
  rejectRequirement,
  requestRequirementClarification
} from "../controllers/csrRequirementController";
import { approveCompanyInterest, listCompanyInterestsForAdmin } from "../controllers/companyInterestController";
import {
  approveOrganization,
  getOrganizationById,
  listOrganizations,
  listPendingOrganizations,
  rejectOrganization,
  requestClarification,
  suspendOrganization
} from "../controllers/organizationAdminController";

const router = Router();

const requireSuperAdmin = [authenticateToken, authorizeRoles([Role.MASTER_ADMIN, Role.SUPER_ADMIN]), resolveTenantContext, checkTenantActive];

const roleSchema = z.object({
  body: z.object({
    role: z.enum(["SUPER_ADMIN", "PORTAL_ADMIN", "CSR_ADMIN", "DISTRICT_ADMIN", "BENEFICIARY_AGENCY", "COMPANY_ADMIN", "COMPANY_MEMBER", "NGO_ADMIN", "NGO_MEMBER", "FINANCE_USER", "ANALYST_REVIEWER", "COMPLIANCE_REVIEWER", "APPROVER", "AUDITOR"])
  })
});

const requireStateCell = [authenticateToken, authorizeRoles([Role.MASTER_ADMIN, Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN, Role.DISTRICT_ADMIN]), resolveTenantContext, checkTenantActive];

router.get("/overview", ...requireSuperAdmin, getAdminOverview);
router.get("/users", ...requireSuperAdmin, listUsers);
router.patch("/users/:id/role", ...requireSuperAdmin, validateRequest(roleSchema), updateUserRole);
router.get("/organizations", ...requireStateCell, checkPermission("organization:view"), listOrganizations);
router.get("/organizations/pending", ...requireStateCell, checkPermission("organization:view"), listPendingOrganizations);
router.get("/organizations/:id", ...requireStateCell, checkPermission("organization:view"), getOrganizationById);
router.post("/organizations/:id/approve", ...requireStateCell, checkPermission("organization:approve"), approveOrganization);
router.post("/organizations/:id/reject", ...requireStateCell, checkPermission("organization:approve"), rejectOrganization);
router.post("/organizations/:id/request-clarification", ...requireStateCell, checkPermission("organization:approve"), requestClarification);
router.post("/organizations/:id/suspend", ...requireStateCell, checkPermission("organization:suspend"), suspendOrganization);
router.get("/onboarding/pending", ...requireStateCell, checkPermission("organization:view"), listPendingOrganizations);
router.get("/onboarding/:id", ...requireStateCell, checkPermission("organization:view"), getOrganizationById);
router.post("/onboarding/:id/approve", ...requireStateCell, checkPermission("organization:approve"), approveOrganization);
router.post("/onboarding/:id/reject", ...requireStateCell, checkPermission("organization:approve"), rejectOrganization);
router.post("/onboarding/:id/request-clarification", ...requireStateCell, checkPermission("organization:approve"), requestClarification);
router.post("/onboarding/:id/suspend", ...requireStateCell, checkPermission("organization:suspend"), suspendOrganization);
router.get("/requirements/pending", ...requireStateCell, checkPermission("requirement:view"), getVerificationQueue);
router.post("/requirements/:id/approve", ...requireStateCell, checkPermission("requirement:approve"), approveRequirement);
router.post("/requirements/:id/reject", ...requireStateCell, checkPermission("requirement:approve"), rejectRequirement);
router.post("/requirements/:id/request-clarification", ...requireStateCell, checkPermission("requirement:approve"), requestRequirementClarification);
router.post("/requirements/:id/publish", ...requireStateCell, checkPermission("requirement:publish"), publishRequirement);
router.get("/company-interests", ...requireStateCell, listCompanyInterestsForAdmin);
router.post("/company-interests/:id/approve", ...requireStateCell, checkPermission("interest:approve"), approveCompanyInterest);

export default router;
