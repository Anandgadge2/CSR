import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  submitCorporateEnquiry,
  getEnquiryByTrackingId,
  listCorporateEnquiries,
  assignRelationshipManager,
  recordRmContact,
  convertToConvergenceProject,
  getEnquiryById
} from "../controllers/corporateEnquiryController";

const router = Router();

router.post("/", submitCorporateEnquiry);
router.get("/tracking/:trackingId", getEnquiryByTrackingId);
router.get("/", authenticateToken, listCorporateEnquiries);
router.post("/:id/assign-rm", authenticateToken, assignRelationshipManager);
router.post("/:id/record-contact", authenticateToken, recordRmContact);
router.post("/:id/convert", authenticateToken, convertToConvergenceProject);
router.get("/:id", authenticateToken, getEnquiryById);

export default router;
