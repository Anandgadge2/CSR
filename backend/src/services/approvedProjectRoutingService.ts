import prisma from "../config/db";
import { randomUUID } from "crypto";
import { ROLE_ID } from "../types/role";
import { dispatchNotification, dispatchToContact } from "./notificationOrchestrator";

type ApprovedProjectInput = {
  assessmentId: string;
  actorUserId: string;
};

const projectCode = () => `PRJ-MH-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

/**
 * Creates the single approved project for an enquiry and routes it to every
 * target district's DNC plus the target Government Department Admin.  The
 * database constraints make duplicate JS submissions idempotent.
 */
export async function routeApprovedCorporateEnquiry(input: ApprovedProjectInput) {
  const assessment = await prisma.feasibilityAssessment.findUnique({ where: { id: input.assessmentId } });
  if (!assessment) throw new Error("Feasibility assessment not found");

  const districts = [...new Set(assessment.targetDistricts.map((district) => district.trim()).filter(Boolean))];
  if (!assessment.targetDepartmentId || districts.length === 0) {
    throw new Error("A target Government Department and at least one target district are required before approval.");
  }

  const existing = await prisma.project.findUnique({
    where: { approvalSourceEnquiryId: assessment.enquiryId },
    include: { districtDncAssignments: true }
  });
  if (existing) return { project: existing, created: false, dncAssignments: existing.districtDncAssignments };

  const [enquiry, department, dncMappings, departmentAdmin] = await Promise.all([
    prisma.corporateEnquiry.findUnique({ where: { id: assessment.enquiryId } }),
    prisma.organization.findFirst({
      where: { id: assessment.targetDepartmentId, kind: "GOVERNMENT_DEPARTMENT", status: "ACTIVE" },
      select: { id: true, name: true }
    }),
    prisma.districtDncAssignment.findMany({
      where: { district: { in: districts }, isActive: true, dncUser: { roleId: ROLE_ID.DISTRICT_NODAL_CONSULTANT, accountStatus: "ACTIVE", isVerified: true } },
      include: { dncUser: { select: { id: true, email: true } } }
    }),
    prisma.user.findFirst({
      where: { organizationId: assessment.targetDepartmentId, roleId: ROLE_ID.GOVERNMENT_OFFICER, accountStatus: "ACTIVE", isVerified: true },
      select: { id: true, email: true }
    })
  ]);

  if (!enquiry) throw new Error("Corporate enquiry not found");
  if (!department) throw new Error("The selected Government Department is not Super-Admin approved.");
  const dncByDistrict = new Map(dncMappings.map((mapping) => [mapping.district, mapping]));
  const unmappedDistricts = districts.filter((district) => !dncByDistrict.has(district));
  if (unmappedDistricts.length) {
    throw new Error(`No active DNC is configured for: ${unmappedDistricts.join(", ")}. Configure the district before approving.`);
  }
  if (!departmentAdmin) throw new Error("The selected Government Department has no active Department Admin.");

  const firstDistrict = districts[0];
  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        projectCode: projectCode(),
        type: "CONVERGENCE_FRAMEWORK",
        title: `${enquiry.corporateName} CSR convergence project`,
        description: enquiry.proposedCSRWork || `CSR convergence project initiated from enquiry ${enquiry.trackingId}.`,
        sector: enquiry.sector || "General CSR",
        district: firstDistrict,
        taluka: enquiry.preferredTalukas[0] || "To be confirmed",
        approvedBudget: enquiry.indicativeBudget || 0,
        organizationId: department.id,
        corporatePartnerId: enquiry.organizationId,
        approvalSourceEnquiryId: enquiry.id,
        status: "APPROVED"
      }
    });

    await tx.projectDistrictDncAssignment.createMany({
      data: districts.map((district) => ({
        projectId: created.id,
        district,
        dncUserId: dncByDistrict.get(district)!.dncUserId,
        assignedById: input.actorUserId,
        status: "ACTIVE"
      }))
    });

    await tx.projectAssignment.createMany({
      data: [
        ...districts.map((district) => ({
          entityType: "PROJECT",
          entityId: created.id,
          assignmentType: "DISTRICT_NODAL_CONSULTANT",
          assignedById: input.actorUserId,
          assignedToId: dncByDistrict.get(district)!.dncUserId,
          assignedRoleId: ROLE_ID.DISTRICT_NODAL_CONSULTANT,
          status: "ACTIVE"
        })),
        {
          entityType: "PROJECT",
          entityId: created.id,
          assignmentType: "GOVERNMENT_DEPARTMENT_ADMIN",
          assignedById: input.actorUserId,
          assignedToId: departmentAdmin.id,
          assignedRoleId: ROLE_ID.GOVERNMENT_OFFICER,
          status: "ACTIVE"
        }
      ]
    });

    await tx.corporateEnquiry.update({ where: { id: enquiry.id }, data: { status: "JS_APPROVED" } });
    return created;
  });

  const dncUserIds = dncMappings.map((mapping) => mapping.dncUserId);
  await Promise.all([
    ...dncUserIds.map((recipientId) => dispatchNotification({
      recipientId,
      templateName: "PROJECT_DNC_ASSIGNED",
      channels: ["IN_APP", "SOCKET", "EMAIL", "SMS"],
      variables: { title: "Project assigned", message: `${project.projectCode} requires district coordination.`, currentStatus: project.status },
      actionButtonUrl: `/projects/${project.id}`,
      correlationId: project.id,
      notificationType: "PROJECT_DNC_ASSIGNED"
    })),
    dispatchNotification({
      recipientId: departmentAdmin.id,
      templateName: "PROJECT_DEPARTMENT_ADMIN_ASSIGNED",
      channels: ["IN_APP", "SOCKET", "EMAIL", "SMS"],
      variables: { title: "Assign DNOs", message: `${project.projectCode} is assigned to your department. Assign one or more DNOs.`, currentStatus: project.status },
      actionButtonUrl: `/projects/${project.id}`,
      correlationId: project.id,
      notificationType: "PROJECT_DEPARTMENT_ADMIN_ASSIGNED"
    }),
    dispatchToContact({
      referenceId: enquiry.trackingId || enquiry.id,
      email: enquiry.contactEmail,
      phone: enquiry.mobile,
      title: "Joint Secretary decision recorded",
      message: `Your application ${enquiry.trackingId || enquiry.id} has been approved. Project ${project.projectCode} is being routed for district execution.`,
      trackingId: enquiry.trackingId || undefined,
      currentStatus: "JS_APPROVED",
      actionButtonUrl: `/track?trackingId=${encodeURIComponent(enquiry.trackingId || enquiry.id)}`,
      correlationId: project.id,
      notificationType: "JS_DECISION"
    })
  ]);

  return { project, created: true, dncAssignments: dncMappings.map(({ district, dncUserId }) => ({ district, dncUserId })), departmentAdminId: departmentAdmin.id };
}
