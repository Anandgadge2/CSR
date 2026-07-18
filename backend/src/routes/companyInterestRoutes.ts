import { Router } from "express";
import {
  expressInterest,
  getMyInterests,
  getInterestsForRequirement,
  selectNGO,
  updateInterestStatus,
  listCompanyInterestsForAdmin
} from "../controllers/companyInterestController";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { checkOrganizationApproved, checkPermission } from "../middlewares/accessControlMiddleware";
import { Role } from "../types/role";

const router = Router();
const companyTransaction = [
  authenticateToken,
  authorizeRoles([Role.COMPANY_ADMIN, Role.COMPANY_MEMBER, Role.SUPER_ADMIN]),
  checkOrganizationApproved
];

router.post("/", ...companyTransaction, checkPermission("interest:create"), expressInterest);
router.get("/my", ...companyTransaction, checkPermission("interest:view"), getMyInterests);
router.get(
  "/list",
  authenticateToken,
  authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN, Role.DISTRICT_ADMIN, Role.BENEFICIARY_AGENCY]),
  checkPermission("interest:view"),
  listCompanyInterestsForAdmin
);
router.get(
  "/requirement/:requirementId",
  authenticateToken,
  authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN, Role.DISTRICT_ADMIN, Role.BENEFICIARY_AGENCY]),
  checkPermission("interest:view"),
  getInterestsForRequirement
);
router.post("/:id/select-ngo", ...companyTransaction, checkPermission("interest:approve"), selectNGO);
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles([Role.SUPER_ADMIN, Role.PORTAL_ADMIN, Role.CSR_ADMIN]),
  checkPermission("interest:approve"),
  updateInterestStatus
);

export default router;
