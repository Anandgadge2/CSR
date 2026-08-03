import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { ROLE_ID } from "../types/role";
import { requireApprovedOrganization, requireVerifiedActiveUser } from "../middlewares/accessControlMiddleware";
import {
  submitPitch,
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

router.post("/", authenticateToken, requireVerifiedActiveUser, requireApprovedOrganization("GOVERNMENT_DEPARTMENT"), submitPitch);
router.get("/public", getPublicPitches);
router.get("/my", authenticateToken, getMyPitches);
router.get("/:id", authenticateToken, getPitchById);
router.post("/:id/interest", authenticateToken, submitInterest);
router.post("/:id/verify", authenticateToken, verifyPitch);
router.post("/:id/approve", authenticateToken, authorizeRoles([ROLE_ID.JOINT_SECRETARY]), approvePitch);
router.post("/:id/assign-rm", authenticateToken, authorizeRoles([ROLE_ID.JOINT_SECRETARY]), assignPitchRelationshipManager);
router.post("/:id/record-contact", authenticateToken, recordPitchRmContact);
router.post("/:id/convert", authenticateToken, convertPitchToProject);

export default router;
