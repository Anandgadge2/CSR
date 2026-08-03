import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ROLE_ID } from "../types/role";
import { createInvitation } from "../services/invitationService";

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

    if (![ROLE_ID.COMPANY_ADMIN, ROLE_ID.NGO_ADMIN, ROLE_ID.SUPER_ADMIN].includes(userRoleId as any)) {
      return res.status(403).json({
        error: "Only a Company Admin or NGO Admin can create a sub-login."
      });
    }

    const creatorOrganization = await prisma.organization.findUnique({ where: { id: organizationId || "__none__" }, select: { id: true, kind: true, status: true } });
    if (!creatorOrganization || creatorOrganization.status !== "ACTIVE") {
      return res.status(403).json({ error: "Your organization must be Super-Admin approved before it can create sub-logins." });
    }

    const { ngoName, darpanId, email, contactPerson, phone, assignedProjectId, agencyOrganizationId } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Official email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (userRoleId === ROLE_ID.NGO_ADMIN) {
      if (creatorOrganization.kind !== "NGO") return res.status(403).json({ error: "NGO Admin can only create internal NGO staff logins." });
      const invitation = await createInvitation({ email: normalizedEmail, roleId: ROLE_ID.NGO_ADMIN, organizationId: creatorOrganization.id, parentUserId: req.user!.id });
      return res.status(201).json({ success: true, message: "NGO staff invitation created. The account becomes active after acceptance.", data: { invitationId: invitation.invitation.id, email: normalizedEmail, activationUrl: invitation.activationUrl } });
    }

    if (creatorOrganization.kind !== "CSR_COMPANY" && userRoleId !== ROLE_ID.SUPER_ADMIN) return res.status(403).json({ error: "Only a Company Admin can create an NGO / Implementing Agency project login." });
    if (!agencyOrganizationId || !assignedProjectId) return res.status(400).json({ error: "Select the Super-Admin-approved NGO and the assigned project." });
    const [agency, project, existing] = await Promise.all([
      prisma.organization.findFirst({ where: { id: agencyOrganizationId, kind: "NGO", status: "ACTIVE" }, select: { id: true, name: true, ngoProfile: { select: { darpanNumber: true } } } }),
      prisma.project.findFirst({ where: { id: assignedProjectId, corporatePartnerId: creatorOrganization.id }, select: { id: true } }),
      prisma.agencySubLogin.findUnique({ where: { email: normalizedEmail } })
    ]);
    if (!agency) return res.status(400).json({ error: "The implementing NGO must be Super-Admin approved before a project login can be created." });
    if (!project) return res.status(403).json({ error: "The selected project is not owned by your company." });
    if (existing) return res.status(409).json({ error: "An agency sub-login with this email already exists." });

    const subLogin = await prisma.agencySubLogin.create({
      data: {
        organizationId: creatorOrganization.id,
        ngoName: agency.name,
        agencyOrganizationId: agency.id,
        createdByUserId: req.user!.id,
        darpanId: agency.ngoProfile?.darpanNumber || (darpanId ? darpanId.trim() : null),
        email: normalizedEmail,
        contactPerson: contactPerson ? contactPerson.trim() : null,
        phone: phone ? phone.trim() : null,
        assignedProjectId: assignedProjectId || null,
        status: "INVITE_SENT"
      },
      include: {
        assignedProject: { select: { id: true, title: true } }
      }
    });

    const invitation = await createInvitation({ email: normalizedEmail, roleId: ROLE_ID.NGO_ADMIN, organizationId: agency.id, parentUserId: req.user!.id, agencySubLoginId: subLogin.id });
    return res.status(201).json({
      success: true,
      message: "Implementing Agency project-login invitation created. It becomes active after the recipient accepts it.",
      data: { ...subLogin, activationUrl: invitation.activationUrl }
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

export const listEligibleNgos = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const roleId = Number(req.user?.roleId);
    if (![ROLE_ID.COMPANY_ADMIN, ROLE_ID.SUPER_ADMIN].includes(roleId as any)) return res.status(403).json({ error: "Only Company Admin can view eligible implementing NGOs." });
    const data = await prisma.organization.findMany({ where: { kind: "NGO", status: "ACTIVE" }, select: { id: true, name: true, ngoProfile: { select: { darpanNumber: true } } }, orderBy: { name: "asc" } });
    return res.json({ success: true, data });
  } catch (error) { next(error); }
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
