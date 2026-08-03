import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";
import { ROLE_ID } from "../types/role";
import {
  getJSDashboard,
  getJSEscalations,
  handleEscalationAction,
  getJSGovernmentPitches
} from "../controllers/jsDashboardController";
import {
  getPendingAssessments,
  getAssessmentById,
  submitJSDecision,
  appointNodalOfficer,
  getNodalAppointments,
  getNodalAppointmentById,
  getNodalOfficers,
  getApprovedProjectsForAppointment
} from "../controllers/feasibilityAssessmentController";
import { reassignProjectOfficerByJs } from "../controllers/assignmentController";

const router = Router();
router.use(authenticateToken);
router.use(authorizeRoles([ROLE_ID.JOINT_SECRETARY]));

router.get("/dashboard", getJSDashboard);
router.get("/escalations", getJSEscalations);
router.post("/escalations/:id/action", handleEscalationAction);
router.get("/pitches", getJSGovernmentPitches);

// Feasibility assessments for JS
router.get("/assessments/pending", getPendingAssessments);
router.get("/assessments/:id", getAssessmentById);
router.post("/assessments/:id/decision", submitJSDecision);
router.post("/project-reassignments", reassignProjectOfficerByJs);
router.post("/assessments/:id/appoint-nodal", appointNodalOfficer);

// Nodal appointments
router.get("/nodal-appointments", getNodalAppointments);
router.get("/nodal-appointments/:id", getNodalAppointmentById);
router.get("/nodal-officers", getNodalOfficers);
router.get("/approved-projects", getApprovedProjectsForAppointment);

export default router;
