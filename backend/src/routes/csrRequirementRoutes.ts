import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  verifyRequirement,
  submitRequirement,
  approveRequirement,
  rejectRequirement,
  requestRequirementClarification,
  publishRequirement,
  upsertBeneficiaryProfile,
  getMyBeneficiaryProfile,
  addRequirementDocument,
  confirmProjectHandover,
  getDepartmentCompanyInterests
} from "../controllers/csrRequirementController";

const router = Router();
router.use(authenticateToken);

router.post("/", createRequirement);
router.get("/", getRequirements);
router.get("/:id", getRequirementById);
router.put("/:id", updateRequirement);
router.delete("/:id", deleteRequirement);
router.post("/:id/verify", verifyRequirement);
router.post("/:id/submit", submitRequirement);
router.post("/:id/approve", approveRequirement);
router.post("/:id/reject", rejectRequirement);
router.post("/:id/clarification", requestRequirementClarification);
router.post("/:id/publish", publishRequirement);
router.put("/beneficiary-profile", upsertBeneficiaryProfile);
router.get("/beneficiary-profile/me", getMyBeneficiaryProfile);
router.post("/:id/documents", addRequirementDocument);
router.post("/:id/handover", confirmProjectHandover);
router.get("/:id/company-interests", getDepartmentCompanyInterests);

export default router;
