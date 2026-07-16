/**
 * Mounted at /api/csr-dashboard — serves role-based dashboard stats
 * for the department portal (/department/dashboard) and related views.
 */
import { Router } from "express";
import { getCSRDashboardStats } from "../controllers/csrDashboardController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/stats", authenticateToken, getCSRDashboardStats);

export default router;
