import prisma from "../config/db";
import { ROLE_ID } from "../types/role";

export interface RmCandidate {
  id: string;
  email: string;
  assignedDistrict: string | null;
  activeCount: number;
}

function randomIndex(n: number): number {
  return Math.floor(Math.random() * n);
}

export async function getRmWorkloads(): Promise<RmCandidate[]> {
  const rms = await prisma.user.findMany({
    where: {
      roleId: ROLE_ID.RELATIONSHIP_MANAGER,
      accountStatus: "ACTIVE",
    },
    select: { id: true, email: true },
  });

  if (rms.length === 0) return [];

  const rmIds = rms.map((r) => r.id);

  const [enquiryCounts, pitchCounts] = await Promise.all([
    prisma.corporateEnquiry.groupBy({
      by: ["assignedRelationshipManagerId"],
      where: {
        assignedRelationshipManagerId: { in: rmIds },
      },
      _count: { _all: true },
    }),
    prisma.governmentPitch.groupBy({
      by: ["assignedRelationshipManagerId"],
      where: {
        assignedRelationshipManagerId: { in: rmIds },
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
    assignedDistrict: null,
    activeCount: countByRm.get(r.id) || 0,
  }));
}

export async function selectLeastLoadedRm(preferDistrict?: string | null): Promise<string | null> {
  const candidates = await getRmWorkloads();
  if (candidates.length === 0) return null;

  let minCount = Infinity;
  for (const c of candidates) {
    if (c.activeCount < minCount) minCount = c.activeCount;
  }

  const leastLoaded = candidates.filter((c) => c.activeCount === minCount);
  if (leastLoaded.length === 1) return leastLoaded[0].id;

  const districtMatches = leastLoaded.filter((c) => c.assignedDistrict && c.assignedDistrict === preferDistrict);
  if (districtMatches.length > 0) {
    return districtMatches[randomIndex(districtMatches.length)].id;
  }

  return leastLoaded[randomIndex(leastLoaded.length)].id;
}
