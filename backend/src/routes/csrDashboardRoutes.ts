import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getCsrCompanyDashboard } from "../controllers/csrDashboardController";

import { httpCache } from "../middlewares/cacheMiddleware";

const router = Router();
router.use(authenticateToken);

router.get("/", httpCache({ ttlSeconds: 120, userScoped: true, keyPrefix: "csr_company_dashboard" }), getCsrCompanyDashboard);

export default router;
