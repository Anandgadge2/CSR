import { Router } from "express";
import { z } from "zod";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validationMiddleware";
import { createDocument, listDocuments } from "../controllers/documentController";

const router = Router();

const documentSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    fileUrl: z.string().url(),
    fileType: z.string().min(1),
    expiryDate: z.string().optional(),
    ngoId: z.string().optional(),
    companyId: z.string().optional(),
    projectId: z.string().optional(),
    chatId: z.string().optional()
  })
});

router.get("/", authenticateToken, listDocuments);
router.post("/", authenticateToken, validateRequest(documentSchema), createDocument);

export default router;
