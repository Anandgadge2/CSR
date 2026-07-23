import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { successResponse, notFoundResponse } from "../utils/apiResponse";

const generateProjectCode = () => `PRJ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

export const createConvergenceProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.create({
      data: {
        projectCode: generateProjectCode(),
        title: req.body.title,
        description: req.body.description || req.body.title,
        type: "CONVERGENCE_FRAMEWORK",
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

export const getConvergenceProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: { type: "CONVERGENCE_FRAMEWORK" },
      orderBy: { createdAt: "desc" }
    });
    return res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getConvergenceProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { milestones: true, utilizationCertificates: true, documents: true }
    });
    if (!project) return notFoundResponse(res, "Project not found");
    return res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateConvergenceProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        description: req.body.description,
        sector: req.body.sector,
        district: req.body.district
      }
    });
    return res.json(project);
  } catch (error) {
    next(error);
  }
};

export const listProjectsForNodalOfficer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return successResponse(res, projects, "Projects retrieved");
  } catch (error) {
    next(error);
  }
};

export const listProjectsForImplementingAgency = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return successResponse(res, projects, "Projects retrieved");
  } catch (error) {
    next(error);
  }
};

export const defineMilestones = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Milestones defined" });
};

export const updateMilestoneProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Progress updated" });
};

export const verifyMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Milestone verified" });
};

export const uploadUC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "UC uploaded" });
};

export const verifyUC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "UC verified" });
};

export const raiseGrievance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Grievance raised" });
};

export const getProjectGrievances = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const grievances = await prisma.grievance.findMany({ where: { projectId: req.params.id } });
    return res.json(grievances);
  } catch (error) {
    next(error);
  }
};
