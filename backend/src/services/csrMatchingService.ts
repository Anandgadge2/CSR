import prisma from "../config/db";

export class CSRMatchingService {
  public static calculateCompanyRequirementMatch(organization: any, project: any): { score: number; breakdown: any } {
    let score = 0;
    const breakdown = {
      categoryScore: 0,
      districtScore: 0,
      budgetScore: 0,
      priorityScore: 0,
      impactScore: 0
    };

    const focusAreas = organization?.csrCompanyProfile?.preferredSectors || [];
    if (focusAreas.includes(project.sector)) {
      breakdown.categoryScore = 40;
      score += 40;
    }

    const preferredDistricts = organization?.csrCompanyProfile?.preferredDistricts || [];
    if (preferredDistricts.includes(project.district)) {
      breakdown.districtScore = 30;
      score += 30;
    }

    const approvedBudget = Number(project.approvedBudget || 0);
    const annualBudget = Number(organization?.csrCompanyProfile?.annualCsrBudget || 0);
    if (annualBudget > 0 && approvedBudget <= annualBudget) {
      breakdown.budgetScore = 30;
      score += 30;
    }

    return { score, breakdown };
  }

  public static async getMatchingRequirementsForCompany(companyId: string) {
    const company = await prisma.organization.findUnique({
      where: { id: companyId },
      include: { csrCompanyProfile: true }
    });
    if (!company) return [];

    const projects = await prisma.project.findMany({
      where: { status: { in: ["APPROVED", "MARKETPLACE_LISTED"] } }
    });

    const matches = projects.map(p => {
      const match = this.calculateCompanyRequirementMatch(company, p);
      return { project: p, score: match.score, breakdown: match.breakdown };
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  public static async getMatchingRequirementsForNgo(ngoId: string) {
    const ngo = await prisma.organization.findUnique({
      where: { id: ngoId },
      include: { ngoProfile: true }
    });
    if (!ngo) return [];

    const projects = await prisma.project.findMany({
      where: { status: { in: ["APPROVED", "MARKETPLACE_LISTED"] } }
    });

    const matches = projects.map(p => {
      const match = this.calculateCompanyRequirementMatch(ngo, p);
      return { project: p, score: match.score, breakdown: match.breakdown };
    });

    return matches.sort((a, b) => b.score - a.score);
  }
}
