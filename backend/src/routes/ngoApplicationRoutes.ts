import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  submitNGOApplication,
  getMyApplications,
  getApplicationsForRequirement,
  updateApplicationStatus,
  withdrawNGOApplication
} from "../controllers/ngoApplicationController";

const router = Router();
router.use(authenticateToken);

router.post("/", submitNGOApplication);
router.get("/my", getMyApplications);
router.get("/requirement/:requirementId", getApplicationsForRequirement);
router.patch("/:id/status", updateApplicationStatus);
router.delete("/:id", withdrawNGOApplication);

export default router;
