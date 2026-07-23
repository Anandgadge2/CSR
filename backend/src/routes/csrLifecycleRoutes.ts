import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getLifecycleStages, advanceLifecycleStage, createProjectInspection, listCsrProjects } from "../controllers/csrLifecycleController";

const router = Router();
router.use(authenticateToken);

router.get("/stages", getLifecycleStages);
router.post("/advance", advanceLifecycleStage);
router.post("/inspect", createProjectInspection);
router.get("/projects", listCsrProjects);

export default router;
