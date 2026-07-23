import { Router } from "express";
import { getNgos, getNgoById, updateNgo } from "../controllers/ngoController";
import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", optionalAuthenticateToken, getNgos);
router.get("/:id", optionalAuthenticateToken, getNgoById);
router.patch("/:id", authenticateToken, updateNgo);

export default router;
