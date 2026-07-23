import { Router } from "express";
import prisma from "../config/db";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { type: "CONVERGENCE_FRAMEWORK" },
      include: { milestones: true, organization: true },
      orderBy: { createdAt: "desc" }
    });
    return res.json({ success: true, data: projects });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { milestones: true, organization: true, documents: true, utilizationCertificates: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    return res.json({ success: true, data: project });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/:id/utilization-certificates", async (req, res) => {
  try {
    const { certificateUrl, amountUtilized, milestoneId, remarks } = req.body;

    const uc = await prisma.utilizationCertificate.create({
      data: {
        projectId: req.params.id,
        milestoneId: milestoneId || null,
        certificateUrl,
        amountUtilized: Number(amountUtilized),
        remarks: remarks || null
      }
    });

    return res.status(201).json({ success: true, data: uc });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
