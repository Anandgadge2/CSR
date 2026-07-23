import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getCsrCompanyDashboard } from "../controllers/csrDashboardController";

const router = Router();
router.use(authenticateToken);

router.get("/", getCsrCompanyDashboard);

export default router;
