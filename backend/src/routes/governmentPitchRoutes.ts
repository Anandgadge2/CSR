import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { ROLE_ID } from "../types/role";
import { requireApprovedOrganization, requireVerifiedActiveUser, requirePermission } from "../middlewares/accessControlMiddleware";
import {
  submitPitch,
  listGovernmentPitches,
  getPublicPitches,
  getPitchById,
  submitInterest,
  getMyPitches,
  verifyPitch,
  approvePitch,
  assignPitchRelationshipManager,
  recordPitchRmContact,
  convertPitchToProject
} from "../controllers/governmentPitchController";

const router = Router();

router.post("/", authenticateToken, requireVerifiedActiveUser, requireApprovedOrganization("GOVERNMENT_DEPARTMENT"), requirePermission("pitch:create"), submitPitch);
router.get("/", authenticateToken, requirePermission("pitch:view"), listGovernmentPitches);
router.get("/public", getPublicPitches);
router.get("/my", authenticateToken, requirePermission("pitch:view"), getMyPitches);
router.get("/:id", authenticateToken, requirePermission("pitch:view"), getPitchById);
router.post("/:id/interest", authenticateToken, requirePermission("pitch:view"), submitInterest);
router.post("/:id/verify", authenticateToken, requirePermission("pitch:verify"), verifyPitch);
router.post("/:id/approve", authenticateToken, requirePermission("pitch:approve"), approvePitch);
router.post("/:id/assign-rm", authenticateToken, requirePermission("pitch:assign"), assignPitchRelationshipManager);
router.post("/:id/record-contact", authenticateToken, requirePermission("pitch:view"), recordPitchRmContact);
router.post("/:id/convert", authenticateToken, requirePermission("pitch:convert"), convertPitchToProject);

export default router;
