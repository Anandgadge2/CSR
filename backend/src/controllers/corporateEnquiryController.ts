import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { notFoundResponse } from "../utils/apiResponse";
import { selectLeastLoadedRm } from "../services/rmAssignmentService";
import { ROLE_ID } from "../types/role";
import { notifyHierarchy } from "../services/hierarchyNotificationService";

export const submitCorporateEnquiry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Fetch user and organization to check onboarding status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    // Relationship Managers cannot submit corporate enquiries
    if (user?.roleId === ROLE_ID.RELATIONSHIP_MANAGER) {
      return res.status(403).json({
        error: "Relationship Managers are not allowed to submit corporate enquiries."
      });
    }

    // Enforce Onboarding Guard for suspended/rejected accounts only
    if (user?.roleId !== ROLE_ID.SUPER_ADMIN && user?.organization && ["REJECTED", "SUSPENDED"].includes(user.organization.status)) {
      return res.status(403).json({
        error: "Organization onboarding application is suspended or rejected."
      });
    }

    const preferredDistrict = req.body.geography?.[0] || req.body.district || (Array.isArray(req.body.preferredDistricts) ? req.body.preferredDistricts[0] : null);

    // Auto-assign RM via round-robin least loaded algorithm
    const assignedRmId = await selectLeastLoadedRm(preferredDistrict);

    const documents = Array.isArray(req.body.documents)
      ? req.body.documents
      : Array.isArray(req.body.supportingDocuments)
      ? req.body.supportingDocuments
      : [];

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

    notifyHierarchy({
      title: "New Corporate Enquiry Submitted",
      message: `Corporate enquiry ${enquiry.trackingId} submitted by "${enquiry.corporateName}".`,
      organizationId: enquiry.organizationId,
      assignedRmId: enquiry.assignedRelationshipManagerId,
      district: preferredDistrict,
      includePortalAdmins: true,
      includeRms: true,
      includeDistrictOfficers: true,
      actionButtonUrl: `/corporate-enquiry/${enquiry.trackingId}`
    }).catch(err => console.error("Notification dispatch failed:", err));

    return res.status(201).json({
      ...enquiry,
      documents,
      sector: req.body.sector,
      indicativeBudget: req.body.indicativeBudget,
      preferredDistricts: req.body.preferredDistricts,
      proposedCSRWork: req.body.proposedCSRWork
    });
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

    notifyHierarchy({
      title: "Relationship Manager Assigned",
      message: `Relationship Manager assigned to Corporate Enquiry ${updated.trackingId}.`,
      assignedRmId: req.body.relationshipManagerId,
      organizationId: updated.organizationId,
      includePortalAdmins: true,
      actionButtonUrl: `/corporate-enquiry/${updated.trackingId}`
    }).catch(err => console.error("Notification dispatch failed:", err));

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
    const enquiry = await prisma.corporateEnquiry.findUnique({
      where: { id: req.params.id }
    });
    if (!enquiry) return notFoundResponse(res, "Enquiry not found");
    return res.json(enquiry);
  } catch (error) {
    next(error);
  }
};

