import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { createAdminUser, getAdminOverview, listUsers, deleteUser, updateUser, importAdminUsers } from "../controllers/adminController";
import { getConvergenceOverview, listPitchInterests } from "../controllers/adminConvergenceController";
import {
  listOrganizations,
  listPendingOrganizations,
  getOrganizationById,
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
  requestClarification
} from "../controllers/organizationAdminController";
import { Role } from "../types/role";
import { getSlaConfiguration, saveSlaConfiguration } from "../controllers/slaAdminController";

const router = Router();

const requireAdmin = [authenticateToken, authorizeRoles([Role.SUPER_ADMIN])];

router.use(requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/convergence/overview", getConvergenceOverview);
router.get("/pitch-interests", listPitchInterests);
router.get("/users", listUsers);
router.post("/users", createAdminUser);
router.post("/users/import", importAdminUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/sla/config", getSlaConfiguration);
router.put("/sla/config", saveSlaConfiguration);

// Organization management endpoints
router.get("/organizations", listOrganizations);
router.get("/organizations/pending", listPendingOrganizations);
router.get("/organizations/:id", getOrganizationById);
router.post("/organizations/:id/approve", approveOrganization);
router.post("/organizations/:id/reject", rejectOrganization);
router.post("/organizations/:id/suspend", suspendOrganization);
router.post("/organizations/:id/request-clarification", requestClarification);

export default router;
