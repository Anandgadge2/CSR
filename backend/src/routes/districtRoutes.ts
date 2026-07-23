import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getMarketplaceRequirements } from "../controllers/csrRequirementController";
import { createProjectInspection, listCsrProjects } from "../controllers/csrLifecycleController";

const router = Router();
router.use(authenticateToken);

router.get("/requirements", getMarketplaceRequirements);
router.post("/inspections", createProjectInspection);
router.get("/projects", listCsrProjects);

export default router;
