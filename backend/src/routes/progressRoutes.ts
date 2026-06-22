import { Router } from "express";
import {
  submitProgressReport,
  verifyProgressReport,
  getProgressReports
} from "../controllers/progressController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticateToken, submitProgressReport);
router.patch("/:id/verify", authenticateToken, verifyProgressReport);
router.get("/requirement/:requirementId", authenticateToken, getProgressReports);

export default router;
