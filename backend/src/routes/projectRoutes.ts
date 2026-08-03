import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/projectController";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/accessControlMiddleware";

const router = Router();

router.get("/", optionalAuthenticateToken, getProjects);
router.get("/:id", optionalAuthenticateToken, getProjectById);
router.post("/", authenticateToken, requirePermission("project:create"), createProject);
router.patch("/:id", authenticateToken, requirePermission("project:update"), updateProject);
router.delete("/:id", authenticateToken, requirePermission("project:close"), deleteProject);

export default router;
