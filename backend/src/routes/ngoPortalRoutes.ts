import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { listCsrProjects } from "../controllers/csrLifecycleController";

const router = Router();
router.use(authenticateToken);

router.get("/projects", listCsrProjects);

export default router;
