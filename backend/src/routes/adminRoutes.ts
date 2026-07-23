import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { createAdminUser, getAdminOverview, listUsers, deleteUser, updateUser } from "../controllers/adminController";
import { getConvergenceOverview, listPitchInterests } from "../controllers/adminConvergenceController";
import {
  listOrganizations,
  getOrganizationById,
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
  requestClarification
} from "../controllers/organizationAdminController";
import { Role } from "../types/role";

const router = Router();

const requireAdmin = [authenticateToken, authorizeRoles([Role.SUPER_ADMIN])];

router.use(requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/convergence/overview", getConvergenceOverview);
router.get("/pitch-interests", listPitchInterests);
router.get("/users", listUsers);
router.post("/users", createAdminUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Organization management endpoints
router.get("/organizations", listOrganizations);
router.get("/organizations/:id", getOrganizationById);
router.post("/organizations/:id/approve", approveOrganization);
router.post("/organizations/:id/reject", rejectOrganization);
router.post("/organizations/:id/suspend", suspendOrganization);
router.post("/organizations/:id/request-clarification", requestClarification);

export default router;
