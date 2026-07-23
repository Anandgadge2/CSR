import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalProjects = await prisma.project.count();
    const totalOrgs = await prisma.organization.count();
    const totalUsers = await prisma.user.count();

    return res.json({
      totalProjects,
      totalOrgs,
      totalUsers
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardWidgets = getDashboardSummary;
