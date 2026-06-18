import { Router } from "express";
import { z } from "zod";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { createReport, generateAnnualSummary, listReports } from "../controllers/reportController";

const router = Router();

const reportSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    type: z.enum(["CSR", "IMPACT", "BENEFICIARY", "ANNUAL"]),
    content: z.record(z.any()),
    fileUrl: z.string().url().optional()
  })
});

router.get("/", authenticateToken, listReports);
router.post("/", authenticateToken, validateRequest(reportSchema), createReport);
router.post("/annual-summary", authenticateToken, generateAnnualSummary);

export default router;
