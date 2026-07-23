import { Router } from "express";
import { createReport, listReports } from "../controllers/reportController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", listReports);
router.post("/", createReport);

export default router;
