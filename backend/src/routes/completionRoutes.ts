import { Router } from "express";
import {
  submitCompletionReport,
  generateImpactReport,
  getImpactReport
} from "../controllers/completionController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/requirement/:requirementId/submit", authenticateToken, submitCompletionReport);
router.post("/requirement/:requirementId/generate-impact", authenticateToken, generateImpactReport);
router.get("/requirement/:requirementId/impact", authenticateToken, getImpactReport);

export default router;
