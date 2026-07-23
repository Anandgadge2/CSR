import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const listAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const take = Math.min(parseInt(req.query.limit as string) || 100, 250);
    const userId = req.query.userId as string | undefined;

    const canSeeAllLogs = Number(req.user?.roleId) === 1;

    const where = canSeeAllLogs
      ? { ...(userId ? { actorUserId: userId } : {}) }
      : { actorUserId: req.user!.id };

    const logs = await prisma.auditLog.findMany({
      where,
      include: { actorUser: { select: { id: true, email: true, roleId: true } } },
      orderBy: { createdAt: "desc" },
      take
    });

    return res.json(logs);
  } catch (error) {
    next(error);
  }
};
