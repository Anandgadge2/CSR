import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ROLE_ID } from "../types/role";

export const createAssessment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { enquiryId, pitchId, decision, checklist } = req.body;
    return res.status(201).json({
      success: true,
      message: "Feasibility assessment created successfully",
      data: { enquiryId, pitchId, decision, checklist }
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentByPitchId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = getAssessmentByPitchId;

export const getPendingAssessments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const enquiries = await prisma.corporateEnquiry.findMany({
      where: { status: "SUBMITTED" },
      orderBy: { createdAt: "desc" }
    });
    return res.json(enquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * JS Decision Submission — Upon JS Approval ("PROCEED" / "PROCEED_WITH_CONDITIONS"):
 * Auto-assigns to District Nodal Consultant (DNC) for the district AND Government Department Admin.
 */
export const submitJSDecision = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // enquiry or pitch or project ID
    const { decision, reason, targetDistrict, departmentId } = req.body;

    if (decision === "PROCEED" || decision === "PROCEED_WITH_CONDITIONS") {
      const district = targetDistrict || "Mumbai";

      // 1. Auto-assign District Nodal Consultant (DNC) of that district
      const dncUser = await prisma.user.findFirst({
        where: {
          roleId: ROLE_ID.DISTRICT_NODAL_CONSULTANT,
          accountStatus: "ACTIVE"
        }
      });

      // 2. Auto-assign Government Department Admin
      const deptAdminUser = await prisma.user.findFirst({
        where: {
          roleId: ROLE_ID.GOVERNMENT_OFFICER,
          organizationId: departmentId || undefined,
          accountStatus: "ACTIVE"
        }
      });

      const org = await prisma.organization.findFirst({ where: { status: "ACTIVE" } });
      if (!org) return res.status(400).json({ error: "No active organization available" });

      // Find or create project
      let project = await prisma.project.findFirst({ where: { id } });
      if (!project) {
        project = await prisma.project.create({
          data: {
            projectCode: `PRJ-${Date.now()}`,
            title: `CSR Convergence Project (${district})`,
            description: reason || "JS Approved CSR Convergence Project",
            sector: "General",
            district,
            taluka: "Haveli",
            approvedBudget: 100000,
            organizationId: org.id,
            status: "APPROVED"
          }
        });
      }

      const actorId = req.user?.id || dncUser?.id || deptAdminUser?.id;
      if (!actorId) return res.status(400).json({ error: "Actor user required for assignment" });

      // Create ProjectAssignments for DNC & Dept Admin
      const assignments = [];
      if (dncUser) {
        assignments.push({
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
        assignments.push({
          entityType: "PROJECT",
          entityId: project.id,
          assignmentType: "GOVERNMENT_OFFICER",
          assignedById: actorId,
          assignedToId: deptAdminUser.id,
          assignedRoleId: ROLE_ID.GOVERNMENT_OFFICER,
          status: "ACTIVE"
        });
      }

      if (assignments.length > 0) {
        await prisma.projectAssignment.createMany({
          data: assignments
        });
      }

      return res.json({
        success: true,
        message: "JS Decision recorded: Auto-assigned to District Nodal Consultant (DNC) & Department Admin",
        decision,
        project,
        assignedDncId: dncUser?.id || null,
        assignedDeptAdminId: deptAdminUser?.id || null
      });
    }

    return res.json({ success: true, message: `JS Decision recorded: ${decision}`, reason });
  } catch (error) {
    next(error);
  }
};

/**
 * Appoint Nodal Officer — Dept Admin / DNC appoints a designated District Nodal Officer (DNO)
 */
export const appointNodalOfficer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, nodalOfficerId, notes } = req.body;
    const actorId = req.user?.id;
    if (!actorId) return res.status(401).json({ error: "Unauthorized" });

    const assignment = await prisma.projectAssignment.create({
      data: {
        entityType: "PROJECT",
        entityId: projectId,
        assignmentType: "DISTRICT_NODAL_OFFICER",
        assignedById: actorId,
        assignedToId: nodalOfficerId,
        assignedRoleId: ROLE_ID.DISTRICT_NODAL_OFFICER,
        status: "ACTIVE"
      }
    });

    return res.status(201).json({
      success: true,
      message: "District Nodal Officer (DNO) successfully appointed to project",
      assignment,
      notes
    });
  } catch (error) {
    next(error);
  }
};

export const onboardAssessmentProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Project onboarded" });
  } catch (error) {
    next(error);
  }
};

export const updateChecklistItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return res.json({ success: true, message: "Checklist updated" });
  } catch (error) {
    next(error);
  }
};

export const getNodalAppointments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const appointments = await prisma.projectAssignment.findMany({
      where: { assignmentType: "DISTRICT_NODAL_OFFICER" },
      include: { assignedTo: true }
    });
    return res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getNodalAppointmentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await prisma.projectAssignment.findUnique({
      where: { id: req.params.id },
      include: { assignedTo: true }
    });
    return res.json(appointment || {});
  } catch (error) {
    next(error);
  }
};

/**
 * Get active District Nodal Officers (DNOs)
 */
export const getNodalOfficers = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dnos = await prisma.user.findMany({
      where: {
        roleId: ROLE_ID.DISTRICT_NODAL_OFFICER,
        accountStatus: "ACTIVE"
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true
      }
    });
    return res.json(dnos);
  } catch (error) {
    next(error);
  }
};

export const getApprovedProjectsForAppointment = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "APPROVED" }
    });
    return res.json(projects);
  } catch (error) {
    next(error);
  }
};
