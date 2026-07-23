import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const allocateCsrFund = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Fund allocated" });
  } catch (error) {
    next(error);
  }
};

export const getCsrFundAllocations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json([]);
  } catch (error) {
    next(error);
  }
};
