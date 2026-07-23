import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
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

const router = Router();
router.use(authenticateToken);

router.get("/dashboard", getJSDashboard);
router.get("/escalations", getJSEscalations);
router.post("/escalations/:id/action", handleEscalationAction);
router.get("/pitches", getJSGovernmentPitches);

// Feasibility assessments for JS
router.get("/assessments/pending", getPendingAssessments);
router.get("/assessments/:id", getAssessmentById);
router.post("/assessments/:id/decision", submitJSDecision);
router.post("/assessments/:id/appoint-nodal", appointNodalOfficer);

// Nodal appointments
router.get("/nodal-appointments", getNodalAppointments);
router.get("/nodal-appointments/:id", getNodalAppointmentById);
router.get("/nodal-officers", getNodalOfficers);
router.get("/approved-projects", getApprovedProjectsForAppointment);

export default router;
