import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const submitProgressReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { milestoneId } = req.body;
    const milestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status: "IN_PROGRESS" as any }
    });
    return res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    next(error);
  }
};

export const verifyProgressReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { milestoneId } = req.params;
    const milestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status: "COMPLETED" as any }
    });
    return res.json({ success: true, data: milestone });
  } catch (error) {
    next(error);
  }
};

export const getProgressReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" }
    });
    return res.json({ success: true, data: milestones });
  } catch (error) {
    next(error);
  }
};
