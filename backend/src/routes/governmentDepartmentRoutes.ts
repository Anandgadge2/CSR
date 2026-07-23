import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getMyBeneficiaryProfile, upsertBeneficiaryProfile } from "../controllers/csrRequirementController";

const router = Router();
router.use(authenticateToken);

router.get("/beneficiary-profile", getMyBeneficiaryProfile);
router.put("/beneficiary-profile", upsertBeneficiaryProfile);

export default router;
