import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getDashboardSummary, getDashboardWidgets } from "../controllers/dashboardController";

const router = Router();
router.use(authenticateToken);

router.get("/", getDashboardSummary);
router.get("/widgets", getDashboardWidgets);

export default router;
