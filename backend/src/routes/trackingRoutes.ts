import { Router } from "express";
import prisma from "../config/db";

const router = Router();

router.get("/:trackingId", async (req, res) => {
  const trackingId = req.params.trackingId.toUpperCase();
  if (trackingId.startsWith("CSR-")) {
    const enquiry = await prisma.corporateEnquiry.findUnique({ where: { trackingId } });
    if (!enquiry) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "ENQUIRY", trackingId, status: enquiry.status, submittedAt: enquiry.submittedAt, details: enquiry });
  }
  if (trackingId.startsWith("GP-")) {
    const pitch = await prisma.governmentPitch.findUnique({ where: { pitchReferenceId: trackingId } });
    if (!pitch) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "PITCH", trackingId, status: pitch.status, submittedAt: pitch.submittedAt, details: pitch });
  }
  if (trackingId.startsWith("INT-")) {
    const interest = await prisma.corporatePitchInterest.findUnique({ where: { interestTrackingId: trackingId }, include: { governmentPitch: true } });
    if (!interest) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "INTEREST", trackingId, status: interest.status, submittedAt: interest.createdAt, details: interest });
  }
  if (trackingId.startsWith("GRV-")) {
    const grievance = await prisma.grievance.findUnique({ where: { grievanceId: trackingId }, include: { convergenceProject: true } });
    if (!grievance) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "GRIEVANCE", trackingId, status: grievance.status, submittedAt: grievance.createdAt, details: grievance });
  }
  if (trackingId.startsWith("PRJ-")) {
    const project = await prisma.convergenceProject.findUnique({ where: { projectId: trackingId }, include: { milestones: true } });
    if (!project) return res.status(404).json({ error: "Tracking ID not found" });
    return res.json({ type: "PROJECT", trackingId, status: project.status, submittedAt: project.createdAt, details: project });
  }
  return res.status(404).json({ error: "Tracking ID not found" });
});

export default router;
