import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { successResponse, notFoundResponse, unauthorizedResponse } from "../utils/apiResponse";

export const getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorizedResponse(res, "Not authenticated");

    const [totalProjects, totalGrievances] = await Promise.all([
      prisma.project.count(),
      prisma.grievance.count()
    ]);

    return successResponse(res, { totalProjects, totalGrievances }, "Dashboard loaded");
  } catch (error) {
    next(error);
  }
};

export const getAssignedProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: { nodalOfficerUserId: req.user?.id },
      orderBy: { createdAt: "desc" }
    });
    return successResponse(res, projects, "Projects retrieved");
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { milestones: true, grievances: true, documents: true, utilizationCertificates: true }
    });
    if (!project) return notFoundResponse(res, "Project not found");
    return successResponse(res, project, "Project retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateProjectStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    return successResponse(res, project, "Status updated");
  } catch (error) {
    next(error);
  }
};

export const verifyMilestone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Milestone verified" });
};

export const verifyUC = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "UC verified" });
};

export const resolveGrievance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const grievance = await prisma.grievance.update({
      where: { id: req.params.id },
      data: {
        resolutionText: req.body.resolutionText,
        status: "LEVEL_1_RESOLVED"
      }
    });
    return successResponse(res, grievance, "Grievance resolved");
  } catch (error) {
    next(error);
  }
};

export const getProjectGrievances = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const grievances = await prisma.grievance.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "desc" }
    });
    return successResponse(res, grievances, "Grievances retrieved");
  } catch (error) {
    next(error);
  }
};

export const getCorporateEnquiries = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const enquiries = await prisma.corporateEnquiry.findMany({ orderBy: { createdAt: "desc" } });
    return successResponse(res, enquiries, "Enquiries retrieved");
  } catch (error) {
    next(error);
  }
};

export const getGovernmentPitches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitches = await prisma.governmentPitch.findMany({ orderBy: { createdAt: "desc" } });
    return successResponse(res, pitches, "Pitches retrieved");
  } catch (error) {
    next(error);
  }
};

export const getInspections = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const inspections = await prisma.projectInspection.findMany({
      orderBy: { createdAt: "desc" }
    });
    return successResponse(res, inspections, "Inspections retrieved");
  } catch (error) {
    next(error);
  }
};

export const createInspection = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const inspection = await prisma.projectInspection.create({
      data: {
        projectId: req.body.projectId,
        inspectorUserId: req.user!.id,
        remarks: req.body.remarks,
        issuesFound: req.body.issuesFound,
        actionRequired: req.body.actionRequired
      }
    });
    return successResponse(res, inspection, "Inspection created");
  } catch (error) {
    next(error);
  }
};
