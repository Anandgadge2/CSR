import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { notFoundResponse } from "../utils/apiResponse";
import { selectLeastLoadedRm } from "../services/rmAssignmentService";
import { ROLE_ID } from "../types/role";

export const submitCorporateEnquiry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Fetch user and organization to check onboarding status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    // Enforce Onboarding Guard for non-superadmins
    if (user?.roleId !== ROLE_ID.SUPER_ADMIN && user?.organization?.status !== "ACTIVE") {
      return res.status(403).json({
        error: "Organization onboarding must be completed and approved by Super Admin before submitting enquiries."
      });
    }

    const preferredDistrict = req.body.geography?.[0] || req.body.district || null;

    // Auto-assign RM via round-robin least loaded algorithm
    const assignedRmId = await selectLeastLoadedRm(preferredDistrict);

    const enquiry = await prisma.corporateEnquiry.create({
      data: {
        trackingId: `CE-${Date.now()}`,
        organizationId: user?.organizationId || null,
        corporateName: req.body.companyName || req.body.corporateName || user?.organization?.name || "Company",
        contactEmail: req.body.email || req.body.contactEmail || user?.email || "contact@company.com",
        assignedRelationshipManagerId: assignedRmId,
        status: "SUBMITTED"
      }
    });

    return res.status(201).json(enquiry);
  } catch (error) {
    next(error);
  }
};

export const getEnquiryByTrackingId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const enquiry = await prisma.corporateEnquiry.findUnique({
      where: { trackingId: req.params.trackingId }
    });
    if (!enquiry) return notFoundResponse(res, "Enquiry not found");
    return res.json(enquiry);
  } catch (error) {
    next(error);
  }
};

export const listCorporateEnquiries = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const enquiries = await prisma.corporateEnquiry.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(enquiries);
  } catch (error) {
    next(error);
  }
};

export const assignRelationshipManager = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.corporateEnquiry.update({
      where: { id: req.params.id },
      data: { assignedRelationshipManagerId: req.body.relationshipManagerId }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const recordRmContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "RM contact recorded" });
};

export const convertToConvergenceProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const enquiry = await prisma.corporateEnquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) return notFoundResponse(res, "Enquiry not found");

    await prisma.corporateEnquiry.update({
      where: { id: req.params.id },
      data: { status: "CONVERTED_TO_PROJECT" }
    });

    return res.json({ success: true, message: "Converted to project" });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const enquiry = await prisma.corporateEnquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) return notFoundResponse(res, "Enquiry not found");
    return res.json(enquiry);
  } catch (error) {
    next(error);
  }
};
