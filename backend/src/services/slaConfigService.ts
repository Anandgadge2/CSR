import prisma from "../config/db";
import { SLA_TIMELINES, SLATimelineKey } from "./slaEscalationService";

export const SLA_CONFIG_KEY = "sla_timelines_days";

let cache: { value: Record<string, number>; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

export type SlaConfig = Record<SLATimelineKey, number>;

export async function getSlaConfig(force = false): Promise<SlaConfig> {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return { ...SLA_TIMELINES, ...cache.value } as SlaConfig;
  }

  let stored: Record<string, number> = {};
  try {
    const setting = await prisma.platformSetting.findUnique({ where: { key: SLA_CONFIG_KEY } });
    if (setting) {
      stored = typeof setting.value === "string" ? JSON.parse(setting.value) : (setting.value as Record<string, number>);
    }
  } catch {
    stored = {};
  }

  cache = { value: stored, at: Date.now() };
  return { ...SLA_TIMELINES, ...stored } as SlaConfig;
}

export async function getSlaDays(stage: SLATimelineKey): Promise<number> {
  const config = await getSlaConfig();
  return config[stage] ?? SLA_TIMELINES[stage];
}

export async function updateSlaConfig(
  updates: Record<string, unknown>,
  actorUserId?: string
): Promise<SlaConfig> {
  const validKeys = new Set(Object.keys(SLA_TIMELINES));
  const clean: Record<string, number> = {};

  for (const [key, raw] of Object.entries(updates)) {
    if (!validKeys.has(key)) {
      throw new Error(`Unknown SLA stage '${key}'`);
    }
    const days = Number(raw);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw new Error(`SLA '${key}' must be an integer between 1 and 365 days`);
    }
    clean[key] = days;
  }

  const existing = await prisma.platformSetting.findUnique({ where: { key: SLA_CONFIG_KEY } });
  const existingVal = existing
    ? (typeof existing.value === "string" ? JSON.parse(existing.value) : (existing.value as Record<string, number>))
    : {};
  const merged = { ...existingVal, ...clean };

  await prisma.platformSetting.upsert({
    where: { key: SLA_CONFIG_KEY },
    create: { key: SLA_CONFIG_KEY, value: merged as any },
    update: { value: merged as any },
  });

  await prisma.auditLog
    .create({
      data: {
        actorUserId: actorUserId || null,
        userId: actorUserId || null,
        action: "SLA_CONFIG_UPDATED",
        entityType: "PlatformSetting",
        entityId: SLA_CONFIG_KEY,
        details: { updated: clean } as any,
      },
    })
    .catch(() => {});

  cache = null;
  return { ...SLA_TIMELINES, ...merged } as SlaConfig;
}

export async function calculateSlaDueDate(stageName: SLATimelineKey, fromDate = new Date()): Promise<Date> {
  const days = await getSlaDays(stageName);
  const due = new Date(fromDate.getTime());
  due.setDate(due.getDate() + days);
  return due;
}
