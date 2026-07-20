import { Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import {
  AssignmentError,
  ENTITY_TYPES,
  AssignmentEntityType,
  assignExistingOfficer,
  createAndAssignNewOfficer,
  findActiveNodalOfficer,
  getAssignableRoles,
  resolveEntityContext,
  searchOfficers
} from "../services/assignmentService";
import { InvitationError } from "../services/invitationService";
import { resumePendingAssignments, recordNodalOfficerAssignment } from "../services/assignmentWorkflowService";
import { maharashtraDistricts } from "../utils/maharashtraData";
import { ROLE_SLUG } from "../types/role";
import { getInstanceForEntity } from "../services/workflowEngineService";
import { auditLog } from "../services/notificationService";
import { successResponse, errorResponse, createdResponse } from "../utils/apiResponse";

const handleKnownError = (res: Response, error: unknown): Response | null => {
  if (error instanceof AssignmentError || error instanceof InvitationError) {
    return errorResponse(res, error.message, (error as any).status || 400);
  }
  return null;
};

const parseEntityType = (value: string): AssignmentEntityType => {
  const entityType = (value || "").toUpperCase() as AssignmentEntityType;
  if (!ENTITY_TYPES.includes(entityType)) {
    throw new AssignmentError(`Unsupported entity type '${value}'`, 400);
  }
  return entityType;
};

/**
 * GET /api/assignments/context/:entityType/:entityId
 * Everything the "Assign Officer" page needs: entity summary, district,
 * current workflow stage, existing assignments, and nodal officer.
 */
export const getAssignmentContext = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entityType = parseEntityType(req.params.entityType);
    const { entityId } = req.params;

    const context = await resolveEntityContext(entityType, entityId);

    const [instance, assignments, nodalOfficer] = await Promise.all([
      getInstanceForEntity(entityId, entityType),
      prisma.projectAssignment.findMany({
        where: { entityType, entityId },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              accountStatus: true,
              officerProfile: { select: { fullName: true, designation: true, department: true, mobile: true } }
            }
          },
          assignedRole: { select: { id: true, name: true } }
        },
        orderBy: { assignedAt: "desc" }
      }),
      findActiveNodalOfficer(context.district)
    ]);

    return successResponse(res, {
      entityType,
      entityId,
      title: context.title,
      reference: context.reference,
      district: context.district,
      currentStage: instance?.currentStage?.name || null,
      workflowDefinition: instance?.definition?.name || null,
      assignments,
      nodalOfficer: nodalOfficer
        ? { id: nodalOfficer.id, email: nodalOfficer.email }
        : null
    });
  } catch (error) {
    const handled = handleKnownError(res, error);
    if (handled) return handled;
    console.error("getAssignmentContext error:", error);
    return errorResponse(res, "Failed to load assignment context", 500);
  }
};

/**
 * GET /api/assignments/officers/search?q=&district=
 * Option A — searchable existing-officer list (name/email/mobile/employeeId/
 * department/designation).
 */
export const searchOfficersHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const district = typeof req.query.district === "string" ? req.query.district : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const officers = await searchOfficers({ q, district, limit });
    return successResponse(res, { officers, count: officers.length });
  } catch (error) {
    const handled = handleKnownError(res, error);
    if (handled) return handled;
    console.error("searchOfficers error:", error);
    return errorResponse(res, "Failed to search officers", 500);
  }
};

/**
 * GET /api/assignments/roles
 * Dynamic assignable-role dropdown — no hardcoded role names anywhere.
 */
export const getAssignableRolesHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roles = await getAssignableRoles({
      organizationId: req.user?.organizationId || null,
      companyId: req.user?.companyId || null
    });
    return successResponse(res, { roles });
  } catch (error) {
    const handled = handleKnownError(res, error);
    if (handled) return handled;
    console.error("getAssignableRoles error:", error);
    return errorResponse(res, "Failed to load assignable roles", 500);
  }
};

/**
 * POST /api/assignments
 * Option A — assign an existing officer.
 * Body: { entityType, entityId, assignedToId, assignedRoleId?, remarks? }
 */
export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);
    const { entityType, entityId, assignedToId, assignedRoleId, assignmentType, remarks } = req.body || {};

    if (!entityType || !entityId || !assignedToId) {
      return errorResponse(res, "entityType, entityId and assignedToId are required", 422);
    }

    const result = await assignExistingOfficer({
      entityType: parseEntityType(entityType),
      entityId,
      assignedToId,
      assignedRoleId: assignedRoleId || null,
      assignmentType,
      remarks: remarks || null,
      assignedById: req.user.id,
      assignerRole: req.user.role as string | null,
      organizationId: req.user?.organizationId || null,
      companyId: req.user.companyId || null,
      ipAddress: req.ip
    });

    return createdResponse(res, result, "Officer assigned successfully");
  } catch (error) {
    const handled = handleKnownError(res, error);
    if (handled) return handled;
    console.error("createAssignment error:", error);
    return errorResponse(res, "Failed to assign officer", 500);
  }
};

/**
 * POST /api/assignments/officers
 * Option B — create a NEW officer + assign. Sends activation invitation;
 * never emails a password.
 */
export const createOfficerAndAssign = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);
    const {
      fullName, email, mobile, designation, department, employeeId,
      officeAddress, district, taluka, block, office, remarks,
      roleId, entityType, entityId
    } = req.body || {};

    const missing = [
      ["fullName", fullName], ["email", email], ["mobile", mobile],
      ["designation", designation], ["department", department],
      ["district", district], ["roleId", roleId],
      ["entityType", entityType], ["entityId", entityId]
    ].filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      return errorResponse(res, `Missing required fields: ${missing.join(", ")}`, 422);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse(res, "Invalid email address", 422);
    }
    if (!/^\+?[0-9\s-]{10,15}$/.test(mobile)) {
      return errorResponse(res, "Invalid mobile number", 422);
    }

    const result = await createAndAssignNewOfficer({
      fullName, email: String(email).toLowerCase().trim(), mobile,
      designation, department,
      employeeId: employeeId || null,
      officeAddress: officeAddress || null,
      district, taluka: taluka || null, block: block || null, office: office || null,
      remarks: remarks || null,
      roleId,
      entityType: parseEntityType(entityType),
      entityId,
      assignedById: req.user.id,
      assignerRole: req.user.role as string | null,
      organizationId: req.user?.organizationId || null,
      companyId: req.user.companyId || null,
      ipAddress: req.ip
    });

    return createdResponse(res, result, "Officer created and invitation sent");
  } catch (error) {
    const handled = handleKnownError(res, error);
    if (handled) return handled;
    console.error("createOfficerAndAssign error:", error);
    return errorResponse(res, "Failed to create officer", 500);
  }
};

/**
 * GET /api/assignments/mine
 * Assignments for the logged-in user (Field Officer / Nodal dashboards).
 */
export const getMyAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);

    const assignments = await prisma.projectAssignment.findMany({
      where: { assignedToId: req.user.id, status: { in: ["ACTIVE", "PENDING_ACTIVATION"] } },
      include: {
        assignedBy: { select: { id: true, email: true, officerProfile: { select: { fullName: true } } } },
        assignedRole: { select: { id: true, name: true } }
      },
      orderBy: { assignedAt: "desc" }
    });

    // Attach entity summaries (title / reference / district / stage)
    const enriched = await Promise.all(
      assignments.map(async (assignment) => {
        try {
          const context = await resolveEntityContext(assignment.entityType, assignment.entityId);
          const instance = await getInstanceForEntity(assignment.entityId, assignment.entityType);
          return {
            ...assignment,
            entity: {
              title: context.title,
              reference: context.reference,
              district: context.district,
              currentStage: instance?.currentStage?.name || null
            }
          };
        } catch {
          return { ...assignment, entity: null };
        }
      })
    );

    return successResponse(res, { assignments: enriched });
  } catch (error) {
    console.error("getMyAssignments error:", error);
    return errorResponse(res, "Failed to load assignments", 500);
  }
};

/**
 * GET /api/assignments/status/:entityType/:entityId
 * Workflow stage + full history timeline for an entity.
 */
export const getWorkflowStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const entityType = parseEntityType(req.params.entityType);
    const { entityId } = req.params;

    const instance = await getInstanceForEntity(entityId, entityType);
    if (!instance) {
      return successResponse(res, { instance: null, history: [] });
    }

    const history = await prisma.workflowHistory.findMany({
      where: { instanceId: instance.id },
      include: {
        fromStage: { select: { name: true } },
        toStage: { select: { name: true } },
        actionPerformedByUser: { select: { id: true, email: true, officerProfile: { select: { fullName: true } } } }
      },
      orderBy: { actionPerformedAt: "asc" }
    });

    return successResponse(res, {
      instance: {
        id: instance.id,
        definition: instance.definition?.name,
        currentStage: instance.currentStage?.name,
        status: instance.status
      },
      history
    });
  } catch (error) {
    const handled = handleKnownError(res, error);
    if (handled) return handled;
    console.error("getWorkflowStatus error:", error);
    return errorResponse(res, "Failed to load workflow status", 500);
  }
};

/**
 * POST /api/admin/district-nodal-mappings
 * Map a nodal officer to a district. Auto-resumes any approved projects
 * parked waiting for a nodal officer in that district.
 */
export const createDistrictNodalMapping = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);
    const { district, userId, domain } = req.body || {};
    if (!district || !userId) {
      return errorResponse(res, "district and userId are required", 422);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, accountStatus: true }
    });
    if (!user) return errorResponse(res, "User not found", 404);
    if (user.accountStatus !== "ACTIVE") {
      return errorResponse(res, "User account must be active to receive a district mapping", 422);
    }

    const mapping = await prisma.$transaction(async (tx) => {
      // Deactivate previous mapping(s) for the district+domain
      await tx.districtNodalMapping.updateMany({
        where: { district, domain: domain || null, isActive: true },
        data: { isActive: false }
      });
      return tx.districtNodalMapping.create({
        data: {
          district,
          domain: domain || null,
          userId,
          isActive: true,
          assignedById: req.user!.id
        }
      });
    });

    await auditLog(
      req.user.id,
      "DISTRICT_NODAL_MAPPING_CREATED",
      { district, userId, mappingId: mapping.id },
      req.ip
    );

    // Auto-resume any workflows parked at NODAL_OFFICER_ASSIGNMENT for this district
    const resumed = await resumePendingAssignments(district, userId).catch((error) => {
      console.error("resumePendingAssignments error:", error);
      return 0;
    });

    return createdResponse(res, { mapping, resumedAssignments: resumed }, "District nodal mapping created");
  } catch (error) {
    console.error("createDistrictNodalMapping error:", error);
    return errorResponse(res, "Failed to create district mapping", 500);
  }
};

/**
 * GET /api/assignments/districts
 * Canonical Maharashtra district list for the JS assignment cascade.
 * Districts are free-string values portal-wide; this is the authoritative list.
 */
export const listDistrictsHandler = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const districts = maharashtraDistricts.map((d) => d.district);
    return successResponse(res, { districts }, "Districts retrieved");
  } catch (error) {
    console.error("listDistrictsHandler error:", error);
    return errorResponse(res, "Failed to load districts", 500);
  }
};

/**
 * GET /api/assignments/nodal-consultants?district=Pune
 * District Nodal Consultants available for a district — the second step of the
 * JS assignment cascade. A DNC is a user with role slug district-nodal-consultant
 * that is active in the district via an active DistrictNodalMapping (preferred)
 * or a matching User.assignedDistrict (fallback). Organisation is display-only.
 */
export const listNodalConsultantsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const district = String(req.query.district || "").trim();
    if (!district) return errorResponse(res, "district query parameter is required", 422);

    const consultants = await prisma.user.findMany({
      where: {
        accountStatus: "ACTIVE",
        roleRelation: { slug: ROLE_SLUG.DISTRICT_NODAL_CONSULTANT },
        OR: [
          { nodalDistrictMappings: { some: { district, isActive: true } } },
          { assignedDistrict: district }
        ]
      },
      select: {
        id: true,
        email: true,
        assignedDistrict: true,
        officerProfile: { select: { fullName: true, designation: true, department: true } },
        organizationId: true
      }
    });

    return successResponse(res, { district, consultants }, "Nodal consultants retrieved");
  } catch (error) {
    console.error("listNodalConsultantsHandler error:", error);
    return errorResponse(res, "Failed to load nodal consultants", 500);
  }
};

/**
 * POST /api/assignments/appoint-nodal-consultant
 * JS appoints a District Nodal Consultant to an approved enquiry/pitch.
 * body: { entityType, entityId, nodalOfficerId, district, remarks? }
 * Ensures the DNC↔district mapping exists (creating it if needed), then records
 * the nodal-officer assignment (workflow → FIELD_OFFICER_ASSIGNMENT, notify, SLA).
 */
export const appointNodalConsultantHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return errorResponse(res, "Unauthorized", 401);
    const { entityType: rawType, entityId, nodalOfficerId, district, remarks } = req.body || {};
    if (!entityId || !nodalOfficerId || !district) {
      return errorResponse(res, "entityType, entityId, nodalOfficerId and district are required", 422);
    }
    const entityType = parseEntityType(rawType);

    const consultant = await prisma.user.findFirst({
      where: {
        id: nodalOfficerId,
        accountStatus: "ACTIVE",
        roleRelation: { slug: ROLE_SLUG.DISTRICT_NODAL_CONSULTANT }
      },
      select: { id: true }
    });
    if (!consultant) {
      return errorResponse(res, "Selected user is not an active District Nodal Consultant", 422);
    }

    // Ensure an active DNC↔district mapping exists so future auto-resume works.
    const existingMapping = await prisma.districtNodalMapping.findFirst({
      where: { district, userId: nodalOfficerId, isActive: true }
    });
    if (!existingMapping) {
      await prisma.districtNodalMapping.create({
        data: { district, userId: nodalOfficerId, isActive: true, assignedById: req.user.id }
      });
    }

    await recordNodalOfficerAssignment({
      entityType,
      entityId,
      nodalOfficerId,
      assignedById: req.user.id,
      remarks: remarks || null,
      ipAddress: req.ip
    });

    return successResponse(res, { entityType, entityId, nodalOfficerId }, "District Nodal Consultant appointed");
  } catch (error) {
    const handled = handleKnownError(res, error);
    if (handled) return handled;
    console.error("appointNodalConsultantHandler error:", error);
    return errorResponse(res, "Failed to appoint nodal consultant", 500);
  }
};
