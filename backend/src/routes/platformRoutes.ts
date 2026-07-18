import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { getPlatformFeatures, getHeroSlides, updateHeroSlides } from "../controllers/platformController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Role } from "../types/role";

const router = Router();

router.get("/features", authenticateToken, getPlatformFeatures);

// Hero carousel — public GET, admin PUT
router.get("/hero-slides", asyncHandler(getHeroSlides));
router.put(
  "/hero-slides",
  authenticateToken,
  authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN]),
  asyncHandler(updateHeroSlides)
);

export default router;
