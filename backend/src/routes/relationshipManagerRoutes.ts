import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  getRMOverview,
  listRMEnquiries,
  getRMEnquiryById,
  listRMPitches,
  getRMPitchById,
  getRMEscalations,
  getCorporateInterests,
  updateCorporateInterest,
  verifyGovernmentPitch,
  logEnquiryInteraction,
  submitFeasibilityAssessment
} from "../controllers/relationshipManagerController";

const router = Router();

router.use(authenticateToken);

router.get("/overview", getRMOverview);
router.get("/enquiries", listRMEnquiries);
router.get("/enquiries/:id", getRMEnquiryById);
router.post("/enquiries/:id/interactions", logEnquiryInteraction);
router.post("/enquiries/:id/feasibility", submitFeasibilityAssessment);

router.get("/pitches", listRMPitches);
router.get("/pitches/:id", getRMPitchById);
router.patch("/pitches/:id/verify", verifyGovernmentPitch);

router.get("/escalations", getRMEscalations);
router.get("/interests", getCorporateInterests);
router.patch("/interests/:id", updateCorporateInterest);

export default router;
