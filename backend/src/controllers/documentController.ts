import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

export const listDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};

    if (req.user?.role !== Role.SUPER_ADMIN) {
      if (req.user?.ngoId) filter.ngoId = req.user.ngoId;
      if (req.user?.companyId) filter.companyId = req.user.companyId;
    }

    const documents = await prisma.document.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return res.json(documents);
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, fileUrl, fileType, expiryDate, ngoId, companyId, projectId, chatId } = req.body;

    const data: any = {
      title,
      fileUrl,
      fileType,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      projectId: projectId || null,
      chatId: chatId || null
    };

    if (req.user?.role === Role.SUPER_ADMIN) {
      data.ngoId = ngoId || null;
      data.companyId = companyId || null;
    } else {
      data.ngoId = req.user?.ngoId || null;
      data.companyId = req.user?.companyId || null;
    }

    const document = await prisma.document.create({ data });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: "DOCUMENT_CREATE",
        details: { documentId: document.id, title }
      }
    });

    return res.status(201).json(document);
  } catch (error) {
    next(error);
  }
};
