import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { auditLog } from "../services/notificationService";

export const getRMOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const [assignedEnquiries, assignedPitches] = await Promise.all([
      prisma.corporateEnquiry.count({ where: { assignedRelationshipManagerId: userId } }),
      prisma.governmentPitch.count({ where: { assignedRelationshipManagerId: userId } })
    ]);

    return res.json({
      success: true,
      data: {
        assignedEnquiries,
        assignedPitches,
        activeWorkload: assignedEnquiries + assignedPitches
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listRMEnquiries = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const enquiries = await prisma.corporateEnquiry.findMany({
      where: { assignedRelationshipManagerId: userId },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ success: true, data: enquiries });
  } catch (error) {
    next(error);
  }
};

export const getRMEnquiryById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const enquiry = await prisma.corporateEnquiry.findUnique({ where: { id } });
    if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });
    return res.json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

export const listRMPitches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const pitches = await prisma.governmentPitch.findMany({
      where: { assignedRelationshipManagerId: userId },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ success: true, data: pitches });
  } catch (error) {
    next(error);
  }
};

export const getRMPitchById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pitch = await prisma.governmentPitch.findUnique({ where: { id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json({ success: true, data: pitch });
  } catch (error) {
    next(error);
  }
};

export const getRMEscalations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const escalations = await prisma.sLAEscalation.findMany({
      where: { responsibleUserId: userId, isResolved: false },
      orderBy: { dueDate: "asc" }
    });
    return res.json({ success: true, data: escalations });
  } catch (error) {
    next(error);
  }
};

export const getCorporateInterests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const interests = await prisma.corporatePitchInterest.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.json({ success: true, data: interests });
  } catch (error) {
    next(error);
  }
};

export const updateCorporateInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const interest = await prisma.corporatePitchInterest.update({
      where: { id },
      data: { ...(status ? { status } : {}) }
    });

    await auditLog(userId, "CORPORATE_INTEREST_UPDATED", { interestId: id, status });
    return res.json({ success: true, data: interest });
  } catch (error) {
    next(error);
  }
};

export const verifyGovernmentPitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const pitch = await prisma.governmentPitch.update({
      where: { id },
      data: { status: status || "APPROVED" }
    });

    await auditLog(userId, "GOVERNMENT_PITCH_VERIFIED", { pitchId: id, status });
    return res.json({ success: true, data: pitch });
  } catch (error) {
    next(error);
  }
};

export const getRMAssessments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

export const logEnquiryInteraction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { note } = req.body;

    await auditLog(userId, "ENQUIRY_INTERACTION_LOGGED", { enquiryId: id, note });
    return res.json({ success: true, message: "Interaction logged successfully" });
  } catch (error) {
    next(error);
  }
};

export const submitFeasibilityAssessment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await auditLog(userId, "FEASIBILITY_ASSESSMENT_SUBMITTED", { enquiryId: id });
    return res.json({ success: true, message: "Feasibility assessment submitted" });
  } catch (error) {
    next(error);
  }
};

export const getFeasibilityAssessmentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
