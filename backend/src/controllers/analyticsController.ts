import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalNgos = await prisma.organization.count({ where: { kind: "NGO", status: "ACTIVE" } });
    const totalCompanies = await prisma.organization.count({ where: { kind: "CSR_COMPANY", status: "ACTIVE" } });
    const totalProjects = await prisma.project.count();
    
    const totalBudgetAggregate = await prisma.project.aggregate({
      _sum: { approvedBudget: true }
    });
    const totalFunding = totalBudgetAggregate._sum.approvedBudget || 0;

    const projectsBySector = await prisma.project.groupBy({
      by: ["sector"],
      _count: { id: true }
    });

    const sectorCoverage = projectsBySector.map((item) => ({
      sector: item.sector,
      count: item._count.id
    }));

    return res.json({
      totalNgos,
      totalCompanies,
      totalProjects,
      totalFunding,
      sectorCoverage
    });
  } catch (error) {
    next(error);
  }
};

export const getGisData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectStats = await prisma.project.groupBy({
      by: ["district"],
      _count: { id: true },
      _sum: { approvedBudget: true }
    });

    return res.json(projectStats);
  } catch (error) {
    next(error);
  }
};
