import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const expressInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow. Use CorporateEnquiry." });
};

export const updateInterestStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const getRequirementInterests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const getMyCompanyInterests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};
