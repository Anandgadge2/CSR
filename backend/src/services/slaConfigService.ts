import prisma from "../config/db";
import { SLAStage } from "@prisma/client";
import { SLA_TIMELINES, SLATimelineKey } from "./slaEscalationService";

/**
 * Dynamic SLA configuration — super-admin controlled.
 *
 * Spec: the two headline windows are dynamic and owned by the Super Admin:
 *   - submission → first RM interaction = 5 days   (RM_RESPONSE)
 *   - RM forward → JS verification      = 7 days   (JS_DECISION)
 *
 * All SLA windows (in days) are stored as one JSON blob under a single
 * PlatformSetting key. Any stage absent from the stored blob falls back to the
 * hardcoded SLA_TIMELINES default, so partial configs are safe. The store is
 * the single source of truth at runtime; SLA_TIMELINES is only the seed default.
 */
export const SLA_CONFIG_KEY = "sla_timelines_days";

/** In-process cache so the hot path (every due-date calc) avoids a DB round-trip. */
let cache: { value: Record<string, number>; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

export type SlaConfig = Record<SLATimelineKey, number>;

/** Full config = stored overrides merged over the compiled defaults. */
export async function getSlaConfig(force = false): Promise<SlaConfig> {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return { ...SLA_TIMELINES, ...cache.value } as SlaConfig;
  }

  let stored: Record<string, number> = {};
  try {
    const setting = await prisma.platformSetting.findUnique({ where: { key: SLA_CONFIG_KEY } });
    if (setting) stored = JSON.parse(setting.value);
  } catch {
    // Missing/corrupt setting → defaults only. Never throw on the hot path.
    stored = {};
  }

  cache = { value: stored, at: Date.now() };
  return { ...SLA_TIMELINES, ...stored } as SlaConfig;
}

/** Days configured for one stage (stored override or compiled default). */
export async function getSlaDays(stage: SLATimelineKey): Promise<number> {
  const config = await getSlaConfig();
  return config[stage] ?? SLA_TIMELINES[stage];
}

/**
 * Persist SLA overrides. Only keys present in SLA_TIMELINES are accepted; each
 * value must be a positive integer number of days. Returns the merged config.
 * Invalidates the cache so the next read reflects the change immediately.
 */
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

  // Merge over any existing stored overrides so a partial update is non-destructive.
  const existing = await prisma.platformSetting.findUnique({ where: { key: SLA_CONFIG_KEY } });
  const merged = { ...(existing ? JSON.parse(existing.value) : {}), ...clean };

  await prisma.platformSetting.upsert({
    where: { key: SLA_CONFIG_KEY },
    create: { key: SLA_CONFIG_KEY, value: JSON.stringify(merged) },
    update: { value: JSON.stringify(merged) },
  });

  await prisma.auditLog
    .create({
      data: {
        userId: actorUserId,
        action: "SLA_CONFIG_UPDATED",
        entityType: "PlatformSetting",
        entityId: SLA_CONFIG_KEY,
        details: { updated: clean } as any,
      },
    })
    .catch(() => {});

  cache = null; // force refresh
  return { ...SLA_TIMELINES, ...merged } as SlaConfig;
}

/**
 * Config-aware due-date calculation. Every SLAStage enum value is also a
 * SLATimelineKey, so the stage doubles as the config key. Reads the dynamic
 * window (super-admin override or default) and adds it to startDate.
 *
 * Replaces the sync calculateDueDate() for any stage whose window the Super
 * Admin can tune. Callers that must stay synchronous keep the old helper.
 */
export async function calculateDueDateDynamic(
  stage: SLAStage,
  startDate: Date = new Date()
): Promise<Date> {
  const days = await getSlaDays(stage as SLATimelineKey);
  const due = new Date(startDate);
  due.setDate(due.getDate() + days);
  return due;
}
