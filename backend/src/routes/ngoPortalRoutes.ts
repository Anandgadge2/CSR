import { Router } from "express";
import { Role } from "../types/role";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { listCsrProjects } from "../controllers/csrLifecycleController";

const router = Router();

router.use(authenticateToken, authorizeRoles([Role.NGO_ADMIN, Role.NGO_MEMBER, Role.SUPER_ADMIN]));
router.get("/proposal-requests", listCsrProjects);
router.get("/assigned-projects", listCsrProjects);

export default router;
