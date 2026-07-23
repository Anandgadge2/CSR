import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { allocateCsrFund, getCsrFundAllocations } from "../controllers/csrFundController";

const router = Router();
router.use(authenticateToken);

router.post("/allocate", allocateCsrFund);
router.get("/", getCsrFundAllocations);

export default router;
