import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ReportType, Role } from "@prisma/client";

export const listReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};

    if (req.user?.role !== Role.SUPER_ADMIN) {
      if (req.user?.ngoId) where.ngoId = req.user.ngoId;
      if (req.user?.companyId) where.companyId = req.user.companyId;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return res.json(reports);
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, type, content, fileUrl } = req.body;

    if (!Object.values(ReportType).includes(type)) {
      return res.status(400).json({ error: "Invalid report type" });
    }

    const report = await prisma.report.create({
      data: {
        title,
        type,
        content,
        fileUrl: fileUrl || null,
        createdById: req.user!.id,
        ngoId: req.user?.ngoId || null,
        companyId: req.user?.companyId || null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: "REPORT_CREATE",
        details: { reportId: report.id, type }
      }
    });

    return res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

export const generateAnnualSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        ...(req.user?.ngoId ? { ngoId: req.user.ngoId } : {}),
        status: { in: ["APPROVED", "FUNDED", "COMPLETED"] }
      },
      include: { milestones: true, ngo: { select: { name: true } } }
    });

    const totalBudgetRequested = projects.reduce((sum, project) => sum + Number(project.budgetRequested), 0);
    const totalBudgetFunded = projects.reduce((sum, project) => sum + Number(project.budgetFunded), 0);
    const totalBeneficiaries = projects.reduce((sum, project) => sum + project.beneficiaryCount, 0);

    const report = await prisma.report.create({
      data: {
        title: `Annual CSR Summary ${new Date().getFullYear()}`,
        type: ReportType.ANNUAL,
        createdById: req.user!.id,
        ngoId: req.user?.ngoId || null,
        companyId: req.user?.companyId || null,
        content: {
          totalProjects: projects.length,
          totalBudgetRequested,
          totalBudgetFunded,
          totalBeneficiaries,
          projects: projects.map((project) => ({
            id: project.id,
            title: project.title,
            ngo: project.ngo.name,
            status: project.status,
            district: project.district,
            focusArea: project.focusArea,
            beneficiaryCount: project.beneficiaryCount,
            budgetRequested: Number(project.budgetRequested),
            budgetFunded: Number(project.budgetFunded),
            milestones: project.milestones.length
          }))
        }
      }
    });

    return res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};
