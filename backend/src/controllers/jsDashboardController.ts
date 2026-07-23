import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getJointSecretaryDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalProjects = await prisma.project.count();
    const totalOrgs = await prisma.organization.count();
    return res.json({
      totalProjects,
      totalOrgs,
      recentProjects: await prisma.project.findMany({ take: 10, orderBy: { createdAt: "desc" } })
    });
  } catch (error) {
    next(error);
  }
};

export const getJSDashboard = getJointSecretaryDashboard;

export const getJSEscalations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const escalations = await prisma.sLAEscalation.findMany({ where: { isResolved: false } });
    return res.json(escalations);
  } catch (error) {
    next(error);
  }
};

export const handleEscalationAction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.sLAEscalation.update({
      where: { id: req.params.id },
      data: { isResolved: true, resolvedAt: new Date() }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getJSGovernmentPitches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitches = await prisma.governmentPitch.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(pitches);
  } catch (error) {
    next(error);
  }
};
