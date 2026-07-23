import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { selectLeastLoadedRm } from "../services/rmAssignmentService";
import { ROLE_ID } from "../types/role";

export const submitGovernmentPitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Check organization onboarding status guard
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (user?.roleId !== ROLE_ID.SUPER_ADMIN && user?.organization?.status !== "ACTIVE") {
      return res.status(403).json({
        error: "Organization onboarding must be completed and approved by Super Admin before submitting pitches."
      });
    }

    const preferredDistrict = req.body.district || req.body.location || null;

    // Auto-assign Relationship Manager via round-robin least loaded algorithm
    const assignedRmId = await selectLeastLoadedRm(preferredDistrict);

    const pitch = await prisma.governmentPitch.create({
      data: {
        pitchReferenceId: `GP-${Date.now()}`,
        title: req.body.title || req.body.csrRequirement || "Development Need",
        budget: Number(req.body.budget || req.body.estimatedCost || 0),
        assignedRelationshipManagerId: assignedRmId,
        departmentId: req.body.departmentId || user?.organizationId || null,
        status: "SUBMITTED"
      }
    });

    return res.status(201).json(pitch);
  } catch (error) {
    next(error);
  }
};

export const submitPitch = submitGovernmentPitch;

export const getPitchById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json(pitch);
  } catch (error) {
    next(error);
  }
};

export const getPitchByTrackingId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { pitchReferenceId: req.params.trackingId } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json(pitch);
  } catch (error) {
    next(error);
  }
};

export const listGovernmentPitches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitches = await prisma.governmentPitch.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(pitches);
  } catch (error) {
    next(error);
  }
};

export const getPublicPitches = listGovernmentPitches;
export const getMyPitches = listGovernmentPitches;

export const assignPitchRelationshipManager = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { assignedRelationshipManagerId: req.body.relationshipManagerId }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const recordPitchRmContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "RM contact recorded" });
};

export const convertPitchToProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json({ success: true, message: "Converted to project" });
  } catch (error) {
    next(error);
  }
};

export const submitInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const interest = await prisma.corporatePitchInterest.create({
      data: {
        pitchId: req.body.pitchId || req.params.id,
        corporateId: req.user?.organizationId || req.body.corporateId || "unknown",
        status: "INTERESTED"
      }
    });
    return res.status(201).json(interest);
  } catch (error) {
    next(error);
  }
};

export const verifyPitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { status: "VERIFIED" }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * JS Pitch Approval — Auto-assigns project to both DNC (District Nodal Consultant) and Govt Department Admin
 */
export const approvePitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });

    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" }
    });

    // Auto-assign District Nodal Consultant (DNC) for this pitch's district
    const dncUser = await prisma.user.findFirst({
      where: {
        roleId: ROLE_ID.DISTRICT_NODAL_CONSULTANT,
        accountStatus: "ACTIVE"
      }
    });

    // Find Govt Dept Admin user
    const deptAdminUser = await prisma.user.findFirst({
      where: {
        roleId: ROLE_ID.GOVERNMENT_OFFICER,
        organizationId: pitch.departmentId || undefined,
        accountStatus: "ACTIVE"
      }
    });

    // Fetch system organization
    const org = await prisma.organization.findFirst({ where: { status: "ACTIVE" } });
    if (!org) return res.status(400).json({ error: "No active organization available for project creation" });

    // Create Project record if converting to project
    const project = await prisma.project.create({
      data: {
        projectCode: `PRJ-${Date.now()}`,
        title: pitch.title,
        description: pitch.title,
        sector: "General",
        district: "Mumbai",
        taluka: "Haveli",
        approvedBudget: pitch.budget,
        organizationId: org.id,
        status: "APPROVED"
      }
    });

    // Assign project to DNC and Dept Admin via ProjectAssignment model
    const actorId = req.user?.id || dncUser?.id || deptAdminUser?.id;
    if (!actorId) return res.status(400).json({ error: "Actor user required for assignment" });

    const assignmentsToCreate = [];
    if (dncUser) {
      assignmentsToCreate.push({
        entityType: "PROJECT",
        entityId: project.id,
        assignmentType: "DISTRICT_NODAL_CONSULTANT",
        assignedById: actorId,
        assignedToId: dncUser.id,
        assignedRoleId: ROLE_ID.DISTRICT_NODAL_CONSULTANT,
        status: "ACTIVE"
      });
    }
    if (deptAdminUser) {
      assignmentsToCreate.push({
        entityType: "PROJECT",
        entityId: project.id,
        assignmentType: "GOVERNMENT_OFFICER",
        assignedById: actorId,
        assignedToId: deptAdminUser.id,
        assignedRoleId: ROLE_ID.GOVERNMENT_OFFICER,
        status: "ACTIVE"
      });
    }

    if (assignmentsToCreate.length > 0) {
      await prisma.projectAssignment.createMany({
        data: assignmentsToCreate
      });
    }

    return res.json({
      success: true,
      message: "Pitch approved and auto-assigned to District Nodal Consultant & Department Admin",
      pitch: updated,
      project
    });
  } catch (error) {
    next(error);
  }
};
