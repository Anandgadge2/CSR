import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const initiateCompletion = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const submitFinalUC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const verifyCompletion = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const getCompletionDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};
