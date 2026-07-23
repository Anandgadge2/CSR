import { Router } from "express";
import {
  getCompletedProjectsGallery,
  getCompletedProjectDetail,
  getSuccessStories,
  getPublicDirectory,
  getPublicPortalStats,
  getPublicRequirements,
} from "../controllers/publicPortalController";

const router = Router();

router.get("/completed-projects", getCompletedProjectsGallery);
router.get("/completed-projects/:id", getCompletedProjectDetail);
router.get("/success-stories", getSuccessStories);
router.get("/directory", getPublicDirectory);
router.get("/portal-stats", getPublicPortalStats);
router.get("/requirements", getPublicRequirements);

export default router;
