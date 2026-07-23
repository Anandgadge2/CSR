import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const inviteNgo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const bulkInviteNgos = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const listCompanyInvitations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const cancelInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const getInvitationByToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const respondToInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const listNgoInvitations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};
