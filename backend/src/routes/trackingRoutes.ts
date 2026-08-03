import { Router } from "express";
import prisma from "../config/db";

const router = Router();

router.get("/:trackingId", async (req, res) => {
  const trackingId = req.params.trackingId.toUpperCase();

  if (trackingId.startsWith("CSR-") || trackingId.startsWith("CE-")) {
    const enquiry = await prisma.corporateEnquiry.findUnique({
      where: { trackingId },
      // Tracking is intentionally public, so only return the application fields
      // needed to show progress—not contact details, CIN, or attachments.
      select: {
        trackingId: true, indicativeBudget: true, preferredDistricts: true,
        preferredCities: true, preferredTalukas: true, status: true, createdAt: true
      }
    });
    if (!enquiry) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "ENQUIRY", trackingId, status: enquiry.status, submittedAt: enquiry.createdAt, details: enquiry });
  }

  if (trackingId.startsWith("GP-")) {
    const pitch = await prisma.governmentPitch.findUnique({
      where: { pitchReferenceId: trackingId },
      select: {
        pitchReferenceId: true, districts: true, cities: true, talukas: true,
        exactLocation: true, estimatedCost: true, budget: true, status: true, createdAt: true
      }
    });
    if (!pitch) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "PITCH", trackingId, status: pitch.status, submittedAt: pitch.createdAt, details: pitch });
  }

  if (trackingId.startsWith("INT-") || trackingId.startsWith("CPI-")) {
    const interest = await prisma.corporatePitchInterest.findUnique({ where: { interestTrackingId: trackingId } });
    if (!interest) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "INTEREST", trackingId, status: interest.status, submittedAt: interest.createdAt, details: interest });
  }

  if (trackingId.startsWith("GRV-")) {
    const grievance = await prisma.grievance.findUnique({ where: { grievanceCode: trackingId }, include: { project: true } });
    if (!grievance) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "GRIEVANCE", trackingId, status: grievance.status, submittedAt: grievance.createdAt, details: grievance });
  }

  if (trackingId.startsWith("PRJ-")) {
    const project = await prisma.project.findUnique({ where: { projectCode: trackingId }, select: { projectCode: true, status: true, createdAt: true, district: true, taluka: true, village: true, approvedBudget: true } });
    if (!project) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "PROJECT", trackingId, status: project.status, submittedAt: project.createdAt, details: project });
  }

  return res.status(404).json({ error: "Tracking ID not found" });
});

export default router;
