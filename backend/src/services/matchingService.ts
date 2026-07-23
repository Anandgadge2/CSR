import prisma from "../config/db";

export interface CompanyPreferences {
  companyId?: string;
  organizationId?: string;
  focusAreas?: string[];
  districts?: string[];
  csrBudget?: number;
}

export async function findMatchesForCompany(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { csrCompanyProfile: true }
  });

  if (!organization) return [];

  const focusAreas = organization.csrCompanyProfile?.preferredSectors || [];
  const preferredDistricts = organization.csrCompanyProfile?.preferredDistricts || [];
  const csrBudget = Number(organization.csrCompanyProfile?.annualCsrBudget || 0);

  const projects = await prisma.project.findMany({
    where: {
      status: { in: ["APPROVED", "MARKETPLACE_LISTED"] }
    },
    include: {
      organization: true
    }
  });

  const matches = projects.map(project => {
    let score = 0;

    if (focusAreas.includes(project.sector)) {
      score += 40;
    }
    if (preferredDistricts.includes(project.district)) {
      score += 30;
    }

    const projectBudget = Number(project.approvedBudget || project.budgetRequested || 0);
    if (csrBudget > 0 && projectBudget <= csrBudget) {
      score += 30;
    }

    return {
      projectId: project.id,
      projectTitle: project.title,
      organizationId: project.organizationId,
      organizationName: project.organization.name,
      district: project.district,
      approvedBudget: project.approvedBudget,
      score
    };
  });

  const sortedMatches = matches.sort((a, b) => b.score - a.score);

  for (const match of sortedMatches) {
    await prisma.matchScore.upsert({
      where: { id: `${organizationId}_${match.projectId}` },
      create: {
        id: `${organizationId}_${match.projectId}`,
        organizationId,
        projectId: match.projectId,
        score: match.score
      },
      update: {
        score: match.score
      }
    }).catch(() => {});
  }

  return sortedMatches;
}

export const CSRMatchingService = {
  getMatchesForCompany: findMatchesForCompany,
  getMatchesForNGO: findMatchesForCompany
};

export const MatchingService = CSRMatchingService;
