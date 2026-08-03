import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/accessControlMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  getOverview,
  getRoles,
  createRole,
  getRoleById,
  patchRole,
  cloneRole,
  activateRole,
  deactivateRole,
  deleteRole,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  getImpactPreview,
  getAssignments,
  createAssignment,
  patchAssignment,
  deleteAssignment,
  getUserEffectiveAccess,
  getAuditLogs
} from "../controllers/accessControlController";

const router = Router();

router.use(authenticateToken);

// Overview & Roles
router.get("/overview", requirePermission("role:view"), asyncHandler(getOverview));
router.get("/roles", requirePermission("role:view"), asyncHandler(getRoles));
router.post("/roles", requirePermission("role:create"), asyncHandler(createRole));
router.get("/roles/:id", requirePermission("role:view"), asyncHandler(getRoleById));
router.patch("/roles/:id", requirePermission("role:configure"), asyncHandler(patchRole));
router.post("/roles/:id/clone", requirePermission("role:create"), asyncHandler(cloneRole));
router.post("/roles/:id/activate", requirePermission("role:configure"), asyncHandler(activateRole));
router.post("/roles/:id/deactivate", requirePermission("role:configure"), asyncHandler(deactivateRole));
router.delete("/roles/:id", requirePermission("role:delete"), asyncHandler(deleteRole));

// Permissions Catalog & Matrix
router.get("/permissions", requirePermission("role:view"), asyncHandler(getPermissions));
router.get("/roles/:id/permissions", requirePermission("role:view"), asyncHandler(getRolePermissions));
router.put("/roles/:id/permissions", requirePermission("role:configure"), asyncHandler(updateRolePermissions));
router.post("/roles/:id/impact-preview", requirePermission("role:view"), asyncHandler(getImpactPreview));

// Canonical Role Assignments
router.get("/assignments", requirePermission("user:view"), asyncHandler(getAssignments));
router.post("/assignments", requirePermission("user:assign-role"), asyncHandler(createAssignment));
router.patch("/assignments/:id", requirePermission("user:assign-role"), asyncHandler(patchAssignment));
router.delete("/assignments/:id", requirePermission("user:assign-role"), asyncHandler(deleteAssignment));

// Effective Access & Audit
router.get("/users/:id/effective-access", requirePermission("user:view"), asyncHandler(getUserEffectiveAccess));
router.get("/audit", requirePermission("user:view"), asyncHandler(getAuditLogs));

export default router;
