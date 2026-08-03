import { Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { selectLeastLoadedRm } from "../services/rmAssignmentService";
import { ROLE_ID } from "../types/role";
import { notifyHierarchy } from "../services/hierarchyNotificationService";
import { generateGovernmentPitchTrackingId } from "../services/trackingIdService";
import { createSLAEscalation } from "../services/slaEscalationService";
import { calculateSlaDueDate } from "../services/slaConfigService";
import { dispatchNotification, dispatchToContact } from "../services/notificationOrchestrator";

export const submitGovernmentPitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Check organization onboarding status guard
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    // Relationship Managers cannot submit government pitches
    if (user?.roleId === ROLE_ID.RELATIONSHIP_MANAGER) {
      return res.status(403).json({
        error: "Relationship Managers are not allowed to submit government pitches."
      });
    }

    if (user?.roleId !== ROLE_ID.SUPER_ADMIN && user?.organization?.status !== "ACTIVE") {
      return res.status(403).json({
        error: "Organization onboarding must be completed and approved by Super Admin before submitting pitches."
      });
    }

    const preferredDistrict = req.body.district || req.body.location || null;

    // Auto-assign Relationship Manager via round-robin least loaded algorithm
    const assignedRmId = await selectLeastLoadedRm(preferredDistrict);
    if (!assignedRmId) {
      return res.status(503).json({ error: "No active Relationship Manager is available. Please retry shortly; your pitch was not submitted." });
    }

    let pitch;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        pitch = await prisma.governmentPitch.create({
          data: {
        pitchReferenceId: await generateGovernmentPitchTrackingId(),
        title: req.body.title || req.body.csrRequirement || "Development Need",
        budget: Number(req.body.budget || req.body.estimatedCost || 0),
        assignedRelationshipManagerId: assignedRmId,
        departmentId: req.body.departmentId || user?.organizationId || null,
        officialName: req.body.officialName || null,
        designation: req.body.designation || null,
        department: req.body.department || user?.organization?.name || null,
        officeName: req.body.officeName || null,
        serviceClass: req.body.serviceClass || null,
        mobile: req.body.mobile || null,
        email: req.body.email || user?.email || null,
        divisions: Array.isArray(req.body.divisions) ? req.body.divisions : [],
        districts: Array.isArray(req.body.districts) ? req.body.districts : [],
        cities: Array.isArray(req.body.cities) ? req.body.cities : [],
        talukas: Array.isArray(req.body.talukas) ? req.body.talukas : [],
        exactLocation: req.body.exactLocation || null,
        csrRequirement: req.body.csrRequirement || null,
        estimatedCost: req.body.estimatedCost ?? null,
        govtFundDeclaration: typeof req.body.govtFundDeclaration === "boolean" ? req.body.govtFundDeclaration : null,
        certificationType: req.body.certificationType || null,
        hodCertificationDocument: req.body.hodCertificationDocument || null,
        supportingDocuments: Array.isArray(req.body.supportingDocuments) ? req.body.supportingDocuments : [],
        geoTaggedPhotos: Array.isArray(req.body.geoTaggedPhotos) ? req.body.geoTaggedPhotos : [],
        submittedByUserId: userId,
        status: "SUBMITTED"
          }
        });
        break;
      } catch (error: any) {
        if (error?.code !== "P2002" || attempt === 2) throw error;
      }
    }
    if (!pitch) throw new Error("Unable to generate a unique pitch tracking code");

    await createSLAEscalation({ entityType: "GOVERNMENT_PITCH", entityId: pitch.id, stage: "GOVERNMENT_PITCH_VERIFICATION", responsibleUserId: assignedRmId, dueAt: await calculateSlaDueDate("GOVERNMENT_PITCH_VERIFICATION") });
    await Promise.all([
      dispatchNotification({
        recipientId: assignedRmId,
        templateName: "GOVERNMENT_PITCH_ASSIGNED",
        channels: ["IN_APP", "SOCKET", "EMAIL", "SMS"],
        variables: { title: "New government pitch assigned", message: `Pitch ${pitch.pitchReferenceId} requires verification.`, currentStatus: pitch.status },
        actionButtonUrl: `/pitches/${pitch.id}`,
        correlationId: pitch.id,
        notificationType: "GOVERNMENT_PITCH_ASSIGNED"
      }),
      dispatchToContact({
        referenceId: pitch.pitchReferenceId || pitch.id,
        email: pitch.email,
        phone: pitch.mobile,
        title: "Government pitch received",
        message: `Your pitch has been received. Your tracking ID is ${pitch.pitchReferenceId}. Use it to follow progress.`,
        trackingId: pitch.pitchReferenceId || undefined,
        currentStatus: pitch.status,
        actionButtonUrl: `/track?trackingId=${encodeURIComponent(pitch.pitchReferenceId || pitch.id)}`,
        correlationId: pitch.id,
        notificationType: "TRACKING_ID_ISSUED"
      })
    ]);

    notifyHierarchy({
      title: "New Government Pitch Submitted",
      message: `Government pitch ${pitch.pitchReferenceId} ("${pitch.title}") submitted for review.`,
      organizationId: pitch.departmentId,
      assignedRmId: pitch.assignedRelationshipManagerId,
      district: preferredDistrict,
      includePortalAdmins: true,
      includeRms: true,
      includeDistrictOfficers: true,
      includeStateOfficers: true,
      actionButtonUrl: `/pitches`
    }).catch(err => console.error("Notification dispatch failed:", err));

    return res.status(201).json(pitch);
  } catch (error) {
    next(error);
  }
};

export const submitPitch = submitGovernmentPitch;

export const getPitchById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json(pitch);
  } catch (error) {
    next(error);
  }
};

export const getPitchByTrackingId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { pitchReferenceId: req.params.trackingId }, select: { pitchReferenceId: true, status: true, createdAt: true, districts: true, cities: true, talukas: true, exactLocation: true, estimatedCost: true, budget: true } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json(pitch);
  } catch (error) {
    next(error);
  }
};

export const listGovernmentPitches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitches = await prisma.governmentPitch.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(pitches);
  } catch (error) {
    next(error);
  }
};

export const getPublicPitches = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitches = await prisma.governmentPitch.findMany({
      where: { status: "PUBLIC_LISTED" },
      select: { id: true, pitchReferenceId: true, title: true, department: true, districts: true, cities: true, talukas: true, exactLocation: true, csrRequirement: true, estimatedCost: true, budget: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
    return res.json(pitches);
  } catch (error) { next(error); }
};

export const getMyPitches = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitches = await prisma.governmentPitch.findMany({ where: { departmentId: req.user?.organizationId || "__none__" }, orderBy: { createdAt: "desc" } });
    return res.json(pitches);
  } catch (error) { next(error); }
};

export const assignPitchRelationshipManager = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rm = await prisma.user.findFirst({ where: { id: req.body.relationshipManagerId, roleId: ROLE_ID.RELATIONSHIP_MANAGER, accountStatus: "ACTIVE", isVerified: true }, select: { id: true } });
    if (!rm) return res.status(400).json({ error: "Select an active, verified Relationship Manager." });
    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { assignedRelationshipManagerId: req.body.relationshipManagerId }
    });
    await dispatchNotification({ recipientId: rm.id, templateName: "GOVERNMENT_PITCH_REASSIGNED", channels: ["IN_APP", "SOCKET", "EMAIL", "SMS"], variables: { title: "Pitch reassigned by Joint Secretary", message: `Pitch ${updated.pitchReferenceId} is now assigned to you.`, currentStatus: updated.status }, actionButtonUrl: `/pitches/${updated.id}`, correlationId: updated.id, notificationType: "RM_REASSIGNMENT" });
    await dispatchToContact({ referenceId: updated.pitchReferenceId || updated.id, email: updated.email, phone: updated.mobile, title: "Relationship Manager reassigned", message: `A Relationship Manager has been reassigned to pitch ${updated.pitchReferenceId || updated.id}.`, trackingId: updated.pitchReferenceId || undefined, currentStatus: updated.status, actionButtonUrl: `/track?trackingId=${encodeURIComponent(updated.pitchReferenceId || updated.id)}`, correlationId: updated.id, notificationType: "RM_REASSIGNMENT" });

    notifyHierarchy({
      title: "Relationship Manager Assigned to Pitch",
      message: `Relationship Manager assigned to Government Pitch ${updated.pitchReferenceId}.`,
      assignedRmId: req.body.relationshipManagerId,
      organizationId: updated.departmentId,
      includePortalAdmins: true,
      actionButtonUrl: `/pitches`
    }).catch(err => console.error("Notification dispatch failed:", err));

    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const recordPitchRmContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.status(410).json({ error: "Use the assigned Relationship Manager interaction endpoint." });
};

export const convertPitchToProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    return res.json({ success: true, message: "Converted to project" });
  } catch (error) {
    next(error);
  }
};

export const submitInterest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const interest = await prisma.corporatePitchInterest.create({
      data: {
        pitchId: req.body.pitchId || req.params.id,
        corporateId: req.user?.organizationId || req.body.corporateId || "unknown",
        status: "INTERESTED"
      }
    });
    return res.status(201).json(interest);
  } catch (error) {
    next(error);
  }
};

export const verifyPitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.governmentPitch.update({
      where: { id: req.params.id },
      data: { status: "VERIFIED" }
    });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * JS Pitch Approval — Auto-assigns project to both DNC (District Nodal Consultant) and Govt Department Admin
 */
export const approvePitch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pitch = await prisma.governmentPitch.findUnique({ where: { id: req.params.id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    if (pitch.status !== "JS_APPROVAL_PENDING") {
      return res.status(409).json({ error: "Only an RM-verified pitch awaiting JS approval can be published." });
    }
    // A pitch is an approved public CSR opportunity. It becomes a project only
    // after a corporate interest and MoU workflow, never at publication time.
    const updated = await prisma.governmentPitch.update({ where: { id: pitch.id }, data: { status: "PUBLIC_LISTED" } });
    await prisma.sLAEscalation.updateMany({ where: { entityType: "GOVERNMENT_PITCH", entityId: pitch.id, stage: "JS_DECISION", isResolved: false }, data: { isResolved: true, resolvedAt: new Date() } });
    await dispatchToContact({
      referenceId: updated.pitchReferenceId || updated.id,
      email: updated.email,
      phone: updated.mobile,
      title: "Government pitch approved and published",
      message: `Your pitch ${updated.pitchReferenceId || updated.id} has been approved by the Joint Secretary and is now publicly listed for corporate interest.`,
      trackingId: updated.pitchReferenceId || undefined,
      currentStatus: updated.status,
      actionButtonUrl: `/track?trackingId=${encodeURIComponent(updated.pitchReferenceId || updated.id)}`,
      correlationId: updated.id,
      notificationType: "JS_DECISION"
    });
    return res.json({ success: true, message: "Pitch approved and published for corporate interest.", pitch: updated });
  } catch (error) {
    next(error);
  }
};
