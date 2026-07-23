import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const raiseGrievance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const grievance = await prisma.grievance.create({
      data: {
        grievanceCode: `GRV-${Date.now()}`,
        projectId: req.body.projectId,
        raisedByUserId: req.user!.id,
        issueTitle: req.body.issueTitle || req.body.title || "Grievance Issue",
        issueDescription: req.body.issueDescription || req.body.description || "Issue description",
        status: "RAISED"
      }
    });
    return res.status(201).json(grievance);
  } catch (error) {
    next(error);
  }
};

export const listGrievances = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const grievances = await prisma.grievance.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(grievances);
  } catch (error) {
    next(error);
  }
};

export const getGrievanceById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const grievance = await prisma.grievance.findUnique({ where: { id: req.params.id } });
    if (!grievance) return res.status(404).json({ error: "Grievance not found" });
    return res.json(grievance);
  } catch (error) {
    next(error);
  }
};

export const respondGrievance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const grievance = await prisma.grievance.update({
      where: { id: req.params.id },
      data: {
        resolutionText: req.body.resolutionText || req.body.responseText,
        status: "LEVEL_1_RESOLVED"
      }
    });
    return res.json(grievance);
  } catch (error) {
    next(error);
  }
};
