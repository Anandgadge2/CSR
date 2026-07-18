import { Router } from "express";
import { getMarketplaceRequirements } from "../controllers/csrRequirementController";
import { getGovernmentReport } from "../controllers/reportController";
import {
  getCompletedProjectsGallery,
  getCompletedProjectDetail,
  getSuccessStories,
  getPublicDirectory,
  getPublicPortalStats,
} from "../controllers/publicPortalController";

const router = Router();

// ── Static Part (client-mandated public sections, always available) ──
router.get("/completed-projects", getCompletedProjectsGallery);
router.get("/completed-projects/:id", getCompletedProjectDetail);
router.get("/success-stories", getSuccessStories);
router.get("/directory", getPublicDirectory);
router.get("/portal-stats", getPublicPortalStats);

router.get("/requirements", getMarketplaceRequirements);
router.get("/projects", getMarketplaceRequirements);
router.get("/reports/transparency-dashboard", getGovernmentReport);
router.get("/reports/district-ranking", getGovernmentReport);
router.get("/reports/top-contributors", getGovernmentReport);
router.get("/reports/success-stories", getGovernmentReport);

export default router;
