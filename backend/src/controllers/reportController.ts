import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const listReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        ...(req.user?.organizationId ? { entityId: req.user.organizationId } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return res.json({ success: true, data: auditLogs });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, action, details } = req.body;

    const auditLog = await prisma.auditLog.create({
      data: {
        actorUserId: req.user?.id || null,
        userId: req.user?.id || null,
        action: action || "REPORT_GENERATED",
        entityType: "REPORT",
        details: { title, ...details }
      }
    });

    return res.status(201).json({ success: true, data: auditLog });
  } catch (error) {
    next(error);
  }
};
