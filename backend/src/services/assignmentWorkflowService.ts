import prisma from "../config/db";
import { auditLog, notify } from "./notificationService";
import { transitionWorkflow } from "./workflowEngineService";
import { ROLE_ID } from "../types/role";

export interface JsApprovalTriggerInput {
  entityType: "CORPORATE_ENQUIRY" | "GOVERNMENT_PITCH";
  entityId: string;
  approvedById: string;
  remarks?: string | null;
  ipAddress?: string;
}

export async function onProjectApprovedByJS(input: JsApprovalTriggerInput): Promise<void> {
  await transitionWorkflow({
    entityType: input.entityType,
    entityId: input.entityId,
    toStage: "APPROVED",
    userId: input.approvedById,
    remarks: input.remarks || undefined
  });

  await auditLog(
    input.approvedById,
    "PROJECT_JS_APPROVED",
    { entityType: input.entityType, entityId: input.entityId, remarks: input.remarks },
    input.ipAddress
  );
}

export async function assignProjectNodalOfficer(input: {
  projectId: string;
  nodalOfficerUserId: string;
  assignedById: string;
}) {
  const project = await prisma.project.update({
    where: { id: input.projectId },
    data: { nodalOfficerUserId: input.nodalOfficerUserId }
  });

  await notify(
    input.nodalOfficerUserId,
    "Assigned as Nodal Officer",
    `You have been assigned as the nodal officer for project: ${project.title}`
  );

  return project;
}
