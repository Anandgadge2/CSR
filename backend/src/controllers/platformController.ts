import { NextFunction, Response } from "express";
import prisma from "../config/db";
import { TenantAwareRequest } from "../middlewares/tenantMiddleware";

export const getMyTenantFeatures = async (req: TenantAwareRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantContext?.tenantId || req.user?.tenantId || (req.headers["x-tenant-id"] as string | undefined);
    if (!tenantId) {
      return res.json({ tenantId: null, features: {} });
    }

    const features = await prisma.tenantFeature.findMany({
      where: { tenantId },
      select: { featureKey: true, isEnabled: true, configJson: true }
    });

    return res.json({
      tenantId,
      features: Object.fromEntries(features.map((feature) => [feature.featureKey, feature.isEnabled])),
      config: Object.fromEntries(features.map((feature) => [feature.featureKey, feature.configJson]))
    });
  } catch (error) {
    return next(error);
  }
};
