import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { checkPermission } from "../middlewares/accessControlMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  getAssignmentContext,
  searchOfficersHandler,
  getAssignableRolesHandler,
  createAssignment,
  createOfficerAndAssign,
  getMyAssignments,
  getWorkflowStatus,
  createDistrictNodalMapping,
  listDistrictsHandler,
  listNodalConsultantsHandler,
  appointNodalConsultantHandler
} from "../controllers/assignmentController";

const router = Router();

// All assignment routes require authentication;
// authorization is permission-based (dynamic RBAC), never hardcoded roles.
router.use(authenticateToken);

// Assignment page context (entity summary + workflow stage + assignments)
router.get(
  "/context/:entityType/:entityId",
  checkPermission("project:assign"),
  asyncHandler(getAssignmentContext)
);

// Option A support — search existing officers
router.get(
  "/officers/search",
  checkPermission("officer:search"),
  asyncHandler(searchOfficersHandler)
);

// Dynamic role dropdown for Option B
router.get(
  "/roles",
  checkPermission("role:assignable_list"),
  asyncHandler(getAssignableRolesHandler)
);

// Option A — assign existing officer
router.post(
  "/",
  checkPermission("project:assign"),
  asyncHandler(createAssignment)
);

// Option B — create new officer + assign + invite
router.post(
  "/officers",
  checkPermission("officer:create"),
  asyncHandler(createOfficerAndAssign)
);

// Logged-in user's own assignments (any authenticated user)
router.get("/mine", asyncHandler(getMyAssignments));

// Workflow stage + history timeline
router.get(
  "/status/:entityType/:entityId",
  checkPermission("workflow:view"),
  asyncHandler(getWorkflowStatus)
);

// Admin: map nodal officer to district (auto-resumes parked workflows)
router.post(
  "/district-nodal-mappings",
  checkPermission("district_mapping:manage"),
  asyncHandler(createDistrictNodalMapping)
);

// JS appointment cascade: list districts → list DNCs for a district → appoint
router.get(
  "/districts",
  checkPermission("project:assign"),
  asyncHandler(listDistrictsHandler)
);

router.get(
  "/nodal-consultants",
  checkPermission("project:assign"),
  asyncHandler(listNodalConsultantsHandler)
);

router.post(
  "/appoint-nodal-consultant",
  checkPermission("project:assign"),
  asyncHandler(appointNodalConsultantHandler)
);

export default router;
