import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getOwnedOrganization = async (req: AuthenticatedRequest, kind?: string) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new Error("Organization is required");

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      csrCompanyProfile: true,
      ngoProfile: true,
      govDeptProfile: true,
      documents: true
    }
  });

  if (!organization) throw new Error("Organization not found");
  if (kind && organization.kind !== kind) throw new Error("Wrong organization kind");
  return organization;
};

export const listOrganizations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: { csrCompanyProfile: true, ngoProfile: true, govDeptProfile: true },
      orderBy: { createdAt: "desc" }
    });
    return res.json(orgs);
  } catch (error) {
    next(error);
  }
};

export const listPendingOrganizations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orgs = await prisma.organization.findMany({
      where: { status: "REGISTERED" },
      orderBy: { createdAt: "desc" }
    });
    return res.json(orgs);
  } catch (error) {
    next(error);
  }
};

export const getOrganizationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { csrCompanyProfile: true, ngoProfile: true, govDeptProfile: true, documents: true }
    });
    if (!organization) return res.status(404).json({ error: "Organization not found" });
    return res.json(organization);
  } catch (error) {
    next(error);
  }
};

export const approveOrganization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.organization.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE" }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const rejectOrganization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.organization.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const suspendOrganization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.organization.update({
      where: { id: req.params.id },
      data: { status: "SUSPENDED" }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const requestClarification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Clarification requested" });
  } catch (error) {
    next(error);
  }
};

export const getOnboardingProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req);
    return res.json(org);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getOnboardingStatus = getOnboardingProfile;

export const updateOnboardingProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req);
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: {
        name: req.body.name || org.name,
        officialEmail: req.body.officialEmail || org.officialEmail,
        officialPhone: req.body.officialPhone || org.officialPhone,
        address: req.body.address || org.address,
        district: req.body.district || org.district
      }
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const uploadOnboardingDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req);
    const doc = await prisma.document.create({
      data: {
        organizationId: org.id,
        title: req.body.fileName || "Onboarding Document",
        fileUrl: req.body.fileUrl || "",
        documentType: req.body.documentType || "ONBOARDING",
        fileName: req.body.fileName || "document.pdf",
        fileSize: Number(req.body.fileSize || 0),
        fileType: "pdf"
      }
    });
    return res.status(201).json(doc);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const listOnboardingDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req);
    const docs = await prisma.document.findMany({ where: { organizationId: org.id } });
    return res.json(docs);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteOnboardingDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    return res.json({ message: "Document deleted" });
  } catch (error) {
    next(error);
  }
};

export const submitOnboarding = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req);
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: { status: "ACTIVE" }
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getCompanyOnboardingProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "CSR_COMPANY");
    return res.json({ organization: org, profile: org.csrCompanyProfile });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateCompanyOnboardingProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "CSR_COMPANY");
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: { name: req.body.name || org.name }
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateCompanyCompliance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "CSR_COMPANY");
    const profile = await prisma.cSRCompanyProfile.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id, preferredDistricts: [], preferredSectors: [] },
      update: {}
    });
    return res.json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateCompanyPreferences = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "CSR_COMPANY");
    const profile = await prisma.cSRCompanyProfile.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id, preferredDistricts: [], preferredSectors: [] },
      update: {}
    });
    return res.json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const submitCompanyOnboarding = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "CSR_COMPANY");
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: { status: "ACTIVE" }
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getDepartmentOnboardingProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "GOVERNMENT_DEPARTMENT");
    return res.json({ organization: org, profile: org.govDeptProfile });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateDepartmentOnboardingProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "GOVERNMENT_DEPARTMENT");
    const profile = await prisma.govDepartmentProfile.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id },
      update: {}
    });
    return res.json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateDepartmentNodalOfficer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "GOVERNMENT_DEPARTMENT");
    const profile = await prisma.govDepartmentProfile.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id },
      update: {}
    });
    return res.json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateDepartmentAuthorization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "GOVERNMENT_DEPARTMENT");
    const profile = await prisma.govDepartmentProfile.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id },
      update: {}
    });
    return res.json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateDepartmentJurisdiction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "GOVERNMENT_DEPARTMENT");
    const profile = await prisma.govDepartmentProfile.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id },
      update: {}
    });
    return res.json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateDepartmentPermissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "GOVERNMENT_DEPARTMENT");
    const profile = await prisma.govDepartmentProfile.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id },
      update: {}
    });
    return res.json(profile);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const submitDepartmentOnboarding = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const org = await getOwnedOrganization(req, "GOVERNMENT_DEPARTMENT");
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: { status: "ACTIVE" }
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const listPermissions = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const perms = await prisma.permission.findMany();
    return res.json(perms);
  } catch (error) {
    next(error);
  }
};

export const listOrgRoles = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.role.findMany({ where: { organizationId: req.user?.organizationId || undefined } });
    return res.json(roles);
  } catch (error) {
    next(error);
  }
};

export const createOrgRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const role = await prisma.role.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        organizationId: req.user?.organizationId || null,
        isSystemRole: false
      }
    });
    return res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

export const updateOrgRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const role = await prisma.role.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name, description: req.body.description }
    });
    return res.json(role);
  } catch (error) {
    next(error);
  }
};

export const deleteOrgRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.role.delete({ where: { id: Number(req.params.id) } });
    return res.json({ message: "Role deleted" });
  } catch (error) {
    next(error);
  }
};

export const listOrgUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({ where: { organizationId: req.user?.organizationId || undefined } });
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

export const inviteOrgUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        passwordHash: "placeholder",
        roleId: req.body.roleId ? Number(req.body.roleId) : 9,
        organizationId: req.user?.organizationId || null
      }
    });
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateOrgUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { roleId: Number(req.body.roleId) }
    });
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateOrgUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { accountStatus: req.body.accountStatus }
    });
    return res.json(user);
  } catch (error) {
    next(error);
  }
};
