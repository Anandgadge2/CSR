/**
 * 13-Point Feasibility Assessment Checklist
 * Maharashtra CSR Portal - Convergence Framework
 * 
 * These items must be seeded into the database for all feasibility assessments
 * Critical items (1-7, 12, 13) must all be YES or applicable NA for approval
 */

export interface FeasibilityChecklistSeedItem {
  itemNumber: number;
  dimension: string;
  checkText: string;
  isCritical: boolean;
}

export const FEASIBILITY_CHECKLIST_SEED: FeasibilityChecklistSeedItem[] = [
  {
    itemNumber: 1,
    dimension: "CSR Compliance",
    checkText: "Activity falls within Schedule VII of the Companies Act.",
    isCritical: true,
  },
  {
    itemNumber: 2,
    dimension: "CSR Compliance",
    checkText: "Not a prohibited CSR activity.",
    isCritical: true,
  },
  {
    itemNumber: 3,
    dimension: "Need Verification",
    checkText: "Addresses a genuine, verified development need.",
    isCritical: true,
  },
  {
    itemNumber: 4,
    dimension: "Need Verification",
    checkText: "Does not duplicate an existing government scheme or ongoing project in same location.",
    isCritical: true,
  },
  {
    itemNumber: 5,
    dimension: "Site Readiness",
    checkText: "For construction/renovation: site/land is available, clear, and in government ownership/control.",
    isCritical: true,
  },
  {
    itemNumber: 6,
    dimension: "Site Readiness",
    checkText: "Required permissions/clearances are obtainable within reasonable time.",
    isCritical: true,
  },
  {
    itemNumber: 7,
    dimension: "Site Readiness",
    checkText: "Required government support/personnel/access is confirmed.",
    isCritical: true,
  },
  {
    itemNumber: 8,
    dimension: "Financial Viability",
    checkText: "Indicative budget is adequate for proposed scope.",
    isCritical: false,
  },
  {
    itemNumber: 9,
    dimension: "Financial Viability",
    checkText: "Cost estimate is realistic and benchmarked.",
    isCritical: false,
  },
  {
    itemNumber: 10,
    dimension: "Execution Capacity",
    checkText: "Implementing capacity exists.",
    isCritical: false,
  },
  {
    itemNumber: 11,
    dimension: "Execution Capacity",
    checkText: "Timeline is realistic.",
    isCritical: false,
  },
  {
    itemNumber: 12,
    dimension: "Sustainability",
    checkText: "Post-completion ownership of the asset is clear.",
    isCritical: true,
  },
  {
    itemNumber: 13,
    dimension: "Sustainability",
    checkText: "Maintenance / recurring-cost responsibility is identified.",
    isCritical: true,
  },
];

/**
 * Validation logic for feasibility assessment
 * All critical checks must be YES (or applicable NA where allowed)
 */
export function validateFeasibilityChecklist(
  checklistItems: { itemNumber: number; answer: string; isCritical: boolean }[]
): {
  isValid: boolean;
  result: "FEASIBLE" | "PROCEED_WITH_CONDITIONS" | "NOT_FEASIBLE" | "INCOMPLETE";
  criticalFailures: number[];
  nonCriticalNoCount: number;
  message: string;
} {
  const criticalItems = checklistItems.filter((item) => item.isCritical);
  const nonCriticalItems = checklistItems.filter((item) => !item.isCritical);

  // Check if all items are answered
  const unansweredItems = checklistItems.filter(
    (item) => !item.answer || item.answer === ""
  );
  if (unansweredItems.length > 0) {
    return {
      isValid: false,
      result: "INCOMPLETE",
      criticalFailures: [],
      nonCriticalNoCount: 0,
      message: `All 13 checklist items must be answered. Missing: ${unansweredItems
        .map((i) => i.itemNumber)
        .join(", ")}`,
    };
  }

  // Check critical items - must all be YES (NA only allowed where explicitly permitted)
  const criticalNoItems = criticalItems.filter(
    (item) => item.answer === "NO" || item.answer === "NA"
  );
  const criticalFailures = criticalNoItems.map((item) => item.itemNumber);

  // Count non-critical NO answers
  const nonCriticalNoCount = nonCriticalItems.filter(
    (item) => item.answer === "NO"
  ).length;

  // Decision logic
  if (criticalFailures.length > 0) {
    return {
      isValid: false,
      result: "NOT_FEASIBLE",
      criticalFailures,
      nonCriticalNoCount,
      message: `Critical checks failed for items: ${criticalFailures.join(
        ", ")}. Project cannot proceed.`,
    };
  }

  if (nonCriticalNoCount > 0) {
    return {
      isValid: true,
      result: "PROCEED_WITH_CONDITIONS",
      criticalFailures: [],
      nonCriticalNoCount,
      message: `All critical checks passed. ${nonCriticalNoCount} non-critical items need attention. Proceed with conditions.`,
    };
  }

  return {
    isValid: true,
    result: "FEASIBLE",
    criticalFailures: [],
    nonCriticalNoCount: 0,
    message: "All 13 checklist items passed. Project is feasible.",
  };
}

/**
 * SLA Timeframes for Maharashtra CSR Portal
 * All times in business days
 */
export const SLA_TIMEFRAMES = {
  // Corporate Enquiry Flow (PDF SLA table)
  RM_RESPONSE: 5, // Days for RM to first contact
  JS_DECISION: 5, // Days for JS decision on an assessment report
  JS_ESCALATED_RESPONSE: 3, // Days for JS when an RM-missed enquiry escalates to them
  SECRETARY_ESCALATION: 2, // Days for Planning Secretary after JS missed

  // Government Pitch Flow
  GOVERNMENT_PITCH_VERIFICATION: 5, // Days for RM to verify pitch

  // Grievance Resolution
  GRIEVANCE_LEVEL_1: 15, // Days for Nodal Officer
  GRIEVANCE_LEVEL_2: 30, // Days for State CSR Cell after escalation

  // Static Helpdesk
  STATIC_HELPDESK: 2, // Days for static content queries
} as const;

/**
 * Calculate due date based on SLA stage
 */
export function calculateDueDate(
  stage: keyof typeof SLA_TIMEFRAMES,
  fromDate: Date = new Date()
): Date {
  const days = SLA_TIMEFRAMES[stage];
  const dueDate = new Date(fromDate);
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
}

/**
 * Word count validation
 */
export function countWords(text: string): number {
  if (!text || text.trim() === "") return 0;
  return text.trim().split(/\s+/).length;
}

export function validateWordCount(
  text: string,
  maxWords: number
): { isValid: boolean; wordCount: number; message: string } {
  const wordCount = countWords(text);
  if (wordCount > maxWords) {
    return {
      isValid: false,
      wordCount,
      message: `Text exceeds ${maxWords} words. Current: ${wordCount} words.`,
    };
  }
  return {
    isValid: true,
    wordCount,
    message: `Valid. ${wordCount} words.`,
  };
}

/**
 * Tracking ID format validation
 */
export const TRACKING_ID_PATTERNS = {
  CORPORATE_ENQUIRY: /^CSR-MH-\d{4}-\d{6}$/,
  GOVERNMENT_PITCH: /^GP-MH-\d{4}-\d{6}$/,
  PROJECT: /^PRJ-MH-\d{4}-\d{6}$/,
  GRIEVANCE: /^GRV-MH-\d{4}-\d{6}$/,
  INTEREST: /^INT-MH-\d{4}-\d{6}$/,
};

export function validateTrackingId(
  trackingId: string,
  type: keyof typeof TRACKING_ID_PATTERNS
): boolean {
  return TRACKING_ID_PATTERNS[type].test(trackingId);
}

/**
 * Mobile number validation (Indian format)
 */
export function validateMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * MCA21 CIN validation (Corporate Identification Number)
 * Format: LXXXXXXXXXXX####### (21 characters)
 * L = Letter, X = Alphanumeric, # = Numeric
 */
export function validateCIN(cin: string): boolean {
  return /^[A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin);
}

/**
 * Word count validation for form fields
 */
export const WORD_LIMITS = {
  PROPOSED_CSR_WORK: 200,
  CSR_REQUIREMENT: 200,
  MESSAGE_TO_GOVERNMENT: 100,
} as const;
