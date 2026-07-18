/**
 * @deprecated LEGACY - NOT MOUNTED in app.ts (ENABLE_LEGACY_NGO_MARKETPLACE guard).
 * This router is not registered; changes here have no runtime effect.
 */
import { Router } from "express";
import {
  submitNGOApplication,
  getApplicationsForRequirement,
  getMyApplications,
  updateApplicationStatus
} from "../controllers/ngoApplicationController";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { checkOrganizationApproved, checkPermission } from "../middlewares/accessControlMiddleware";
import { Role } from "../types/role";

const router = Router();
const ngoTransaction = [
  authenticateToken,
  authorizeRoles([Role.NGO_ADMIN, Role.NGO_MEMBER, Role.SUPER_ADMIN]),
  checkOrganizationApproved
];

router.post("/", ...ngoTransaction, checkPermission("project:create"), submitNGOApplication);
router.get("/my", ...ngoTransaction, checkPermission("project:view"), getMyApplications);
router.get(
  "/requirement/:requirementId",
  authenticateToken,
  authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN, Role.BENEFICIARY_AGENCY]),
  checkPermission("project:view"),
  getApplicationsForRequirement
);
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN]),
  checkPermission("project:approve"),
  updateApplicationStatus
);

export default router;
