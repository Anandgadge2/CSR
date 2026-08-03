import prisma from "../config/db";
import { ROLE_ID } from "../types/role";

/**
 * Assigns an active Relationship Manager (Role ID 6) to a corporate enquiry or government pitch
 * based on minimum active workload (least assigned active items).
 */
export async function autoAssignRelationshipManager(preferredDistrict?: string | null): Promise<string | null> {
  // Find all active Relationship Managers
  const rms = await prisma.user.findMany({
    where: {
      roleId: ROLE_ID.RELATIONSHIP_MANAGER,
      accountStatus: "ACTIVE",
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (rms.length === 0) {
    console.warn("[RM Assignment] No active Relationship Managers found in system");
    return null;
  }

  const rmIds = rms.map((r) => r.id);

  // Count active assigned enquiries per RM
  const enquiryCounts = await prisma.corporateEnquiry.groupBy({
    by: ["assignedRelationshipManagerId"],
    where: {
      assignedRelationshipManagerId: { in: rmIds },
      status: { notIn: ["RESOLVED", "REJECTED", "CLOSED"] },
    },
    _count: { id: true },
  });

  // Count active assigned pitches per RM
  const pitchCounts = await prisma.governmentPitch.groupBy({
    by: ["assignedRelationshipManagerId"],
    where: {
      assignedRelationshipManagerId: { in: rmIds },
      status: { notIn: ["APPROVED", "REJECTED", "CANCELLED"] },
    },
    _count: { id: true },
  });

  const workloadMap = new Map<string, number>();
  rmIds.forEach((id) => workloadMap.set(id, 0));

  enquiryCounts.forEach((c) => {
    if (c.assignedRelationshipManagerId) {
      workloadMap.set(c.assignedRelationshipManagerId, (workloadMap.get(c.assignedRelationshipManagerId) || 0) + c._count.id);
    }
  });

  pitchCounts.forEach((c) => {
    if (c.assignedRelationshipManagerId) {
      workloadMap.set(c.assignedRelationshipManagerId, (workloadMap.get(c.assignedRelationshipManagerId) || 0) + c._count.id);
    }
  });

  // Find RM with minimum total workload
  let bestRmId: string | null = null;
  let minWorkload = Infinity;

  workloadMap.forEach((workload, rmId) => {
    if (workload < minWorkload) {
      minWorkload = workload;
      bestRmId = rmId;
    }
  });

  return bestRmId;
}

export const selectLeastLoadedRm = autoAssignRelationshipManager;
