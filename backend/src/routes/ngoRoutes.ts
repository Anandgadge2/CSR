import { Router } from "express";
import { getNgos, getNgoById, updateNgo, verifyNgo } from "../controllers/ngoController";
import { authenticateToken, authorizeRoles, optionalAuthenticateToken } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", optionalAuthenticateToken, getNgos);
router.get("/:id", optionalAuthenticateToken, getNgoById);
router.patch("/:id", authenticateToken, updateNgo);
router.patch("/:id/verify", authenticateToken, authorizeRoles([Role.SUPER_ADMIN]), verifyNgo);

export default router;
