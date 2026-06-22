import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getMarketplaceRequirements } from "../controllers/csrRequirementController";
import { createProjectInspection, listCsrProjects } from "../controllers/csrLifecycleController";

const router = Router();

router.use(authenticateToken, authorizeRoles([Role.DISTRICT_ADMIN, Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN]));
router.use((req: AuthenticatedRequest, _res, next) => {
  if (req.user?.role === Role.DISTRICT_ADMIN && req.user.assignedDistrict && !req.query.district) {
    req.query.district = req.user.assignedDistrict;
  }
  next();
});
router.get("/requirements", getMarketplaceRequirements);
router.get("/projects", listCsrProjects);
router.post("/projects/:id/inspection", createProjectInspection);

export default router;
