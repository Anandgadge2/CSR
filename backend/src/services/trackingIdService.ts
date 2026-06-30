/**
 * Tracking ID Service
 * 
 * Maharashtra CSR Portal - Convergence Framework
 * 
 * This service generates sequential tracking IDs for various entities in the system:
 * - Corporate Enquiries: CSR-MH-YYYY-000001
 * - Government Pitches: GP-MH-YYYY-000001
 * - Projects: PRJ-MH-YYYY-000001
 * - Grievances: GRV-MH-YYYY-000001
 * - Interest Tracking: INT-MH-YYYY-000001
 * 
 * The service queries the database to find the highest existing tracking ID for the
 * current year and increments it by 1 for new entries.
 */

import prisma from "../config/db";

/**
 * Tracking ID prefix constants
 */
export const TRACKING_ID_PREFIXES = {
  CORPORATE_ENQUIRY: "CSR",
  GOVERNMENT_PITCH: "GP",
  PROJECT: "PRJ",
  GRIEVANCE: "GRV",
  INTEREST: "INT",
} as const;

export type TrackingIdType = keyof typeof TRACKING_ID_PREFIXES;

/**
 * Generate a tracking ID with the specified prefix for the current year
 * 
 * Format: PREFIX-MH-YYYY-000001
 * Example: CSR-MH-2025-000001
 * 
 * @param prefix - The prefix for the tracking ID (CSR, GP, PRJ, GRV, INT)
 * @param year - Optional year, defaults to current year
 * @returns The formatted tracking ID
 */
function formatTrackingId(prefix: string, year: number, sequence: number): string {
  const sequenceStr = sequence.toString().padStart(6, "0");
  return `${prefix}-MH-${year}-${sequenceStr}`;
}

/**
 * Get the next sequential number for a tracking ID prefix in a given year
 * 
 * @param prefix - The tracking ID prefix
 * @param year - The year to check
 * @returns The next available sequence number
 */
async function getNextSequence(prefix: string, year: number): Promise<number> {
  const yearStart = new Date(year, 0, 1); // January 1st
  const yearEnd = new Date(year + 1, 0, 1); // January 1st of next year

  let lastTrackingId: string | null = null;

  // Query the appropriate table based on prefix
  switch (prefix) {
    case TRACKING_ID_PREFIXES.CORPORATE_ENQUIRY: {
      const enquiry = await prisma.corporateEnquiry.findFirst({
        where: {
          createdAt: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
        orderBy: {
          trackingId: "desc",
        },
        select: {
          trackingId: true,
        },
      });
      lastTrackingId = enquiry?.trackingId || null;
      break;
    }

    case TRACKING_ID_PREFIXES.GOVERNMENT_PITCH: {
      const pitch = await prisma.governmentPitch.findFirst({
        where: {
          createdAt: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
        orderBy: {
          pitchReferenceId: "desc",
        },
        select: {
          pitchReferenceId: true,
        },
      });
      lastTrackingId = pitch?.pitchReferenceId || null;
      break;
    }

    case TRACKING_ID_PREFIXES.PROJECT: {
      const project = await prisma.convergenceProject.findFirst({
        where: {
          createdAt: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
        orderBy: {
          projectId: "desc",
        },
        select: {
          projectId: true,
        },
      });
      lastTrackingId = project?.projectId || null;
      break;
    }

    case TRACKING_ID_PREFIXES.GRIEVANCE: {
      const grievance = await prisma.grievance.findFirst({
        where: {
          createdAt: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
        orderBy: {
          grievanceId: "desc",
        },
        select: {
          grievanceId: true,
        },
      });
      lastTrackingId = grievance?.grievanceId || null;
      break;
    }

    case TRACKING_ID_PREFIXES.INTEREST: {
      const interest = await prisma.corporatePitchInterest.findFirst({
        where: {
          createdAt: {
            gte: yearStart,
            lt: yearEnd,
          },
        },
        orderBy: {
          interestTrackingId: "desc",
        },
        select: {
          interestTrackingId: true,
        },
      });
      lastTrackingId = interest?.interestTrackingId || null;
      break;
    }

    default:
      throw new Error(`Unknown tracking ID prefix: ${prefix}`);
  }

  // If no tracking ID found for this year, start from 1
  if (!lastTrackingId) {
    return 1;
  }

  // Extract sequence number from last tracking ID
  // Format: PREFIX-MH-YYYY-000001
  const parts = lastTrackingId.split("-");
  if (parts.length !== 4) {
    console.warn(`Invalid tracking ID format: ${lastTrackingId}, starting from 1`);
    return 1;
  }

  const sequenceStr = parts[3];
  const sequence = parseInt(sequenceStr, 10);

  if (isNaN(sequence)) {
    console.warn(`Invalid sequence number in tracking ID: ${lastTrackingId}, starting from 1`);
    return 1;
  }

  return sequence + 1;
}

/**
 * Generate a new corporate enquiry tracking ID
 * Format: CSR-MH-YYYY-000001
 * 
 * @param year - Optional year, defaults to current year
 * @returns The new tracking ID
 */
export async function generateCorporateEnquiryTrackingId(year?: number): Promise<string> {
  try {
    const targetYear = year || new Date().getFullYear();
    const nextSequence = await getNextSequence(TRACKING_ID_PREFIXES.CORPORATE_ENQUIRY, targetYear);
    return formatTrackingId(TRACKING_ID_PREFIXES.CORPORATE_ENQUIRY, targetYear, nextSequence);
  } catch (error) {
    console.error("Error generating corporate enquiry tracking ID:", error);
    throw new Error("Failed to generate corporate enquiry tracking ID");
  }
}

/**
 * Generate a new government pitch tracking ID
 * Format: GP-MH-YYYY-000001
 * 
 * @param year - Optional year, defaults to current year
 * @returns The new tracking ID
 */
export async function generateGovernmentPitchTrackingId(year?: number): Promise<string> {
  try {
    const targetYear = year || new Date().getFullYear();
    const nextSequence = await getNextSequence(TRACKING_ID_PREFIXES.GOVERNMENT_PITCH, targetYear);
    return formatTrackingId(TRACKING_ID_PREFIXES.GOVERNMENT_PITCH, targetYear, nextSequence);
  } catch (error) {
    console.error("Error generating government pitch tracking ID:", error);
    throw new Error("Failed to generate government pitch tracking ID");
  }
}

/**
 * Generate a new project tracking ID
 * Format: PRJ-MH-YYYY-000001
 * 
 * @param year - Optional year, defaults to current year
 * @returns The new tracking ID
 */
export async function generateProjectTrackingId(year?: number): Promise<string> {
  try {
    const targetYear = year || new Date().getFullYear();
    const nextSequence = await getNextSequence(TRACKING_ID_PREFIXES.PROJECT, targetYear);
    return formatTrackingId(TRACKING_ID_PREFIXES.PROJECT, targetYear, nextSequence);
  } catch (error) {
    console.error("Error generating project tracking ID:", error);
    throw new Error("Failed to generate project tracking ID");
  }
}

/**
 * Generate a new grievance tracking ID
 * Format: GRV-MH-YYYY-000001
 * 
 * @param year - Optional year, defaults to current year
 * @returns The new tracking ID
 */
export async function generateGrievanceTrackingId(year?: number): Promise<string> {
  try {
    const targetYear = year || new Date().getFullYear();
    const nextSequence = await getNextSequence(TRACKING_ID_PREFIXES.GRIEVANCE, targetYear);
    return formatTrackingId(TRACKING_ID_PREFIXES.GRIEVANCE, targetYear, nextSequence);
  } catch (error) {
    console.error("Error generating grievance tracking ID:", error);
    throw new Error("Failed to generate grievance tracking ID");
  }
}

/**
 * Generate a new corporate interest tracking ID
 * Format: INT-MH-YYYY-000001
 * 
 * @param year - Optional year, defaults to current year
 * @returns The new tracking ID
 */
export async function generateInterestTrackingId(year?: number): Promise<string> {
  try {
    const targetYear = year || new Date().getFullYear();
    const nextSequence = await getNextSequence(TRACKING_ID_PREFIXES.INTEREST, targetYear);
    return formatTrackingId(TRACKING_ID_PREFIXES.INTEREST, targetYear, nextSequence);
  } catch (error) {
    console.error("Error generating interest tracking ID:", error);
    throw new Error("Failed to generate interest tracking ID");
  }
}

/**
 * Validate a tracking ID format
 * 
 * @param trackingId - The tracking ID to validate
 * @param expectedPrefix - Optional expected prefix
 * @returns boolean indicating if the format is valid
 */
export function validateTrackingId(trackingId: string, expectedPrefix?: string): boolean {
  if (!trackingId || typeof trackingId !== "string") {
    return false;
  }

  const parts = trackingId.split("-");
  if (parts.length !== 4) {
    return false;
  }

  const [prefix, state, year, sequence] = parts;

  // Validate state code
  if (state !== "MH") {
    return false;
  }

  // Validate year
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum) || year.length !== 4) {
    return false;
  }

  // Validate sequence number (6 digits)
  const seqNum = parseInt(sequence, 10);
  if (isNaN(seqNum) || sequence.length !== 6) {
    return false;
  }

  // Validate prefix if expected
  if (expectedPrefix && prefix !== expectedPrefix) {
    return false;
  }

  // Validate prefix is known
  const validPrefixes = Object.values(TRACKING_ID_PREFIXES);
  if (!validPrefixes.includes(prefix as any)) {
    return false;
  }

  return true;
}

/**
 * Extract year from a tracking ID
 * 
 * @param trackingId - The tracking ID
 * @returns The year number or null if invalid
 */
export function extractYearFromTrackingId(trackingId: string): number | null {
  if (!validateTrackingId(trackingId)) {
    return null;
  }

  const parts = trackingId.split("-");
  return parseInt(parts[2], 10);
}

/**
 * Extract sequence number from a tracking ID
 * 
 * @param trackingId - The tracking ID
 * @returns The sequence number or null if invalid
 */
export function extractSequenceFromTrackingId(trackingId: string): number | null {
  if (!validateTrackingId(trackingId)) {
    return null;
  }

  const parts = trackingId.split("-");
  return parseInt(parts[3], 10);
}

/**
 * Service class for tracking ID operations
 * Provides a consolidated interface for all tracking ID operations
 */
export class TrackingIdService {
  /**
   * Generate a tracking ID based on entity type
   */
  static async generate(type: TrackingIdType, year?: number): Promise<string> {
    switch (type) {
      case "CORPORATE_ENQUIRY":
        return generateCorporateEnquiryTrackingId(year);
      case "GOVERNMENT_PITCH":
        return generateGovernmentPitchTrackingId(year);
      case "PROJECT":
        return generateProjectTrackingId(year);
      case "GRIEVANCE":
        return generateGrievanceTrackingId(year);
      case "INTEREST":
        return generateInterestTrackingId(year);
      default:
        throw new Error(`Unknown tracking ID type: ${type}`);
    }
  }

  /**
   * Validate a tracking ID
   */
  static validate(trackingId: string, expectedPrefix?: string): boolean {
    return validateTrackingId(trackingId, expectedPrefix);
  }

  /**
   * Get statistics for tracking IDs generated in a year
   */
  static async getYearlyStats(year?: number): Promise<{
    year: number;
    corporateEnquiries: number;
    governmentPitches: number;
    projects: number;
    grievances: number;
    interests: number;
  }> {
    const targetYear = year || new Date().getFullYear();
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear + 1, 0, 1);

    const [
      corporateEnquiries,
      governmentPitches,
      projects,
      grievances,
      interests,
    ] = await Promise.all([
      prisma.corporateEnquiry.count({
        where: { createdAt: { gte: yearStart, lt: yearEnd } },
      }),
      prisma.governmentPitch.count({
        where: { createdAt: { gte: yearStart, lt: yearEnd } },
      }),
      prisma.convergenceProject.count({
        where: { createdAt: { gte: yearStart, lt: yearEnd } },
      }),
      prisma.grievance.count({
        where: { createdAt: { gte: yearStart, lt: yearEnd } },
      }),
      prisma.corporatePitchInterest.count({
        where: { createdAt: { gte: yearStart, lt: yearEnd } },
      }),
    ]);

    return {
      year: targetYear,
      corporateEnquiries,
      governmentPitches,
      projects,
      grievances,
      interests,
    };
  }
}
