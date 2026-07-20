import prisma from "../config/db";
import { CorporateEnquiryStatus, GovernmentPitchStatus } from "@prisma/client";
import { Role } from "../types/role";

/**
 * Relationship Manager auto-assignment — workload-balanced pool.
 *
 * Spec (Phase 3): every submitted enquiry/pitch is auto-assigned to an RM.
 * The system inspects the active workload of every RM, picks those with the
 * fewest active applications, and breaks ties randomly. This keeps the pool
 * balanced instead of dumping everything on a district's single RM.
 *
 * "RM" = any user whose dynamic role slug is CSR_RELATIONSHIP_MANAGER. The pool
 * is the whole set of active RMs (not district-scoped): the spec's balancing is
 * portfolio-wide. District affinity, when present, is used only as a secondary
 * tie-break before random.
 *
 * "Active workload" = count of the RM's non-terminal enquiries + pitches.
 */

/**
 * Enquiry statuses that still occupy an RM's queue (non-terminal, pre-JS-decision).
 * Values must match the CorporateEnquiryStatus enum in schema.prisma.
 */
const ACTIVE_ENQUIRY_STATUSES = [
  "TRACKING_ID_GENERATED",
  "RM_ASSIGNED",
  "RM_CONTACTED",
  "ASSESSMENT_PENDING",
  "ASSESSMENT_SUBMITTED_TO_JS",
] as const;

/**
 * Pitch statuses that still occupy an RM's queue (non-terminal, pre-JS-decision).
 * Values must match the GovernmentPitchStatus enum in schema.prisma.
 */
const ACTIVE_PITCH_STATUSES = [
  "SUBMITTED",
  "RM_VERIFICATION_PENDING",
  "RM_VERIFIED",
  "JS_APPROVAL_PENDING",
] as const;

export interface RmCandidate {
  id: string;
  email: string;
  assignedDistrict: string | null;
  activeCount: number;
}

/**
 * Deterministic-free index pick. Math.random is banned in some execution
 * contexts (workflow scripts) but this service runs in normal request/worker
 * context where it is fine; kept isolated so it is trivial to stub in tests.
 */
function randomIndex(n: number): number {
  return Math.floor(Math.random() * n);
}

/**
 * Return every active RM with their current active workload count.
 * Empty array when no RM exists in the pool.
 */
export async function getRmWorkloads(): Promise<RmCandidate[]> {
  const rms = await prisma.user.findMany({
    where: {
      roleRelation: { slug: Role.CSR_RELATIONSHIP_MANAGER },
      accountStatus: "ACTIVE",
    },
    select: { id: true, email: true, assignedDistrict: true },
  });

  if (rms.length === 0) return [];

  // One grouped count per entity type, then merge — avoids N queries per RM.
  const rmIds = rms.map((r) => r.id);

  const [enquiryCounts, pitchCounts] = await Promise.all([
    prisma.corporateEnquiry.groupBy({
      by: ["assignedRelationshipManagerId"],
      where: {
        assignedRelationshipManagerId: { in: rmIds },
        status: { in: ACTIVE_ENQUIRY_STATUSES as unknown as CorporateEnquiryStatus[] },
      },
      _count: { _all: true },
    }),
    prisma.governmentPitch.groupBy({
      by: ["assignedRelationshipManagerId"],
      where: {
        assignedRelationshipManagerId: { in: rmIds },
        status: { in: ACTIVE_PITCH_STATUSES as unknown as GovernmentPitchStatus[] },
      },
      _count: { _all: true },
    }),
  ]);

  const countByRm = new Map<string, number>();
  for (const row of enquiryCounts) {
    if (row.assignedRelationshipManagerId) {
      countByRm.set(row.assignedRelationshipManagerId, row._count?._all ?? 0);
    }
  }
  for (const row of pitchCounts) {
    if (row.assignedRelationshipManagerId) {
      const prev = countByRm.get(row.assignedRelationshipManagerId) || 0;
      countByRm.set(row.assignedRelationshipManagerId, prev + (row._count?._all ?? 0));
    }
  }

  return rms.map((r) => ({
    id: r.id,
    email: r.email,
    assignedDistrict: r.assignedDistrict,
    activeCount: countByRm.get(r.id) || 0,
  }));
}

/**
 * Pick the RM to assign. Lowest active workload wins; ties broken by district
 * affinity (RM assigned to `preferDistrict`) then randomly. Returns null when
 * the pool is empty — callers must handle "no RM available" gracefully and
 * leave the application unassigned (SLA clock still runs).
 */
export async function pickRelationshipManager(
  preferDistrict?: string | null
): Promise<RmCandidate | null> {
  const pool = await getRmWorkloads();
  if (pool.length === 0) return null;

  const minCount = Math.min(...pool.map((r) => r.activeCount));
  const leastLoaded = pool.filter((r) => r.activeCount === minCount);

  if (leastLoaded.length === 1) return leastLoaded[0];

  // Tie-break 1: district affinity among the least-loaded.
  if (preferDistrict) {
    const districtMatch = leastLoaded.filter((r) => r.assignedDistrict === preferDistrict);
    if (districtMatch.length === 1) return districtMatch[0];
    if (districtMatch.length > 1) return districtMatch[randomIndex(districtMatch.length)];
  }

  // Tie-break 2: random.
  return leastLoaded[randomIndex(leastLoaded.length)];
}
