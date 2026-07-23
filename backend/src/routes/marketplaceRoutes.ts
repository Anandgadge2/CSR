import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getCSRRequirementById, getMarketplaceRequirements } from "../controllers/csrRequirementController";

const router = Router();

router.get("/", getMarketplaceRequirements);
router.get("/:id", authenticateToken, getCSRRequirementById);

export default router;
