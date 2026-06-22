import prisma from "../config/db";
import { CSRRequirement, Company, NGO, CSRCategory, PriorityLevel } from "@prisma/client";

export class CSRMatchingService {
  /**
   * Calculates matching score between a Company and a CSR Requirement
   * Scoring out of 100:
   * - Category alignment: 30 pts
   * - District/Location fit: 25 pts
   * - Budget fit: 20 pts
   * - Priority alignment: 10 pts
   * - Impact/Beneficiary reach fit: 15 pts
   */
  public static calculateCompanyRequirementMatch(company: any, requirement: any): { score: number; breakdown: any } {
    let score = 0;
    const breakdown = {
      categoryScore: 0,
      districtScore: 0,
      budgetScore: 0,
      priorityScore: 0,
      impactScore: 0
    };

    // 1. Category alignment (30 Points)
    const companyFocusAreas = (company.focusAreas || []).map((f: string) => f.toUpperCase());
    const reqCategory = requirement.category.toString().toUpperCase();
    if (companyFocusAreas.includes(reqCategory)) {
      breakdown.categoryScore = 30;
      score += 30;
    } else {
      // Partial match: check if any string matches
      const partialMatch = companyFocusAreas.some((f: string) => f.includes(reqCategory) || reqCategory.includes(f));
      if (partialMatch) {
        breakdown.categoryScore = 15;
        score += 15;
      }
    }

    // 2. District alignment (25 Points)
    const companyDistricts = (company.preferredDistricts || []).map((d: string) => d.toLowerCase());
    const reqDistrict = requirement.district.toLowerCase();
    if (companyDistricts.includes(reqDistrict)) {
      breakdown.districtScore = 25;
      score += 25;
    } else {
      // Check general office location from contactInfo
      const contactInfo = company.contactInfo as any;
      if (contactInfo?.district?.toLowerCase() === reqDistrict) {
        breakdown.districtScore = 15;
        score += 15;
      }
    }

    // 3. Budget fit (20 Points)
    const estimatedCost = Number(requirement.estimatedCost);
    const minBudget = company.preferredBudgetMin ? Number(company.preferredBudgetMin) : 0;
    const maxBudget = company.preferredBudgetMax ? Number(company.preferredBudgetMax) : Infinity;

    if (estimatedCost >= minBudget && estimatedCost <= maxBudget) {
      breakdown.budgetScore = 20;
      score += 20;
    } else if (estimatedCost <= maxBudget * 1.2 && estimatedCost >= minBudget * 0.8) {
      breakdown.budgetScore = 10;
      score += 10;
    }

    // 4. Priority alignment (10 Points)
    if (requirement.priorityLevel === PriorityLevel.CRITICAL) {
      breakdown.priorityScore = 10;
      score += 10;
    } else if (requirement.priorityLevel === PriorityLevel.HIGH) {
      breakdown.priorityScore = 8;
      score += 8;
    } else if (requirement.priorityLevel === PriorityLevel.MEDIUM) {
      breakdown.priorityScore = 5;
      score += 5;
    } else if (requirement.priorityLevel === PriorityLevel.LOW) {
      breakdown.priorityScore = 2;
      score += 2;
    }

    // 5. Impact / Beneficiary reach alignment (15 Points)
    const reach = requirement.beneficiaryCount || 0;
    if (reach >= 1000) {
      breakdown.impactScore = 15;
      score += 15;
    } else if (reach >= 500) {
      breakdown.impactScore = 12;
      score += 12;
    } else if (reach >= 100) {
      breakdown.impactScore = 8;
      score += 8;
    } else {
      breakdown.impactScore = 5;
      score += 5;
    }

    return { score, breakdown };
  }

  /**
   * Calculates matching score between an NGO and a CSR Requirement
   * Scoring out of 100:
   * - Sector/Category alignment: 30 pts
   * - Operation Area/District fit: 25 pts
   * - Estimated cost fit/NGO capacity: 20 pts
   * - NGO past track record: 15 pts
   * - Priority level: 10 pts
   */
  public static calculateNGORequirementMatch(ngo: any, requirement: any): { score: number; breakdown: any } {
    let score = 0;
    const breakdown = {
      sectorScore: 0,
      districtScore: 0,
      capacityScore: 0,
      trackRecordScore: 0,
      priorityScore: 0
    };

    // 1. Sector alignment (30 Points)
    const ngoSectors = (ngo.csrSectors || []).map((s: string) => s.toUpperCase());
    const reqCategory = requirement.category.toString().toUpperCase();
    if (ngoSectors.includes(reqCategory)) {
      breakdown.sectorScore = 30;
      score += 30;
    } else {
      const partialMatch = ngoSectors.some((s: string) => s.includes(reqCategory) || reqCategory.includes(s));
      if (partialMatch) {
        breakdown.sectorScore = 15;
        score += 15;
      }
    }

    // 2. District alignment (25 Points)
    const ngoDistricts = (ngo.areasOfOperation || []).map((d: string) => d.toLowerCase());
    const reqDistrict = requirement.district.toLowerCase();
    if (ngoDistricts.includes(reqDistrict) || ngo.district.toLowerCase() === reqDistrict) {
      breakdown.districtScore = 25;
      score += 25;
    }

    // 3. NGO Capacity for Cost (20 Points)
    // Estimate capacity based on average project size or establishment year
    const age = new Date().getFullYear() - (ngo.yearEstablished || new Date().getFullYear());
    const estimatedCost = Number(requirement.estimatedCost);

    if (estimatedCost <= 500000) {
      breakdown.capacityScore = 20; // easy for any NGO
      score += 20;
    } else if (estimatedCost <= 2500000) {
      breakdown.capacityScore = age >= 3 ? 20 : 12;
      score += breakdown.capacityScore;
    } else {
      breakdown.capacityScore = age >= 5 ? 20 : 8;
      score += breakdown.capacityScore;
    }

    // 4. Past Track Record (15 Points)
    const stats = ngo.impactStatistics as any;
    const completedCount = stats?.projectsCompleted || 0;
    if (completedCount >= 10) {
      breakdown.trackRecordScore = 15;
      score += 15;
    } else if (completedCount >= 5) {
      breakdown.trackRecordScore = 12;
      score += 12;
    } else if (completedCount > 0) {
      breakdown.trackRecordScore = 8;
      score += 8;
    } else {
      breakdown.trackRecordScore = 4;
      score += 4;
    }

    // 5. Priority Level (10 Points)
    if (requirement.priorityLevel === PriorityLevel.CRITICAL) {
      breakdown.priorityScore = 10;
      score += 10;
    } else if (requirement.priorityLevel === PriorityLevel.HIGH) {
      breakdown.priorityScore = 8;
      score += 8;
    } else if (requirement.priorityLevel === PriorityLevel.MEDIUM) {
      breakdown.priorityScore = 5;
      score += 5;
    } else {
      breakdown.priorityScore = 2;
      score += 2;
    }

    return { score, breakdown };
  }

  /**
   * Returns list of matching CSR Requirements for a Company
   */
  public static async getMatchesForCompany(companyId: string): Promise<any[]> {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error("Company not found");

    const requirements = await prisma.cSRRequirement.findMany({
      where: {
        status: {
          in: ["VERIFIED", "MARKETPLACE_LISTED", "NGO_APPLICATIONS_OPEN", "COMPANY_INTEREST_RECEIVED"]
        }
      }
    });

    const matches = requirements.map((req) => {
      const { score, breakdown } = this.calculateCompanyRequirementMatch(company, req);
      return {
        requirement: req,
        score,
        breakdown
      };
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Returns list of matching CSR Requirements for an NGO
   */
  public static async getMatchesForNGO(ngoId: string): Promise<any[]> {
    const ngo = await prisma.nGO.findUnique({ where: { id: ngoId } });
    if (!ngo) throw new Error("NGO not found");

    const requirements = await prisma.cSRRequirement.findMany({
      where: {
        status: {
          in: ["VERIFIED", "MARKETPLACE_LISTED", "NGO_APPLICATIONS_OPEN"]
        }
      }
    });

    const matches = requirements.map((req) => {
      const { score, breakdown } = this.calculateNGORequirementMatch(ngo, req);
      return {
        requirement: req,
        score,
        breakdown
      };
    });

    return matches.sort((a, b) => b.score - a.score);
  }
}
