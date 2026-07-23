import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getOrCreateChat = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(501).json({ message: "Deprecated flow." });
};

export const getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};

export const getUserChats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json([]);
};
