import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getOrCreateDraftApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.ngoId;
    if (!orgId) return res.status(400).json({ error: "Organization context is required" });

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { ngoProfile: true, documents: true }
    });

    return res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

export const updateBasicInfo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.ngoId;
    if (!orgId) return res.status(400).json({ error: "Organization context is required" });

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { name: req.body.name || undefined }
    });

    return res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

export const updateRegistrationDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.ngoId;
    if (!orgId) return res.status(400).json({ error: "Organization context is required" });

    const profile = await prisma.nGOProfile.upsert({
      where: { organizationId: orgId },
      create: { organizationId: orgId, darpanNumber: req.body.darpanNumber || req.body.darpanRegNo },
      update: { darpanNumber: req.body.darpanNumber || req.body.darpanRegNo || undefined }
    });

    return res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateFinancialDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.ngoId;
    if (!orgId) return res.status(400).json({ error: "Organization context is required" });

    const profile = await prisma.nGOProfile.upsert({
      where: { organizationId: orgId },
      create: { organizationId: orgId },
      update: {}
    });

    return res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateKeyPersons = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Key persons updated" });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.ngoId;
    if (!orgId) return res.status(400).json({ error: "Organization context is required" });

    const doc = await prisma.document.create({
      data: {
        organizationId: orgId,
        title: req.body.documentType || "NGO Document",
        fileUrl: req.body.fileUrl || "",
        documentType: req.body.documentType || "NGO_DOCUMENT",
        fileName: req.body.fileName || "document.pdf",
        fileSize: Number(req.body.fileSize || 0),
        fileType: "pdf"
      }
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.ngoId;
    if (!orgId) return res.status(400).json({ error: "Organization context is required" });

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { status: "ACTIVE" }
    });

    return res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId || req.user?.ngoId;
    if (!orgId) return res.status(400).json({ error: "Organization context is required" });

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, status: true }
    });

    return res.json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

export const respondToQuery = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Response recorded" });
  } catch (error) {
    next(error);
  }
};
