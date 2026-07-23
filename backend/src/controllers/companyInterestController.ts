import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const listCompanyInterests = async (_req: AuthenticatedRequest, res: Response) => {
  return res.json([]);
};

export const expressInterest = async (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ message: "Deprecated flow. Use CorporateEnquiry." });
};

export const updateInterestStatus = async (_req: AuthenticatedRequest, res: Response) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const getRequirementInterests = async (_req: AuthenticatedRequest, res: Response) => {
  return res.json([]);
};

export const getMyCompanyInterests = async (_req: AuthenticatedRequest, res: Response) => {
  return res.json([]);
};
