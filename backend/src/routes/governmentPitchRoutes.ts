import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
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

router.post("/", authenticateToken, submitPitch);
router.get("/public", getPublicPitches);
router.get("/my", authenticateToken, getMyPitches);
router.get("/:id", authenticateToken, getPitchById);
router.post("/:id/interest", authenticateToken, submitInterest);
router.post("/:id/verify", authenticateToken, verifyPitch);
router.post("/:id/approve", authenticateToken, approvePitch);
router.post("/:id/assign-rm", authenticateToken, assignPitchRelationshipManager);
router.post("/:id/record-contact", authenticateToken, recordPitchRmContact);
router.post("/:id/convert", authenticateToken, convertPitchToProject);

export default router;
