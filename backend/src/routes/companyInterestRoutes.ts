import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { expressInterest, updateInterestStatus, getRequirementInterests, getMyCompanyInterests } from "../controllers/companyInterestController";

const router = Router();
router.use(authenticateToken);

router.post("/", expressInterest);
router.patch("/:id/status", updateInterestStatus);
router.get("/requirement/:requirementId", getRequirementInterests);
router.get("/my", getMyCompanyInterests);

export default router;
