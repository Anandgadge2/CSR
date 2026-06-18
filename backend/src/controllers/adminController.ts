import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

export const getAdminOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [
      users,
      pendingNgos,
      pendingCompanies,
      submittedProjects,
      auditLogs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.nGO.count({ where: { status: "PENDING" } }),
      prisma.company.count({ where: { status: "PENDING" } }),
      prisma.project.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.auditLog.count()
    ]);

    return res.json({ users, pendingNgos, pendingCompanies, submittedProjects, auditLogs });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        ngoId: true,
        companyId: true,
        createdAt: true,
        ngo: { select: { name: true, status: true } },
        company: { select: { name: true, status: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 250
    });

    return res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: "ADMIN_USER_ROLE_UPDATE",
        details: { targetUserId: req.params.id, role }
      }
    });

    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
};
