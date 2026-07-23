import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getLifecycleStages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const advanceLifecycleStage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Advanced to next stage" });
};

export const createProjectInspection = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Inspection created" });
};

export const listCsrProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};
