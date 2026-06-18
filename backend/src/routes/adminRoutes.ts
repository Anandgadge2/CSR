import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { getAdminOverview, listUsers, updateUserRole } from "../controllers/adminController";
import { validateRequest } from "../middlewares/validationMiddleware";

const router = Router();

const requireSuperAdmin = [authenticateToken, authorizeRoles([Role.SUPER_ADMIN])];

const roleSchema = z.object({
  body: z.object({
    role: z.enum(["SUPER_ADMIN", "COMPANY_ADMIN", "COMPANY_MEMBER", "NGO_ADMIN", "NGO_MEMBER"])
  })
});

router.get("/overview", ...requireSuperAdmin, getAdminOverview);
router.get("/users", ...requireSuperAdmin, listUsers);
router.patch("/users/:id/role", ...requireSuperAdmin, validateRequest(roleSchema), updateUserRole);

export default router;
