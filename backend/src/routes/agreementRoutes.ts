import { Router } from "express";
import {
  generateAgreement,
  updateAgreementStatus,
  getAgreementsByRequirement
} from "../controllers/agreementController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticateToken, generateAgreement);
router.patch("/:id/status", authenticateToken, updateAgreementStatus);
router.get("/requirement/:requirementId", authenticateToken, getAgreementsByRequirement);

export default router;
