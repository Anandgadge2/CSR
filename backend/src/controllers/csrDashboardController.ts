import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getCsrCompanyDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.organizationId;
    const projects = await prisma.project.findMany({
      where: orgId ? { organizationId: orgId } : {},
      take: 10
    });
    return res.json({ projects, summary: { totalProjects: projects.length } });
  } catch (error) {
    next(error);
  }
};
