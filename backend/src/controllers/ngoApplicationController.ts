import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const submitNGOApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow. Use unified project onboarding." });
};

export const getMyNGOApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const getMyApplications = getMyNGOApplications;

export const getRequirementApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const getApplicationsForRequirement = getRequirementApplications;

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const withdrawNGOApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};
