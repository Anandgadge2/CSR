import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { listAuditLogs } from "../controllers/auditController";

const router = Router();

router.get("/", authenticateToken, listAuditLogs);

export default router;
