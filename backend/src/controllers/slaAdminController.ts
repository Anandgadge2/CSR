import { NextFunction, Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { getSlaConfig, MAHARASHTRA_HOLIDAYS_KEY, updateSlaConfig } from "../services/slaConfigService";
import { SLA_TIMELINES } from "../services/slaEscalationService";

export const getSlaConfiguration = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [config, holidaySetting] = await Promise.all([getSlaConfig(), prisma.platformSetting.findUnique({ where: { key: MAHARASHTRA_HOLIDAYS_KEY } })]);
    const raw = holidaySetting?.value;
    const holidays = Array.isArray(raw) ? raw : typeof raw === "string" ? JSON.parse(raw) : (raw as any)?.dates || [];
    return res.json({ config, defaults: SLA_TIMELINES, holidays: Array.isArray(holidays) ? holidays : [] });
  } catch (error) { next(error); }
};

export const saveSlaConfiguration = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const config = await updateSlaConfig(req.body?.updates || {}, req.user?.id);
    const rawHolidays = req.body?.holidays;
    if (rawHolidays !== undefined) {
      if (!Array.isArray(rawHolidays) || rawHolidays.some((date) => typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
        return res.status(400).json({ error: "Holidays must use YYYY-MM-DD format." });
      }
      const holidays = [...new Set(rawHolidays)].sort();
      await prisma.platformSetting.upsert({ where: { key: MAHARASHTRA_HOLIDAYS_KEY }, create: { key: MAHARASHTRA_HOLIDAYS_KEY, value: holidays as any }, update: { value: holidays as any } });
      await prisma.auditLog.create({ data: { actorUserId: req.user?.id || null, userId: req.user?.id || null, action: "MAHARASHTRA_HOLIDAYS_UPDATED", entityType: "PlatformSetting", entityId: MAHARASHTRA_HOLIDAYS_KEY, details: { holidays } as any } });
    }
    return res.json({ success: true, config, holidays: rawHolidays === undefined ? undefined : [...new Set(rawHolidays)].sort() });
  } catch (error) { next(error); }
};
