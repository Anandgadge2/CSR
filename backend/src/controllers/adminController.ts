import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ROLE_ID } from "../types/role";

export const getAdminOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const where = {};
    const [
      users,
      pendingNgos,
      pendingCompanies,
      submittedProjects,
      auditLogs
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.organization.count({ where: { kind: "NGO" } }),
      prisma.organization.count({ where: { kind: "CSR_COMPANY" } }),
      prisma.project.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.auditLog.count({ where })
    ]);

    return res.json({ users, pendingNgos, pendingCompanies, submittedProjects, auditLogs });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";

    const where: any = { deletedAt: null };
    if (search) {
      where.email = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.accountStatus = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          organizationId: true,
          email: true,
          accountStatus: true,
          isVerified: true,
          createdAt: true,
          roleId: true,
          role: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true, kind: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, roleId: inputRoleId, accountStatus = "ACTIVE" } = req.body;
    const roleId = typeof inputRoleId === "number" ? inputRoleId : parseInt(inputRoleId, 10);

    const normalizedEmail = String(email).toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return res.status(409).json({ error: "Email already registered" });

    const useInvitation = !password;
    const passwordHash = await bcrypt.hash(
      useInvitation ? crypto.randomBytes(32).toString("hex") : password,
      10
    );

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        roleId: roleId || ROLE_ID.SUPER_ADMIN,
        accountStatus: useInvitation ? "PENDING_ACTIVATION" : (accountStatus as any),
        isVerified: !useInvitation,
      },
      select: {
        id: true,
        email: true,
        roleId: true,
        accountStatus: true,
        isVerified: true,
        createdAt: true
      }
    });

    return res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { accountStatus, roleId } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(accountStatus ? { accountStatus } : {}),
        ...(roleId ? { roleId: Number(roleId) } : {})
      },
      select: {
        id: true,
        email: true,
        roleId: true,
        accountStatus: true,
        updatedAt: true
      }
    });

    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id },
      data: {
        accountStatus: "DELETED",
        deletedAt: new Date(),
        deletedById: req.user?.id || null
      }
    });

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
