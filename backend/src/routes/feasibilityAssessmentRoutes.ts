import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/accessControlMiddleware";
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

router.post("/", requirePermission("assessment:create"), createAssessment);
router.get("/pending", requirePermission("assessment:view"), getPendingAssessments);
router.get("/:id", requirePermission("assessment:view"), getAssessmentById);
router.post("/:id/decision", requirePermission("assessment:decide"), submitJSDecision);
router.post("/:id/appoint-nodal", requirePermission("assessment:review"), appointNodalOfficer);
router.post("/:id/onboard", requirePermission("assessment:submit"), onboardAssessmentProject);
router.put("/:id/checklist", requirePermission("assessment:review"), updateChecklistItems);

export default router;
