import { Router } from "express";
import { Role } from "../types/role";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import {
  submitEnquiry,
  getEnquiryByTrackingId,
  getAllEnquiries,
  getEnquiryById,
  getMyEnquiries,
  assignRM,
  recordContact,
  getRelationshipManagers
} from "../controllers/corporateEnquiryController";
import { checkPermission, requireApprovedOrganization } from "../middlewares/accessControlMiddleware";
import { OrganizationKind } from "@prisma/client";

const router = Router();

// Corporate enquiry creation — authenticated + verified CSR_COMPANY onboarding only.
// (Public anonymous creation removed; tracking-by-ID stays public read-only.)
router.post(
  "/",
  authenticateToken,
  requireApprovedOrganization(OrganizationKind.CSR_COMPANY),
  submitEnquiry
);
router.get("/track/:trackingId", getEnquiryByTrackingId);

// Corporate — list my organization's enquiries (dashboard)
router.get("/my", authenticateToken, requireApprovedOrganization(OrganizationKind.CSR_COMPANY), getMyEnquiries);

// Protected routes - RM, JS, Admin only
const requireStateCellStaff = [
  authenticateToken,
  authorizeRoles([
    Role.SUPER_ADMIN,
    Role.PORTAL_ADMIN,
    Role.CSR_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.CSR_RELATIONSHIP_MANAGER,
    Role.JOINT_SECRETARY,
    Role.STATE_CSR_CELL,
    Role.PLANNING_SECRETARY
  ])
];

// Protected routes - Admin & assigners only
const requireAdmin = [
  authenticateToken,
  authorizeRoles([
    Role.SUPER_ADMIN,
    Role.PORTAL_ADMIN,
    Role.CSR_ADMIN,
    Role.STATE_CSR_CELL,
    Role.JOINT_SECRETARY,
    Role.CSR_RELATIONSHIP_MANAGER
  ])
];

// Protected routes - RM only
const requireRM = [
  authenticateToken,
  authorizeRoles([
    Role.CSR_RELATIONSHIP_MANAGER,
    Role.DISTRICT_ADMIN,
    Role.SUPER_ADMIN,
    Role.PORTAL_ADMIN
  ])
];

// Get all enquiries (RM, JS, Admin only)
router.get("/", ...requireStateCellStaff, checkPermission("enquiry:view"), getAllEnquiries);

// Get list of Relationship Managers (JS, Admin, State Cell only)
router.get("/relationship-managers", ...requireStateCellStaff, checkPermission("enquiry:assign"), getRelationshipManagers);

// Get enquiry by ID (RM, JS, Admin, or assigned to user)
router.get("/:id", ...requireStateCellStaff, checkPermission("enquiry:view"), getEnquiryById);

// Assign RM to enquiry (Admin only)
router.patch("/:id/assign-rm", ...requireAdmin, checkPermission("enquiry:assign"), assignRM);

// Record RM contact (RM only)
router.post("/:id/contact", ...requireRM, checkPermission("enquiry:contact"), recordContact);

export default router;
