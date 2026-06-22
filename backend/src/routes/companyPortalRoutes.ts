import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { checkFeatureEnabled, checkTenantActive, resolveTenantContext } from "../middlewares/tenantMiddleware";
import { getMyInterests } from "../controllers/companyInterestController";
import { listCsrProjects } from "../controllers/csrLifecycleController";

const router = Router();

router.use(authenticateToken, authorizeRoles([Role.MASTER_ADMIN, Role.COMPANY_ADMIN, Role.COMPANY_MEMBER, Role.SUPER_ADMIN]), resolveTenantContext, checkTenantActive);
router.get("/interests", checkFeatureEnabled("enableCompanyInterest"), getMyInterests);
router.get("/projects", checkFeatureEnabled("enableCSRMarketplace"), listCsrProjects);

export default router;
