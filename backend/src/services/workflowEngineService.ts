import prisma from "../config/db";
import { isSystemUser } from "./systemUserService";
import { resolveUserPermission } from "./permissionService";

export interface WorkflowTransitionPayload {
  entityType: string;
  entityId: string;
  toStage: string;
  userId: string;
  remarks?: string;
  entityData?: Record<string, any>;
}

export async function transitionWorkflow(payload: WorkflowTransitionPayload): Promise<void> {
  const instance = await prisma.workflowInstance.findFirst({
    where: {
      entityType: payload.entityType,
      entityId: payload.entityId
    }
  });

  if (!instance) {
    await prisma.workflowInstance.create({
      data: {
        entityType: payload.entityType,
        entityId: payload.entityId,
        currentStage: payload.toStage,
        currentStageId: payload.toStage,
        definitionId: "default"
      }
    });

    await prisma.workflowHistory.create({
      data: {
        instanceId: payload.entityId,
        fromStage: "DRAFT",
        fromStageId: "DRAFT",
        toStage: payload.toStage,
        toStageId: payload.toStage,
        actionByUserId: payload.userId,
        note: payload.remarks || "Initial workflow state"
      }
    });

    return;
  }

  if (instance.currentStage === payload.toStage) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.workflowInstance.update({
      where: { id: instance.id },
      data: {
        currentStage: payload.toStage,
        currentStageId: payload.toStage
      }
    });

    await tx.workflowHistory.create({
      data: {
        instanceId: instance.id,
        fromStage: instance.currentStage,
        fromStageId: instance.currentStage,
        toStage: payload.toStage,
        toStageId: payload.toStage,
        actionByUserId: payload.userId,
        note: payload.remarks || null
      }
    });
  });
}
