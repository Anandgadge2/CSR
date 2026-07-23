import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import prisma from "../config/db";

const router = Router();

router.use(authenticateToken);

router.get("/enquiries", async (req: any, res, next) => {
  try {
    const enquiries = await prisma.corporateEnquiry.findMany({
      where: {
        ...(req.user?.organizationId ? { organizationId: req.user.organizationId } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(enquiries);
  } catch (error) {
    return next(error);
  }
});

router.get("/interests", async (req: any, res, next) => {
  try {
    const interests = await prisma.corporatePitchInterest.findMany({
      where: {
        ...(req.user?.organizationId ? { corporateId: req.user.organizationId } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(interests);
  } catch (error) {
    return next(error);
  }
});

export default router;
