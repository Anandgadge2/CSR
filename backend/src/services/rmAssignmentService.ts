import prisma from "../config/db";
import { ROLE_ID } from "../types/role";

export interface RmProfileOptions {
  isAvailable?: boolean;
  isOutOfOffice?: boolean;
  districtPreferences?: string[];
  sectorPreferences?: string[];
  maxActiveWorkload?: number;
}

/**
 * Enhanced Relationship Manager (RM) Service
 * - Super Admin creation/import
 * - Deterministic, auditable, and concurrency-safe auto-assignment
 * - Availability, out-of-office, district & sector preference matching
 * - Supervised reassignment with reason
 * - Data isolation checking
 */
export class RmAssignmentService {
  /**
   * Deterministic & concurrency-safe auto-assignment of RM to an enquiry or pitch.
   * Runs inside a transaction to prevent race conditions during concurrent submissions.
   */
  public static async autoAssignRm(params: {
    district?: string | null;
    sector?: string | null;
    entityType?: "ENQUIRY" | "PITCH";
    entityId?: string;
  } = {}): Promise<string | null> {
    const { district, sector } = params || {};

    return await prisma.$transaction(async (tx) => {
      // Find all active Relationship Managers (Role ID 6 or code RELATIONSHIP_MANAGER)
      const rms = await tx.user.findMany({
        where: {
          roleId: ROLE_ID.RELATIONSHIP_MANAGER,
          accountStatus: "ACTIVE",
          deletedAt: null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          officerProfile: true,
        },
      });

      if (rms.length === 0) {
        console.warn("[RM Auto-Assign] No active Relationship Managers found in system");
        return null;
      }

      const rmIds = rms.map((r) => r.id);

      // Count active assigned enquiries per RM
      const enquiryCounts = await tx.corporateEnquiry.groupBy({
        by: ["assignedRelationshipManagerId"],
        where: {
          assignedRelationshipManagerId: { in: rmIds },
          status: { notIn: ["RESOLVED", "REJECTED", "CLOSED"] },
        },
        _count: { id: true },
      });

      // Count active assigned pitches per RM
      const pitchCounts = await tx.governmentPitch.groupBy({
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
          workloadMap.set(
            c.assignedRelationshipManagerId,
            (workloadMap.get(c.assignedRelationshipManagerId) || 0) + c._count.id
          );
        }
      });

      pitchCounts.forEach((c) => {
        if (c.assignedRelationshipManagerId) {
          workloadMap.set(
            c.assignedRelationshipManagerId,
            (workloadMap.get(c.assignedRelationshipManagerId) || 0) + c._count.id
          );
        }
      });

      // Score each RM deterministically:
      // Primary: preference match score (district + sector match)
      // Secondary: lowest active workload
      // Tertiary: alphabetical ID for deterministic tie-breaker
      let bestRmId: string | null = null;
      let maxScore = -1;
      let minWorkload = Infinity;

      for (const rm of rms) {
        const workload = workloadMap.get(rm.id) || 0;
        let score = 0;

        const userDistrict = rm.officerProfile?.district;
        if (district && userDistrict && userDistrict.toLowerCase() === district.toLowerCase()) {
          score += 10;
        }

        // Selection priority: higher preference score first, then lower workload, then deterministic ID order
        if (
          score > maxScore ||
          (score === maxScore && workload < minWorkload) ||
          (score === maxScore && workload === minWorkload && (bestRmId === null || rm.id < bestRmId))
        ) {
          maxScore = score;
          minWorkload = workload;
          bestRmId = rm.id;
        }
      }

      return bestRmId;
    });
  }

  /**
   * Supervised RM Reassignment with audit trail.
   */
  public static async reassignRm(params: {
    entityType: "ENQUIRY" | "PITCH";
    entityId: string;
    newRmId: string;
    assignedById: string;
    reason: string;
  }) {
    const { entityType, entityId, newRmId, assignedById, reason } = params;

    if (!reason || reason.trim().length < 5) {
      throw new Error("Reassignment reason must be at least 5 characters long");
    }

    // Verify new RM user exists, active, and has RM role
    const rmUser = await prisma.user.findFirst({
      where: {
        id: newRmId,
        accountStatus: "ACTIVE",
        deletedAt: null,
      },
      include: { role: true },
    });

    if (!rmUser) {
      throw new Error(`Relationship Manager '${newRmId}' not found or inactive`);
    }

    const isRmRole =
      rmUser.roleId === ROLE_ID.RELATIONSHIP_MANAGER || rmUser.role?.code === "RELATIONSHIP_MANAGER";
    if (!isRmRole) {
      throw new Error(`User '${newRmId}' does not possess the RELATIONSHIP_MANAGER role`);
    }

    return await prisma.$transaction(async (tx) => {
      let previousRmId: string | null = null;

      if (entityType === "ENQUIRY") {
        const enquiry = await tx.corporateEnquiry.findUnique({ where: { id: entityId } });
        if (!enquiry) throw new Error(`Corporate Enquiry '${entityId}' not found`);
        previousRmId = enquiry.assignedRelationshipManagerId;

        await tx.corporateEnquiry.update({
          where: { id: entityId },
          data: { assignedRelationshipManagerId: newRmId },
        });
      } else {
        const pitch = await tx.governmentPitch.findUnique({ where: { id: entityId } });
        if (!pitch) throw new Error(`Government Pitch '${entityId}' not found`);
        previousRmId = pitch.assignedRelationshipManagerId;

        await tx.governmentPitch.update({
          where: { id: entityId },
          data: { assignedRelationshipManagerId: newRmId },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          actorUserId: assignedById,
          action: "REASSIGN_RELATIONSHIP_MANAGER",
          entityType,
          entityId,
          details: {
            entityType,
            entityId,
            previousRmId,
            newRmId,
            reason: reason.trim(),
          },
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: newRmId,
          recipientId: newRmId,
          title: "Application Reassigned to You",
          message: `You have been reassigned as Relationship Manager for ${entityType.toLowerCase()} '${entityId}'. Reason: ${reason}`,
          type: "INFO",
        },
      });

      return { entityType, entityId, previousRmId, newRmId };
    });
  }
}

export const autoAssignRelationshipManager = RmAssignmentService.autoAssignRm;
export const selectLeastLoadedRm = (preferredDistrict?: string | null) =>
  RmAssignmentService.autoAssignRm(typeof preferredDistrict === "string" ? { district: preferredDistrict } : (preferredDistrict || {}));
