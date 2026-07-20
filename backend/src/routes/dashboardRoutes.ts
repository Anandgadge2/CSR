/**
 * Unified dashboard routes — mounted at /api/dashboard.
 *
 * The summary endpoint powers the single permission-driven Dashboard Engine.
 * It is available to any authenticated user; the response only contains the
 * blocks the caller's `dashboard:*` permissions unlock (fail-closed inside the
 * controller), so no coarse role gate is applied here.
 */
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getDashboardSummary } from "../controllers/dashboardController";

const router = Router();

router.get("/summary", authenticateToken, getDashboardSummary);

export default router;
