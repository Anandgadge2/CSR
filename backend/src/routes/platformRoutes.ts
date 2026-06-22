import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { checkTenantActive, resolveTenantContext } from "../middlewares/tenantMiddleware";
import { getMyTenantFeatures } from "../controllers/platformController";

const router = Router();

router.get("/features", authenticateToken, resolveTenantContext, checkTenantActive, getMyTenantFeatures);

export default router;
