import { Router } from "express";
import {
  createFundMilestones,
  updateFundMilestone,
  getFundMilestones
} from "../controllers/csrFundController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/requirement/:requirementId", authenticateToken, createFundMilestones);
router.patch("/:id", authenticateToken, updateFundMilestone);
router.get("/requirement/:requirementId", authenticateToken, getFundMilestones);

export default router;
