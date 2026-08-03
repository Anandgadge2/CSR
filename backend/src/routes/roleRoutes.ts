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
import { checkPermission } from "../middlewares/accessControlMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

router.use(authenticateToken);

router.get("/", checkPermission("role:view"), asyncHandler(getRoles));
router.get("/permission-groups", checkPermission("role:view"), asyncHandler(getPermissionGroups));
router.get("/pages", checkPermission("role:view"), asyncHandler(getPages));
router.post("/", checkPermission("role:create"), asyncHandler(createRole));
router.get("/:id", checkPermission("role:view"), asyncHandler(getRoleById));
router.put("/:id", checkPermission("role:configure"), asyncHandler(updateRole));
router.delete("/:id", checkPermission("role:delete"), asyncHandler(deleteRole));

export default router;
