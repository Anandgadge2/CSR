import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  createAssessment,
  getPendingAssessments,
  getAssessmentById,
  submitJSDecision,
  appointNodalOfficer,
  onboardAssessmentProject,
  updateChecklistItems
} from "../controllers/feasibilityAssessmentController";

const router = Router();
router.use(authenticateToken);

router.post("/", createAssessment);
router.get("/pending", getPendingAssessments);
router.get("/:id", getAssessmentById);
router.post("/:id/decision", submitJSDecision);
router.post("/:id/appoint-nodal", appointNodalOfficer);
router.post("/:id/onboard", onboardAssessmentProject);
router.put("/:id/checklist", updateChecklistItems);

export default router;
