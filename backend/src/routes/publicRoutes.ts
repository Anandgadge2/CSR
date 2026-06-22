import { Router } from "express";
import { getMarketplaceRequirements } from "../controllers/csrRequirementController";
import { getGovernmentReport } from "../controllers/reportController";
import { checkPublicFeatureEnabled } from "../middlewares/tenantMiddleware";

const router = Router();

router.get("/requirements", checkPublicFeatureEnabled("enablePublicTransparency"), checkPublicFeatureEnabled("enableCSRMarketplace"), getMarketplaceRequirements);
router.get("/projects", checkPublicFeatureEnabled("enablePublicTransparency"), checkPublicFeatureEnabled("enableCSRMarketplace"), getMarketplaceRequirements);
router.get("/reports/transparency-dashboard", checkPublicFeatureEnabled("enablePublicTransparency"), getGovernmentReport);
router.get("/reports/district-ranking", checkPublicFeatureEnabled("enablePublicTransparency"), getGovernmentReport);
router.get("/reports/top-contributors", checkPublicFeatureEnabled("enablePublicTransparency"), getGovernmentReport);
router.get("/reports/success-stories", checkPublicFeatureEnabled("enablePublicTransparency"), getGovernmentReport);

export default router;
