import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { getMyBeneficiaryProfile, upsertBeneficiaryProfile } from "../controllers/csrRequirementController";

const router = Router();

const departmentRoles = [Role.BENEFICIARY_AGENCY, Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN];

router.post("/register", authenticateToken, authorizeRoles(departmentRoles), upsertBeneficiaryProfile);
router.get("/me", authenticateToken, authorizeRoles(departmentRoles), getMyBeneficiaryProfile);

export default router;
