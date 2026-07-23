import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { initiateCompletion, submitFinalUC, verifyCompletion, getCompletionDetails } from "../controllers/completionController";

const router = Router();
router.use(authenticateToken);

router.post("/:projectId/initiate", initiateCompletion);
router.post("/:projectId/final-uc", submitFinalUC);
router.post("/:projectId/verify", verifyCompletion);
router.get("/:projectId", getCompletionDetails);

export default router;
