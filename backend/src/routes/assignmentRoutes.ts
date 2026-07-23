import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { checkPermission } from "../middlewares/accessControlMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  getAssignmentContext,
  searchOfficersHandler,
  getAssignableRolesHandler,
  assignExistingOfficerHandler,
  createAndAssignOfficerHandler,
  getDistrictsHandler
} from "../controllers/assignmentController";

const router = Router();
router.use(authenticateToken);

router.get("/context/:entityType/:entityId", checkPermission("project:assign"), asyncHandler(getAssignmentContext));
router.get("/officers/search", checkPermission("officer:search"), asyncHandler(searchOfficersHandler));
router.get("/roles", checkPermission("role:assignable_list"), asyncHandler(getAssignableRolesHandler));
router.post("/", checkPermission("project:assign"), asyncHandler(assignExistingOfficerHandler));
router.post("/officers", checkPermission("officer:create"), asyncHandler(createAndAssignOfficerHandler));
router.get("/mine", asyncHandler(getAssignmentContext));
router.get("/status/:entityType/:entityId", checkPermission("workflow:view"), asyncHandler(getAssignmentContext));
router.post("/district-nodal-mappings", checkPermission("district_mapping:manage"), asyncHandler(assignExistingOfficerHandler));
router.get("/districts", checkPermission("project:assign"), asyncHandler(getDistrictsHandler));
router.get("/nodal-consultants", checkPermission("project:assign"), asyncHandler(searchOfficersHandler));
router.post("/appoint-nodal-consultant", checkPermission("project:assign"), asyncHandler(assignExistingOfficerHandler));

export default router;
