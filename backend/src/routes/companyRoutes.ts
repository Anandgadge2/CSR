import { Router } from "express";
import { getCompanies, getCompanyById, updateCompany } from "../controllers/companyController";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", optionalAuthenticateToken, getCompanies);
router.get("/:id", optionalAuthenticateToken, getCompanyById);
router.patch("/:id", authenticateToken, updateCompany);

export default router;
