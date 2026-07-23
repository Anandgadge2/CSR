import { Router } from "express";
import { generateAgreement, signAgreement, getAgreement, listAgreements } from "../controllers/agreementController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticateToken, generateAgreement);
router.patch("/:id/status", authenticateToken, signAgreement);
router.get("/:id", authenticateToken, getAgreement);
router.get("/", authenticateToken, listAgreements);

export default router;
