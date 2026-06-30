import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  getPendingAssessments,
  getAssessmentById,
  submitJSDecision,
  appointNodalOfficer,
  updateChecklistItems,
} from "../controllers/feasibilityAssessmentController";

const router = Router();

// Get pending assessments for JS
router.get(
  "/pending",
  authenticateToken,
  authorizeRoles([Role.JOINT_SECRETARY, Role.CSR_RELATIONSHIP_MANAGER, Role.SUPER_ADMIN, Role.PORTAL_ADMIN]),
  asyncHandler(getPendingAssessments)
);

// Get assessment by ID
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles([Role.JOINT_SECRETARY, Role.CSR_RELATIONSHIP_MANAGER, Role.SUPER_ADMIN, Role.PORTAL_ADMIN]),
  asyncHandler(getAssessmentById)
);

// Submit JS decision
router.post(
  "/:id/decision",
  authenticateToken,
  authorizeRoles([Role.JOINT_SECRETARY, Role.SUPER_ADMIN, Role.PORTAL_ADMIN]),
  asyncHandler(submitJSDecision)
);

// Appoint nodal officer
router.post(
  "/:id/nodal-officer",
  authenticateToken,
  authorizeRoles([Role.JOINT_SECRETARY, Role.SUPER_ADMIN, Role.PORTAL_ADMIN]),
  asyncHandler(appointNodalOfficer)
);

// Update checklist items
router.patch(
  "/:id/checklist",
  authenticateToken,
  authorizeRoles([Role.CSR_RELATIONSHIP_MANAGER, Role.SUPER_ADMIN, Role.PORTAL_ADMIN]),
  asyncHandler(updateChecklistItems)
);

export default router;
