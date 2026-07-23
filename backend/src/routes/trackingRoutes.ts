import { Router } from "express";
import prisma from "../config/db";

const router = Router();

router.get("/:trackingId", async (req, res) => {
  const trackingId = req.params.trackingId.toUpperCase();

  if (trackingId.startsWith("CSR-")) {
    const enquiry = await prisma.corporateEnquiry.findUnique({ where: { trackingId } });
    if (!enquiry) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "ENQUIRY", trackingId, status: enquiry.status, submittedAt: enquiry.createdAt, details: enquiry });
  }

  if (trackingId.startsWith("GP-")) {
    const pitch = await prisma.governmentPitch.findUnique({ where: { pitchReferenceId: trackingId } });
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
    const project = await prisma.project.findUnique({ where: { projectCode: trackingId }, include: { milestones: true } });
    if (!project) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "PROJECT", trackingId, status: project.status, submittedAt: project.createdAt, details: project });
  }

  return res.status(404).json({ error: "Tracking ID not found" });
});

export default router;
