import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getAssignedProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const updateProjectProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Progress updated" });
  } catch (error) {
    next(error);
  }
};

export const submitMilestoneForVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Milestone submitted" });
  } catch (error) {
    next(error);
  }
};

export const uploadUC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "UC uploaded" });
  } catch (error) {
    next(error);
  }
};

export const createSubLogin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userRoleId = req.user?.roleId ? Number(req.user.roleId) : null;
    const organizationId = req.user?.organizationId;

    // Sub-logins can only be created by Company Admin (roleId 8) or Super Admin (roleId 1)
    if (userRoleId !== 8 && userRoleId !== 1) {
      return res.status(403).json({
        error: "Agency sub-logins can only be created by Corporate Company Administrators."
      });
    }

    if (!organizationId) {
      return res.status(400).json({ error: "Corporate organization profile is required to authorize agency sub-logins." });
    }

    const { ngoName, darpanId, email, contactPerson, phone, assignedProjectId } = req.body;
    if (!ngoName || !email) {
      return res.status(400).json({ error: "NGO Name and Official Email are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.agencySubLogin.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ error: "An agency sub-login with this email is already authorized." });
    }

    const subLogin = await prisma.agencySubLogin.create({
      data: {
        organizationId,
        ngoName: ngoName.trim(),
        darpanId: darpanId ? darpanId.trim() : null,
        email: normalizedEmail,
        contactPerson: contactPerson ? contactPerson.trim() : null,
        phone: phone ? phone.trim() : null,
        assignedProjectId: assignedProjectId || null,
        status: "ACTIVE"
      },
      include: {
        assignedProject: { select: { id: true, title: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Implementing Agency sub-login authorized successfully.",
      data: subLogin
    });
  } catch (error) {
    next(error);
  }
};

export const listMySubLogins = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.json([]);
    }

    const subLogins = await prisma.agencySubLogin.findMany({
      where: { organizationId },
      include: {
        assignedProject: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(subLogins);
  } catch (error) {
    next(error);
  }
};

export const assignAgencyToProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Agency assigned" });
  } catch (error) {
    next(error);
  }
};

export const listPendingApprovals = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json([]);
  } catch (error) {
    next(error);
  }
};

export const decideSubLogin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Decision recorded" });
  } catch (error) {
    next(error);
  }
};
