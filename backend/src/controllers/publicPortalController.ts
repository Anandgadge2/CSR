import { Request, Response } from "express";
import prisma from "../config/db";
import { successResponse, errorResponse, notFoundResponse } from "../utils/apiResponse";

export const getCompletedProjectsGallery = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "COMPLETED" },
      include: { organization: true, milestones: true },
      orderBy: { completedAt: "desc" }
    });

    return successResponse(res, projects);
  } catch (error) {
    return errorResponse(res, "Failed to fetch completed projects", 500);
  }
};

export const getCompletedProjectDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { projectCode: id }], status: "COMPLETED" },
      include: { organization: true, milestones: true, documents: true }
    });

    if (!project) return notFoundResponse(res, "Completed project not found");

    return successResponse(res, { project });
  } catch (error) {
    return errorResponse(res, "Failed to fetch project", 500);
  }
};

export const getSuccessStories = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "COMPLETED" },
      take: 10,
      orderBy: { completedAt: "desc" }
    });

    return successResponse(res, projects);
  } catch (error) {
    return errorResponse(res, "Failed to fetch success stories", 500);
  }
};

export const getPublicDirectory = async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, kind: true, state: true, district: true }
    });

    return successResponse(res, organizations);
  } catch (error) {
    return errorResponse(res, "Failed to fetch directory", 500);
  }
};

export const getPublicPortalStats = async (req: Request, res: Response) => {
  try {
    const [totalProjects, completedProjects, budgetAgg, districtsCovered] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.project.aggregate({ _sum: { approvedBudget: true } }),
      prisma.project.findMany({ select: { district: true }, distinct: ["district"] })
    ]);

    return successResponse(res, {
      totalProjects,
      completedProjects,
      totalCsrCommitted: budgetAgg._sum.approvedBudget ?? 0,
      districtsCovered: districtsCovered.length
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch portal statistics", 500);
  }
};

export const getPublicRequirements = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const requirements = await prisma.project.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { organization: true }
    });

    return successResponse(res, requirements);
  } catch (error) {
    return errorResponse(res, "Failed to fetch requirements", 500);
  }
};
