import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getMatches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const recalculateMatches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ message: "Matches recalculated", matches: [] });
};

export const getCompanyRecommendedRequirements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const getNGORecommendedRequirements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};
