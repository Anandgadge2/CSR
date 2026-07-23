import prisma from "../config/db";
import { generateProjectTrackingId } from "./trackingIdService";

type OnboardInput = {
  organizationId: string;
  title: string;
  description: string;
  sector: string;
  district: string;
  taluka: string;
  approvedBudget: number;
  actorUserId?: string;
};

export async function onboardApprovedAssessmentToProject(input: OnboardInput) {
  const projectCode = await generateProjectTrackingId();

  const project = await prisma.project.create({
    data: {
      projectCode,
      title: input.title,
      description: input.description,
      sector: input.sector,
      district: input.district,
      taluka: input.taluka,
      approvedBudget: input.approvedBudget,
      type: "CONVERGENCE_FRAMEWORK",
      organizationId: input.organizationId,
      status: "APPROVED"
    }
  });

  const mouReferenceId = `MOU-MH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const mou = await prisma.standardMou.create({
    data: {
      mouReferenceId,
      projectId: project.id,
      financialContribution: input.approvedBudget,
      projectTitle: input.title,
      projectDescription: input.description,
      status: "DRAFT"
    }
  });

  return { status: "CREATED", project, mou };
}
