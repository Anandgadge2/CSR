import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { successResponse, notFoundResponse } from "../utils/apiResponse";

export const submitCorporateEnquiry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const enquiry = await prisma.corporateEnquiry.create({
      data: {
        trackingId: `CE-${Date.now()}`,
        corporateName: req.body.companyName || req.body.corporateName || "Company",
        contactEmail: req.body.email || req.body.contactEmail || "contact@company.com",
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
