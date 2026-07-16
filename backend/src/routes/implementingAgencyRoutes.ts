import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  createSubLogin,
  listMySubLogins,
  assignAgencyToProject,
  listPendingApprovals,
  decideSubLogin,
} from "../controllers/implementingAgencyController";

const router = Router();

// Corporate side
router.post("/sub-logins", authenticateToken, asyncHandler(createSubLogin));
router.get("/sub-logins", authenticateToken, asyncHandler(listMySubLogins));
router.post("/assign", authenticateToken, asyncHandler(assignAgencyToProject));

// Nodal officer side
router.get("/approvals/pending", authenticateToken, asyncHandler(listPendingApprovals));
router.patch("/approvals/:id", authenticateToken, asyncHandler(decideSubLogin));

export default router;
