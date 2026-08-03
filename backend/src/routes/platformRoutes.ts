import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { getPlatformFeatures, getHeroSlides, updateHeroSlides } from "../controllers/platformController";
import { asyncHandler } from "../middlewares/asyncHandler";
import { httpCache } from "../middlewares/cacheMiddleware";
import { Role } from "../types/role";

const router = Router();

router.get("/features", authenticateToken, httpCache({ ttlSeconds: 600, keyPrefix: "platform_features", userScoped: true }), getPlatformFeatures);

// Hero carousel — public GET, admin PUT
router.get("/hero-slides", httpCache({ ttlSeconds: 600, keyPrefix: "hero_slides" }), asyncHandler(getHeroSlides));
router.put(
  "/hero-slides",
  authenticateToken,
  authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN]),
  asyncHandler(updateHeroSlides)
);

export default router;
