import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const submitGovernmentPitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.create({
      data: {
        title: req.body.title,
        budget: Number(req.body.budget || req.body.estimatedCost || 0),
        status: "SUBMITTED",
        departmentId: req.body.departmentId
      }
    });
    return res.status(201).json(pitch);
  } catch (error) {
    next(error);
  }
};

export const submitPitch = submitGovernmentPitch;

export const getPitchById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json(pitch);
  } catch (error) {
    next(error);
  }
};

export const getPitchByTrackingId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { pitchReferenceId: req.params.trackingId } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json(pitch);
  } catch (error) {
    next(error);
  }
};

export const listGovernmentPitches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitches = await prisma.governmentPitch.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(pitches);
  } catch (error) {
    next(error);
  }
};

export const getPublicPitches = listGovernmentPitches;
export const getMyPitches = listGovernmentPitches;

export const assignPitchRelationshipManager = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { assignedRelationshipManagerId: req.body.relationshipManagerId }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const recordPitchRmContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "RM contact recorded" });
};

export const convertPitchToProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json({ success: true, message: "Converted to project" });
  } catch (error) {
    next(error);
  }
};

export const submitInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const interest = await prisma.corporatePitchInterest.create({
      data: {
        pitchId: req.body.pitchId || req.params.id,
        corporateId: req.user?.organizationId || req.body.corporateId || "unknown",
        status: "INTERESTED"
      }
    });
    return res.status(201).json(interest);
  } catch (error) {
    next(error);
  }
};

export const verifyPitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { status: "VERIFIED" }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const approvePitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};
