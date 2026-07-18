import { Router } from "express";
import { getCompanies, getCompanyById, updateCompany, verifyCompany } from "../controllers/companyController";
import { authenticateToken, authorizeRoles, optionalAuthenticateToken } from "../middlewares/authMiddleware";
import { Role } from "../types/role";

const router = Router();

router.get("/", optionalAuthenticateToken, getCompanies);
router.get("/:id", optionalAuthenticateToken, getCompanyById);
router.patch("/:id", authenticateToken, updateCompany);
router.patch("/:id/verify", authenticateToken, authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN]), verifyCompany);

export default router;
