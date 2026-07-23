import { Router } from "express";
import {
  getRoles,
  getRoleById,
  getPermissionGroups,
  getPages,
  createRole,
  updateRole,
  deleteRole
} from "../controllers/roleController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

router.use(authenticateToken);

router.get("/", asyncHandler(getRoles));
router.get("/permission-groups", asyncHandler(getPermissionGroups));
router.get("/pages", asyncHandler(getPages));
router.post("/", asyncHandler(createRole));
router.get("/:id", asyncHandler(getRoleById));
router.put("/:id", asyncHandler(updateRole));
router.delete("/:id", asyncHandler(deleteRole));

export default router;
