import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import {
  submitEnquiry,
  getEnquiryByTrackingId,
  getAllEnquiries,
  getEnquiryById,
  assignRM,
  recordContact
} from "../controllers/corporateEnquiryController";
import { checkPermission, checkTenantActive, resolveTenantContext } from "../middlewares/tenantMiddleware";

const router = Router();

// Public routes (no authentication required)
router.post("/", submitEnquiry);
router.get("/track/:trackingId", getEnquiryByTrackingId);

// Protected routes - RM, JS, Admin only
const requireStateCellStaff = [
  authenticateToken,
  authorizeRoles([Role.MASTER_ADMIN, Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN, Role.DISTRICT_ADMIN]),
  resolveTenantContext,
  checkTenantActive
];

// Protected routes - Admin only
const requireAdmin = [
  authenticateToken,
  authorizeRoles([Role.MASTER_ADMIN, Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN]),
  resolveTenantContext,
  checkTenantActive
];

// Protected routes - RM only
const requireRM = [
  authenticateToken,
  authorizeRoles([Role.DISTRICT_ADMIN]),
  resolveTenantContext,
  checkTenantActive
];

// Get all enquiries (RM, JS, Admin only)
router.get("/", ...requireStateCellStaff, checkPermission("enquiry:view"), getAllEnquiries);

// Get enquiry by ID (RM, JS, Admin, or assigned to user)
router.get("/:id", ...requireStateCellStaff, checkPermission("enquiry:view"), getEnquiryById);

// Assign RM to enquiry (Admin only)
router.patch("/:id/assign-rm", ...requireAdmin, checkPermission("enquiry:assign"), assignRM);

// Record RM contact (RM only)
router.post("/:id/contact", ...requireRM, checkPermission("enquiry:contact"), recordContact);

export default router;
