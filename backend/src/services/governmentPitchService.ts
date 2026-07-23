import prisma from "../config/db";

export interface CreateGovernmentPitchInput {
  title: string;
  budget: number;
  departmentId?: string;
  officialName?: string;
  officialEmail?: string;
  submittedByUserId?: string;
}

export class GovernmentPitchService {
  static async createPitch(input: CreateGovernmentPitchInput) {
    const pitchReferenceId = `PITCH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const pitch = await prisma.governmentPitch.create({
      data: {
        pitchReferenceId,
        title: input.title,
        budget: input.budget,
        departmentId: input.departmentId || null,
        status: "SUBMITTED"
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "GOVERNMENT_PITCH_SUBMITTED",
        entityType: "GovernmentPitch",
        entityId: pitch.id,
        details: { pitchReferenceId, officialName: input.officialName },
        actorUserId: input.submittedByUserId || null,
        userId: input.submittedByUserId || null
      }
    });

    return pitch;
  }

  static async getPitchById(id: string) {
    return prisma.governmentPitch.findUnique({
      where: { id }
    });
  }

  static async listPitches(filters: {
    status?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.departmentId) where.departmentId = filters.departmentId;

    const [total, items] = await Promise.all([
      prisma.governmentPitch.count({ where }),
      prisma.governmentPitch.findMany({
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
