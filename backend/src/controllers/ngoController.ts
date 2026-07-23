import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { OrganizationKind } from "@prisma/client";

export const getNgos = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ngos = await prisma.organization.findMany({
      where: { kind: OrganizationKind.NGO },
      include: { ngoProfile: true },
      orderBy: { name: "asc" }
    });

    return res.json(ngos);
  } catch (error) {
    next(error);
  }
};

export const getNgoById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const ngo = await prisma.organization.findUnique({
      where: { id },
      include: { ngoProfile: true, projects: true }
    });

    if (!ngo || ngo.kind !== OrganizationKind.NGO) {
      return res.status(404).json({ error: "NGO not found" });
    }

    return res.json(ngo);
  } catch (error) {
    next(error);
  }
};

export const updateNgo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, darpanNumber, csr1Number, areasOfOperation, csrSectors } = req.body;

    const ngo = await prisma.organization.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ngoProfile: {
          upsert: {
            create: {
              darpanNumber,
              csr1Number,
              areasOfOperation: areasOfOperation || [],
              csrSectors: csrSectors || []
            },
            update: {
              ...(darpanNumber ? { darpanNumber } : {}),
              ...(csr1Number ? { csr1Number } : {}),
              ...(areasOfOperation ? { areasOfOperation } : {}),
              ...(csrSectors ? { csrSectors } : {})
            }
          }
        }
      },
      include: { ngoProfile: true }
    });

    return res.json(ngo);
  } catch (error) {
    next(error);
  }
};
