import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { OrganizationKind } from "@prisma/client";

export const getCompanies = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const companies = await prisma.organization.findMany({
      where: { kind: OrganizationKind.CSR_COMPANY },
      include: { csrCompanyProfile: true },
      orderBy: { name: "asc" }
    });

    return res.json(companies);
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const company = await prisma.organization.findUnique({
      where: { id },
      include: { csrCompanyProfile: true }
    });

    if (!company || company.kind !== OrganizationKind.CSR_COMPANY) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.json(company);
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, annualCsrBudget, preferredSectors, preferredDistricts, csrHeadName } = req.body;

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        csrCompanyProfile: {
          upsert: {
            create: {
              annualCsrBudget: annualCsrBudget ? Number(annualCsrBudget) : null,
              preferredSectors: preferredSectors || [],
              preferredDistricts: preferredDistricts || [],
              csrHeadName
            },
            update: {
              ...(annualCsrBudget !== undefined ? { annualCsrBudget: Number(annualCsrBudget) } : {}),
              ...(preferredSectors ? { preferredSectors } : {}),
              ...(preferredDistricts ? { preferredDistricts } : {}),
              ...(csrHeadName ? { csrHeadName } : {})
            }
          }
        }
      },
      include: { csrCompanyProfile: true }
    });

    return res.json(organization);
  } catch (error) {
    next(error);
  }
};
