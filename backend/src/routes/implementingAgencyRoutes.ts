import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  createSubLogin,
  listMySubLogins,
  assignAgencyToProject,
  listPendingApprovals,
  decideSubLogin
} from "../controllers/implementingAgencyController";

const router = Router();
router.use(authenticateToken);

router.post("/sub-logins", createSubLogin);
router.get("/sub-logins", listMySubLogins);
router.post("/assign", assignAgencyToProject);
router.get("/pending-approvals", listPendingApprovals);
router.get("/approvals/pending", listPendingApprovals);
router.post("/sub-logins/:id/decide", decideSubLogin);

export default router;
