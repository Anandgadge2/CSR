import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getAssignmentContext = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, context: {} });
  } catch (error) {
    next(error);
  }
};

export const assignExistingOfficerHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Officer assigned" });
  } catch (error) {
    next(error);
  }
};

export const createAndAssignOfficerHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Officer created and assigned" });
  } catch (error) {
    next(error);
  }
};

export const searchOfficersHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const officers = await prisma.user.findMany({ where: { roleId: 4 } });
    return res.json({ success: true, officers });
  } catch (error) {
    next(error);
  }
};

export const getAssignableRolesHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.role.findMany();
    return res.json({ success: true, roles });
  } catch (error) {
    next(error);
  }
};

export const getDistrictsHandler = async (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, districts: [] });
};
