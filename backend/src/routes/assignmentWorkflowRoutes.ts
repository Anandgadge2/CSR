import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { requirePermission } from "../middlewares/accessControlMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  getDncQueue,
  delegateDncProject,
  getEligibleDnos,
  getGovAdminQueue,
  delegateGovOfficerProject,
  getEligibleGovOfficers,
  executeJsApproval,
  reassignRelationshipManager,
} from "../controllers/assignmentWorkflowController";

const router = Router();

router.use(authenticateToken);

// DNC Delegation Queue
router.get("/dnc/queue", requirePermission("project:view"), asyncHandler(getDncQueue));
router.post("/dnc/delegate", requirePermission("project:assign"), asyncHandler(delegateDncProject));
router.get("/dnc/eligible-dnos", requirePermission("project:view"), asyncHandler(getEligibleDnos));

// Government Org Admin Queue
router.get("/gov-admin/queue", requirePermission("project:view"), asyncHandler(getGovAdminQueue));
router.post("/gov-admin/delegate", requirePermission("project:assign"), asyncHandler(delegateGovOfficerProject));
router.get("/gov-admin/eligible-officers", requirePermission("project:view"), asyncHandler(getEligibleGovOfficers));

// JS Approval Workflow (Atomic single-transaction execution)
router.post("/js-approve/:projectId", requirePermission("project:approve"), asyncHandler(executeJsApproval));

// RM Reassignment
router.post("/rm/reassign", requirePermission("pitch:assign"), asyncHandler(reassignRelationshipManager));

export default router;
