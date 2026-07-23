import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const generateAgreement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow. Use StandardMou." });
};

export const signAgreement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const getAgreement = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const listAgreements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};
