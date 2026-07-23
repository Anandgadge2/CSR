import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getAssignedProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const updateProjectProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    next(error);
  }
};

export const submitMilestoneForVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Milestone submitted" });
  } catch (error) {
    next(error);
  }
};

export const uploadUC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "UC uploaded" });
  } catch (error) {
    next(error);
  }
};

export const createSubLogin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Sub-login created" });
  } catch (error) {
    next(error);
  }
};

export const listMySubLogins = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json([]);
  } catch (error) {
    next(error);
  }
};

export const assignAgencyToProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Agency assigned" });
  } catch (error) {
    next(error);
  }
};

export const listPendingApprovals = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json([]);
  } catch (error) {
    next(error);
  }
};

export const decideSubLogin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Decision recorded" });
  } catch (error) {
    next(error);
  }
};
