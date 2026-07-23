import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const inviteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Invitation sent" });
};

export const getInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true });
};

export const acceptInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Invitation accepted" });
};
