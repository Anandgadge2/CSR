import prisma from "../config/db";
import { generateCorporateEnquiryTrackingId } from "./trackingIdService";
import { selectLeastLoadedRm } from "./rmAssignmentService";

export interface CreateEnquiryInput {
  corporateName: string;
  contactEmail: string;
  organizationId?: string;
}

export class CorporateEnquiryService {
  static async createEnquiry(input: CreateEnquiryInput) {
    const trackingId = await generateCorporateEnquiryTrackingId();
    const assignedRmId = await selectLeastLoadedRm();

    const enquiry = await prisma.corporateEnquiry.create({
      data: {
        trackingId,
        corporateName: input.corporateName.trim(),
        contactEmail: input.contactEmail.toLowerCase(),
        organizationId: input.organizationId || null,
        assignedRelationshipManagerId: assignedRmId,
        status: "PENDING"
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CORPORATE_ENQUIRY_SUBMITTED",
        entityType: "CorporateEnquiry",
        entityId: enquiry.id,
        details: { trackingId, corporateName: input.corporateName }
      }
    });

    return enquiry;
  }

  static async getEnquiryById(id: string) {
    return prisma.corporateEnquiry.findUnique({
      where: { id }
    });
  }

  static async listEnquiries(filters: {
    status?: string;
    organizationId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.organizationId) where.organizationId = filters.organizationId;

    const [total, items] = await Promise.all([
      prisma.corporateEnquiry.count({ where }),
      prisma.corporateEnquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      })
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
