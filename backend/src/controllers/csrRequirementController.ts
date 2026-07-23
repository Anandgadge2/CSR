import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

const generateProjectCode = () => `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

export const createRequirement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.create({
      data: {
        projectCode: generateProjectCode(),
        title: req.body.title,
        description: req.body.description || req.body.title,
        type: "MARKETPLACE_REQUIREMENT",
        status: "SUBMITTED",
        sector: req.body.sector || "General",
        district: req.body.district || "Pune",
        taluka: req.body.taluka || "NA",
        approvedBudget: req.body.approvedBudget || 0,
        organizationId: req.user?.organizationId || req.body.organizationId
      }
    });
    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getRequirements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({ where: { type: "MARKETPLACE_REQUIREMENT" } });
    return res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getRequirementById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: "Requirement not found" });
    return res.json(project);
  } catch (error) {
    next(error);
  }
};

export const getCSRRequirementById = getRequirementById;
export const getMarketplaceRequirements = getRequirements;

export const updateRequirementStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    return res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateRequirement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { title: req.body.title, description: req.body.description }
    });
    return res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteRequirement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    return res.json({ message: "Requirement deleted" });
  } catch (error) {
    next(error);
  }
};

export const verifyRequirement = updateRequirementStatus;
export const submitRequirement = updateRequirementStatus;
export const approveRequirement = updateRequirementStatus;
export const rejectRequirement = updateRequirementStatus;
export const requestRequirementClarification = updateRequirementStatus;
export const publishRequirement = updateRequirementStatus;
export const confirmProjectHandover = updateRequirementStatus;

export const upsertBeneficiaryProfile = async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true });
};

export const getMyBeneficiaryProfile = async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true });
};

export const addRequirementDocument = async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true });
};

export const getDepartmentCompanyInterests = async (req: AuthenticatedRequest, res: Response) => {
  return res.json([]);
};
