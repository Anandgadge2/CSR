import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/projectController";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", optionalAuthenticateToken, getProjects);
router.get("/:id", optionalAuthenticateToken, getProjectById);
router.post("/", authenticateToken, createProject);
router.patch("/:id", authenticateToken, updateProject);
router.delete("/:id", authenticateToken, deleteProject);

export default router;
