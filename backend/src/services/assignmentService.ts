import prisma from "../config/db";
import { ROLE_ID } from "../types/role";

export class AssignmentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function resolveEntityContext(entityType: string, entityId: string) {
  if (entityType === "CONVERGENCE_PROJECT" || entityType === "PROJECT") {
    const project = await prisma.project.findUnique({
      where: { id: entityId },
      select: { id: true, projectCode: true, title: true, district: true, sector: true, status: true }
    });
    if (!project) throw new AssignmentError("Project not found", 404);
    return { district: project.district, title: project.title, reference: project.projectCode, entity: project };
  }

  if (entityType === "CORPORATE_ENQUIRY") {
    const enquiry = await prisma.corporateEnquiry.findUnique({
      where: { id: entityId },
      select: { id: true, trackingId: true, corporateName: true, status: true }
    });
    if (!enquiry) throw new AssignmentError("Enquiry not found", 404);
    return { district: "Maharashtra", title: enquiry.corporateName, reference: enquiry.trackingId, entity: enquiry };
  }

  if (entityType === "GOVERNMENT_PITCH") {
    const pitch = await prisma.governmentPitch.findUnique({
      where: { id: entityId },
      select: { id: true, pitchReferenceId: true, title: true, status: true }
    });
    if (!pitch) throw new AssignmentError("Pitch not found", 404);
    return { district: "Maharashtra", title: pitch.title, reference: pitch.pitchReferenceId, entity: pitch };
  }

  throw new AssignmentError(`Unsupported entity type: ${entityType}`, 400);
}

export async function findActiveNodalOfficer(district: string) {
  const mapping = await prisma.districtNodalMapping.findFirst({
    where: { district, isActive: true, user: { accountStatus: "ACTIVE" } },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
  if (mapping) return mapping.user;

  return prisma.user.findFirst({
    where: {
      accountStatus: "ACTIVE",
      roleId: ROLE_ID.DISTRICT_NODAL_OFFICER
    },
    select: { id: true, email: true }
  });
}

export async function assignOfficerToProject(input: {
  entityType: string;
  entityId: string;
  assignedToId: string;
  assignedById: string;
  assignedRoleId?: number;
  assignmentType?: string;
}) {
  const assignment = await prisma.projectAssignment.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      assignmentType: input.assignmentType || "FIELD_OFFICER",
      assignedById: input.assignedById,
      assignedToId: input.assignedToId,
      assignedRoleId: input.assignedRoleId || null,
      status: "ACTIVE"
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: input.assignedById,
      userId: input.assignedById,
      action: "PROJECT_ASSIGNMENT_CREATED",
      entityType: input.entityType,
      entityId: input.entityId,
      details: { assignedToId: input.assignedToId }
    }
  });

  return assignment;
}

export async function searchOfficers(params: { q?: string; district?: string; limit?: number }) {
  const q = params.q?.trim();
  const take = Math.min(params.limit || 20, 50);

  return prisma.user.findMany({
    where: {
      accountStatus: { in: ["ACTIVE", "PENDING_ACTIVATION"] },
      ...(params.district
        ? { officerProfile: { district: params.district } }
        : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { officerProfile: { fullName: { contains: q, mode: "insensitive" } } },
              { officerProfile: { mobile: { contains: q } } },
              { officerProfile: { employeeId: { contains: q, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    select: {
      id: true,
      email: true,
      accountStatus: true,
      role: { select: { id: true, name: true } },
      officerProfile: {
        select: {
          fullName: true, mobile: true, employeeId: true, designation: true,
          department: true, district: true, taluka: true
        }
      }
    },
    take,
    orderBy: { createdAt: "desc" }
  });
}

export async function getAssignableRoles(params: { organizationId?: string | null }) {
  return prisma.role.findMany({
    where: {
      isSystemRole: false,
      ...(params.organizationId ? { organizationId: params.organizationId } : {})
    }
  });
}
