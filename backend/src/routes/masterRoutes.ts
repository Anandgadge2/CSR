import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { resolveTenantContext } from "../middlewares/tenantMiddleware";
import {
  createOrganization,
  createTenant,
  createUser,
  deleteOrganization,
  deleteTenant,
  getTenant,
  getTenantFeatures,
  listAuditLogs,
  listOrganizations,
  listTenants,
  listUsers,
  updateOrganization,
  updateTenant,
  updateTenantFeatures,
  updateTenantStatus,
  updateUser,
  deleteUser
} from "../controllers/masterController";

const router = Router();
const masterOnly = [authenticateToken, authorizeRoles([Role.MASTER_ADMIN]), resolveTenantContext];

router.get("/tenants", ...masterOnly, listTenants);
router.post("/tenants", ...masterOnly, createTenant);
router.get("/tenants/:id", ...masterOnly, getTenant);
router.put("/tenants/:id", ...masterOnly, updateTenant);
router.delete("/tenants/:id", ...masterOnly, deleteTenant);
router.patch("/tenants/:id/status", ...masterOnly, updateTenantStatus);
router.get("/tenants/:id/features", ...masterOnly, getTenantFeatures);
router.put("/tenants/:id/features", ...masterOnly, updateTenantFeatures);

router.get("/organizations", ...masterOnly, listOrganizations);
router.post("/organizations", ...masterOnly, createOrganization);
router.put("/organizations/:id", ...masterOnly, updateOrganization);
router.delete("/organizations/:id", ...masterOnly, deleteOrganization);

router.get("/audit-logs", ...masterOnly, listAuditLogs);
router.get("/users", ...masterOnly, listUsers);
router.post("/users", ...masterOnly, createUser);
router.put("/users/:id", ...masterOnly, updateUser);
router.delete("/users/:id", ...masterOnly, deleteUser);
export default router;

