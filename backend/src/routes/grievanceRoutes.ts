import { Router } from "express";
import prisma from "../config/db";
import { authenticateToken } from "../middlewares/authMiddleware";
import { generateGrievanceTrackingId } from "../services/trackingIdService";
import { notify } from "../services/notificationService";

const router = Router();

router.use(authenticateToken);

router.post("/", async (req: any, res) => {
  try {
    const { projectId, issueTitle, issueDescription } = req.body;
    const grievanceCode = await generateGrievanceTrackingId();

    const grievance = await prisma.grievance.create({
      data: {
        grievanceCode,
        projectId,
        raisedByUserId: req.user.id,
        issueTitle,
        issueDescription,
        status: "RAISED"
      }
    });

    await notify(req.user.id, "Grievance Raised", `Your grievance ${grievanceCode} has been recorded.`);

    return res.status(201).json({ success: true, data: grievance });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/my", async (req: any, res) => {
  try {
    const grievances = await prisma.grievance.findMany({
      where: { raisedByUserId: req.user.id },
      include: { project: true, raisedByUser: true },
      orderBy: { createdAt: "desc" }
    });
    return res.json({ success: true, data: grievances });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const grievances = await prisma.grievance.findMany({
      include: { project: true, raisedByUser: true },
      orderBy: { createdAt: "desc" }
    });
    return res.json({ success: true, data: grievances });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const grievance = await prisma.grievance.findUnique({
      where: { id: req.params.id },
      include: { project: true, raisedByUser: true, actionLogs: true }
    });
    if (!grievance) return res.status(404).json({ error: "Grievance not found" });
    return res.json({ success: true, data: grievance });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
