import { Router } from "express";
import { z } from "zod";
import { Role } from "../types/role";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { checkPermission } from "../middlewares/accessControlMiddleware";
import { createAdminUser, getAdminOverview, listUsers, updateUserRole, deleteUser, runSlaEscalations, runSlaEscalationsViaCron, getSlaStatistics, getSlaConfiguration, updateSlaConfiguration } from "../controllers/adminController";
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
import {
  getConvergenceOverview,
  getConvergenceReport,
  getFundMonitoringSummary,
  listPitchInterests
} from "../controllers/adminConvergenceController";

const router = Router();

const requireSuperAdmin = [authenticateToken, authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN])];

// Role can be a base platform enum OR the name of a dynamic OrganizationRole —
// do not hardcode an enum here; controllers resolve dynamic names against the DB.
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).optional(),
    role: z.string().min(1),
    assignedDistrict: z.string().optional(),
    accountStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_ACTIVATION"]).optional()
  })
});

const roleSchema = z.object({
  body: z.object({
    role: z.preprocess((val) => (val === "" ? null : val), z.string().nullable()).optional(),
    assignedDistrict: z.string().optional(),
    accountStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_ACTIVATION"]).optional()
  })
});

const requireStateCell = [authenticateToken, authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN, Role.DISTRICT_ADMIN])];

router.get("/overview", ...requireSuperAdmin, getAdminOverview);
router.get("/users", ...requireSuperAdmin, listUsers);
router.post("/users", ...requireSuperAdmin, validateRequest(createUserSchema), createAdminUser);
router.patch("/users/:id/role", ...requireSuperAdmin, validateRequest(roleSchema), updateUserRole);
router.delete("/users/:id", ...requireSuperAdmin, deleteUser);
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

// Convergence-model admin views
router.get("/pitch-interests", ...requireStateCell, checkPermission("interest:view"), listPitchInterests);
router.get("/fund-monitoring", ...requireStateCell, checkPermission("fund:view"), getFundMonitoringSummary);
router.get("/convergence-overview", ...requireStateCell, getConvergenceOverview);
router.get("/convergence-report", ...requireStateCell, checkPermission("report:view"), getConvergenceReport);

// SLA escalation monitoring & manual sweep trigger
router.get("/sla/statistics", ...requireSuperAdmin, getSlaStatistics);
router.post("/sla/run-escalations", ...requireSuperAdmin, runSlaEscalations);

// Dynamic SLA windows — super-admin controlled (days per stage)
router.get("/sla/config", ...requireSuperAdmin, getSlaConfiguration);
router.put("/sla/config", ...requireSuperAdmin, updateSlaConfiguration);
// Serverless external-cron entry point — authenticated via CRON_SECRET header,
// not a user JWT (no auth middleware here by design).
router.post("/sla/cron-escalations", runSlaEscalationsViaCron);

export default router;
