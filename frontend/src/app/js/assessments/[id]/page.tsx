"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovInput from "@/components/gov/GovInput";
import GovSelect from "@/components/gov/GovSelect";
import GovTextarea from "@/components/gov/GovTextarea";
import GovAlert from "@/components/gov/GovAlert";
import GovTimeline, { TimelineStep } from "@/components/gov/GovTimeline";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch, clearApiCache } from "@/lib/api";
import { hasRoleAccess, JS_ROLES } from "@/lib/roleAccess";

interface ChecklistItem {
  id: string | null;
  itemNumber: number;
  dimension: string;
  checkText: string;
  isCritical: boolean;
  answer: "YES" | "NO" | "PARTIAL" | "N/A" | null;
  remarks: string | null;
}

interface NodalOfficer {
  id: string;
  name: string;
  email: string;
  assignedDistrict: string;
}

interface AssessmentDetail {
  id: string;
  reportReference: string;
  companyName: string;
  cin: string;
  sector: string;
  contactSummary: string;
  proposedLocationDistrict: string;
  indicativeBudget: number;
  developmentNeedAddressed: string;
  dateOfFirstContact: string;
  summaryOfInteraction: string;
  feasibilityResult: string;
  recommendation: string;
  suggestedNodalOfficerDomain: string;
  conditionText: string | null;
  submittedToJsAt: string;
  jsDecisionAt: string | null;
  jsDecisionRemarks: string | null;
  relationshipManager?: { email: string };
  jsDecisionBy?: { email: string };
  checklistItems: ChecklistItem[];
  source: "CORPORATE_ENQUIRY" | "GOVERNMENT_PITCH";
  sourceData: any;
  nodalOfficerAppointment: any;
}

export default function JSAssessmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [nodalOfficers, setNodalOfficers] = useState<NodalOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // JS decision form
  const [decision, setDecision] = useState<"APPROVE" | "REJECT" | "APPROVE_WITH_CONDITIONS" | "">("");
  const [remarks, setRemarks] = useState("");
  const [conditions, setConditions] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState("");
  const [decisionError, setDecisionError] = useState("");

  // Nodal appointment form
  const [selectedNodalId, setSelectedNodalId] = useState("");
  const [nodalDesignation, setNodalDesignation] = useState("District Nodal Officer");
  const [nodalDepartment, setNodalDepartment] = useState("");
  const [collectorCc, setCollectorCc] = useState(true);
  const [zpCeoCc, setZpCeoCc] = useState(true);
  const [signedLetterUrl, setSignedLetterUrl] = useState("");
  const [appointLoading, setAppointLoading] = useState(false);
  const [appointSuccess, setAppointSuccess] = useState("");
  const [appointError, setAppointError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [assessmentRes, officersRes] = await Promise.all([
        apiFetch<{ success: boolean; data: AssessmentDetail }>(`/js/assessments/${id}`),
        apiFetch<{ success: boolean; data: NodalOfficer[] }>("/js/nodal-officers"),
      ]);
      setAssessment(assessmentRes?.data || null);
      setNodalOfficers(officersRes?.data || []);
      if (assessmentRes?.data?.suggestedNodalOfficerDomain) {
        setNodalDepartment(assessmentRes.data.suggestedNodalOfficerDomain);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load assessment details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (mounted && hasRoleAccess(JS_ROLES)) {
      fetchDetails();
    }
  }, [mounted, fetchDetails]);

  const getSlaStatus = (submittedAt: string): "ON_TIME" | "DUE_SOON" | "OVERDUE" | "ESCALATED" => {
    const days = Math.floor((Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 3) return "ESCALATED";
    if (days > 2) return "OVERDUE";
    if (days > 1) return "DUE_SOON";
    return "ON_TIME";
  };

  if (!mounted) return null;
  if (!hasRoleAccess(JS_ROLES)) return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;

  if (loading) {
    return (
      <GovPortalLayout>
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--gov-border)", borderTopColor: "var(--gov-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--gov-text-muted)" }}>Loading assessment details…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </GovPortalLayout>
    );
  }

  if (error || !assessment) {
    return (
      <GovPortalLayout>
        <GovPageShell breadcrumb="Home / Assessments / Detail" title="Assessment Not Found">
          <GovAlert variant="danger">{error || "Assessment not found"}</GovAlert>
          <GovButton variant="muted" onClick={() => router.push("/js/assessments")} style={{ marginTop: 12 }}>← Back</GovButton>
        </GovPageShell>
      </GovPortalLayout>
    );
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const fmtCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const source = assessment.source;
  const sourceData = assessment.sourceData;
  const isDecisionMade = assessment.feasibilityResult !== "FEASIBLE" && assessment.feasibilityResult !== "PROCEED_WITH_CONDITIONS" && assessment.feasibilityResult !== "NOT_FEASIBLE" ? false : !!assessment.jsDecisionAt;

  // Checklist statistics
  const yesCount = assessment.checklistItems.filter((item) => item.answer === "YES").length;
  const partialCount = assessment.checklistItems.filter((item) => item.answer === "PARTIAL").length;
  const noCount = assessment.checklistItems.filter((item) => item.answer === "NO").length;
  const criticalNoCount = assessment.checklistItems.filter((item) => item.isCritical && item.answer === "NO").length;

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDecisionError("");
    setDecisionSuccess("");

    if (!decision) { setDecisionError("Please select a decision"); return; }
    if (!remarks.trim() || remarks.trim().length < 10) { setDecisionError("Remarks must be at least 10 characters"); return; }
    if (decision === "APPROVE_WITH_CONDITIONS" && (!conditions.trim() || conditions.trim().length < 10)) {
      setDecisionError("Please specify conditions (minimum 10 characters)");
      return;
    }

    setDecisionLoading(true);
    try {
      await apiFetch(`/js/assessments/${assessment.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, remarks: remarks.trim(), conditions: decision === "APPROVE_WITH_CONDITIONS" ? conditions.trim() : null }),
      });
      setDecisionSuccess("Decision submitted successfully.");
      clearApiCache();
      fetchDetails();
    } catch (err: unknown) {
      setDecisionError(err instanceof Error ? err.message : "Failed to submit decision");
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleNodalAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppointError("");
    setAppointSuccess("");

    if (!selectedNodalId) { setAppointError("Please select a nodal officer"); return; }
    if (!nodalDesignation.trim()) { setAppointError("Designation is required"); return; }
    if (!nodalDepartment.trim()) { setAppointError("Department/Domain is required"); return; }

    const officer = nodalOfficers.find((o) => o.id === selectedNodalId);
    if (!officer) { setAppointError("Invalid nodal officer selection"); return; }

    setAppointLoading(true);
    try {
      await apiFetch(`/js/assessments/${assessment.id}/nodal-officer`, {
        method: "POST",
        body: JSON.stringify({
          district: officer.assignedDistrict,
          domain: nodalDepartment.trim(),
          nodalOfficerUserId: selectedNodalId,
          nodalOfficerName: officer.name,
          designation: nodalDesignation.trim(),
          department: nodalDepartment.trim(),
          appointmentLetterUrl: signedLetterUrl.trim() || null,
          collectorCc,
          zpCeoCc,
        }),
      });
      setAppointSuccess("Nodal officer appointed successfully.");
      clearApiCache();
      fetchDetails();
    } catch (err: unknown) {
      setAppointError(err instanceof Error ? err.message : "Failed to appoint nodal officer");
    } finally {
      setAppointLoading(false);
    }
  };

  // Build timeline
  const timelineSteps: TimelineStep[] = [
    { label: "Enquiry/Pitch Received", description: "Case tracking ID generated", date: sourceData?.createdAt || assessment.submittedToJsAt, status: "completed" },
    { label: "RM Verification", description: `Assigned RM interactions completed`, date: assessment.dateOfFirstContact, status: "completed" },
    { label: "Assessment Submitted to JS", description: `Feasibility result: ${assessment.feasibilityResult}`, date: assessment.submittedToJsAt, status: "completed" },
  ];
  if (assessment.jsDecisionAt) {
    timelineSteps.push({
      label: "JS Decision Recorded",
      description: `Result: ${assessment.feasibilityResult}`,
      date: assessment.jsDecisionAt,
      status: "completed"
    });
  } else {
    timelineSteps.push({ label: "JS Decision Pending", description: "Awaiting final approval", status: "active" });
  }
  if (assessment.nodalOfficerAppointment) {
    timelineSteps.push({
      label: "Nodal Officer Appointed",
      description: `Appointed: ${assessment.nodalOfficerAppointment.nodalOfficerName}`,
      date: assessment.nodalOfficerAppointment.appointedAt,
      status: "completed"
    });
    timelineSteps.push({ label: "MoU Pending", description: "Awaiting tripartite agreement signature", status: "active" });
  }

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb={`Home / Assessments / ${assessment.reportReference}`}
        title={`Feasibility Assessment — ${assessment.reportReference}`}
        description={`Review RM report checklist, record decisions, and appoint Nodal Officers.`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <GovStatusBadge variant={statusToVariant(assessment.feasibilityResult)} style={{ fontSize: 13, padding: "6px 14px" }}>
              {assessment.feasibilityResult.replace(/_/g, " ")}
            </GovStatusBadge>
            <GovButton variant="muted" onClick={() => router.push("/js/assessments")}>← Back to List</GovButton>
          </div>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Source Information */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>
                  {source === "CORPORATE_ENQUIRY" ? "🏢 Corporate CSR Enquiry Information" : "🏛️ Government Pitch Information"}
                </GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                {source === "CORPORATE_ENQUIRY" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div><strong>Company Name:</strong> {sourceData?.companyName || assessment.companyName}</div>
                    <div><strong>MCA21 CIN:</strong> {sourceData?.mca21Cin || assessment.cin}</div>
                    <div><strong>Sector:</strong> {sourceData?.sector || assessment.sector}</div>
                    <div><strong>Preferred Districts:</strong> {sourceData?.preferredDistricts?.join(", ") || "—"}</div>
                    <div><strong>Contact Person:</strong> {sourceData?.contactPersonName || "—"}</div>
                    <div><strong>Proposed CSR Work:</strong> {sourceData?.proposedCsrWork || "—"}</div>
                    <div><strong>Indicative Budget:</strong> {sourceData?.indicativeBudget ? fmtCurrency(sourceData.indicativeBudget) : fmtCurrency(assessment.indicativeBudget)}</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div><strong>Pitch Ref ID:</strong> {sourceData?.pitchReferenceId || "—"}</div>
                    <div><strong>Official Name:</strong> {sourceData?.officialName || "—"}</div>
                    <div><strong>Department:</strong> {sourceData?.department || "—"}</div>
                    <div><strong>Service Class:</strong> {sourceData?.serviceClass || "—"}</div>
                    <div><strong>Location:</strong> {`${sourceData?.taluka || ""}, ${sourceData?.district || ""}`}</div>
                    <div><strong>CSR Requirement:</strong> {sourceData?.csrRequirement || "—"}</div>
                    <div><strong>Estimated Cost:</strong> {sourceData?.estimatedCost ? fmtCurrency(Number(sourceData.estimatedCost)) : fmtCurrency(assessment.indicativeBudget)}</div>
                    <div><strong>Govt Fund Declaration:</strong> {sourceData?.govtFundDeclaration ? "Yes (Declaring no government budget duplication)" : "No"}</div>
                  </div>
                )}
              </GovCardBody>
            </GovCard>

            {/* RM Feasibility Assessment Report Summary */}
            <GovCard>
              <GovCardHeader><GovCardTitle>📋 RM Assessment Report</GovCardTitle></GovCardHeader>
              <GovCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><strong>Date of First Contact:</strong> {fmtDate(assessment.dateOfFirstContact)}</div>
                  <div><strong>Summary of Interaction:</strong> {assessment.summaryOfInteraction}</div>
                  <div><strong>Suggested Nodal Officer Domain:</strong> {assessment.suggestedNodalOfficerDomain || "—"}</div>
                  <div><strong>RM Recommendation:</strong> {assessment.recommendation}</div>
                </div>

                <h4 style={{ fontSize: 14, fontWeight: 700, margin: "16px 0 8px" }}>13-Point Checklist Results</h4>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <GovStatusBadge variant="success">{yesCount} YES / Compliant</GovStatusBadge>
                  <GovStatusBadge variant="warning">{partialCount} PARTIAL</GovStatusBadge>
                  <GovStatusBadge variant="danger">{noCount} NO / Non-compliant</GovStatusBadge>
                  {criticalNoCount > 0 && <GovStatusBadge variant="danger">{criticalNoCount} CRITICAL FAILURES</GovStatusBadge>}
                </div>

                <div className="gov-table-container">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Dimension</th>
                        <th>Feasibility Checklist Item</th>
                        <th style={{ width: 100 }}>Response</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessment.checklistItems.map((item) => {
                        const isRed = item.isCritical && item.answer === "NO";
                        const isAmber = item.answer === "PARTIAL";
                        return (
                          <tr key={item.itemNumber} style={{ background: isRed ? "#fef2f2" : isAmber ? "#fffbeb" : "inherit" }}>
                            <td>{item.itemNumber}</td>
                            <td style={{ fontWeight: 600 }}>{item.dimension}</td>
                            <td>
                              {item.checkText}
                              {item.isCritical && <span style={{ color: "var(--gov-danger)", marginLeft: 6, fontSize: 11, fontWeight: 700 }}>(CRITICAL)</span>}
                            </td>
                            <td>
                              <GovStatusBadge variant={item.answer === "YES" ? "success" : item.answer === "NO" ? "danger" : item.answer === "PARTIAL" ? "warning" : "muted"}>
                                {item.answer || "PENDING"}
                              </GovStatusBadge>
                            </td>
                            <td>{item.remarks || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GovCardBody>
            </GovCard>

            {/* JS Decision Panel */}
            {!isDecisionMade ? (
              <GovCard>
                <GovCardHeader><GovCardTitle>⚖️ Joint Secretary Final Decision</GovCardTitle></GovCardHeader>
                <GovCardBody>
                  {decisionSuccess && <GovAlert variant="success">{decisionSuccess}</GovAlert>}
                  {decisionError && <GovAlert variant="danger">{decisionError}</GovAlert>}
                  
                  {criticalNoCount > 0 && (
                    <GovAlert variant="warning" style={{ marginBottom: 12 }}>
                      ⚠️ <strong>Warning:</strong> This report has {criticalNoCount} critical check failures. Proceeding requires a written override justification.
                    </GovAlert>
                  )}

                  <form onSubmit={handleDecisionSubmit}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label className="gov-label">JS Decision *</label>
                        <select className="gov-select" value={decision} onChange={(e) => setDecision(e.target.value as any)} required>
                          <option value="">Select Action</option>
                          <option value="APPROVE">Proceed (Approve)</option>
                          <option value="APPROVE_WITH_CONDITIONS">Proceed with Conditions</option>
                          <option value="REJECT">Do Not Proceed (Reject)</option>
                        </select>
                      </div>

                      {decision === "APPROVE_WITH_CONDITIONS" && (
                        <GovTextarea
                          label="Approval Conditions *"
                          placeholder="State the conditions under which this project can proceed..."
                          value={conditions}
                          onChange={(e) => setConditions(e.target.value)}
                          required
                        />
                      )}

                      <GovTextarea
                        label="Decision Remarks / Justification *"
                        placeholder="Provide details of your review and decision..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        required
                      />

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <GovButton type="submit" disabled={decisionLoading}>
                          {decisionLoading ? "Submitting…" : "Record Decision"}
                        </GovButton>
                      </div>
                    </div>
                  </form>
                </GovCardBody>
              </GovCard>
            ) : (
              <GovCard>
                <GovCardHeader><GovCardTitle>⚖️ JS Decision Recorded</GovCardTitle></GovCardHeader>
                <GovCardBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div><strong>Decision:</strong> {assessment.feasibilityResult.replace(/_/g, " ")}</div>
                    <div><strong>Decided At:</strong> {fmtDate(assessment.jsDecisionAt)}</div>
                    <div><strong>Remarks:</strong> {assessment.jsDecisionRemarks || "—"}</div>
                    {assessment.conditionText && (
                      <div style={{ padding: 12, background: "#fffbeb", borderLeft: "4px solid var(--gov-warning)", borderRadius: 2 }}>
                        <strong>Approval Conditions:</strong> {assessment.conditionText}
                      </div>
                    )}
                  </div>
                </GovCardBody>
              </GovCard>
            )}

            {/* Nodal Officer Appointment Panel */}
            {isDecisionMade && (assessment.feasibilityResult === "FEASIBLE" || assessment.feasibilityResult === "PROCEED_WITH_CONDITIONS") && (
              <GovCard>
                <GovCardHeader>
                  <GovCardTitle>🎖️ District Nodal Officer Appointment</GovCardTitle>
                </GovCardHeader>
                <GovCardBody>
                  {assessment.nodalOfficerAppointment ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div><strong>Appointed Officer:</strong> {assessment.nodalOfficerAppointment.nodalOfficerName}</div>
                      <div><strong>Designation:</strong> {assessment.nodalOfficerAppointment.designation}</div>
                      <div><strong>Department:</strong> {assessment.nodalOfficerAppointment.department}</div>
                      <div><strong>District:</strong> {assessment.nodalOfficerAppointment.district}</div>
                      <div><strong>Appointed At:</strong> {fmtDate(assessment.nodalOfficerAppointment.appointedAt)}</div>
                      {assessment.nodalOfficerAppointment.appointmentLetterUrl && (
                        <div>
                          <strong>Letter:</strong> <a href={assessment.nodalOfficerAppointment.appointmentLetterUrl} target="_blank" rel="noopener noreferrer">View Letter</a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {appointSuccess && <GovAlert variant="success">{appointSuccess}</GovAlert>}
                      {appointError && <GovAlert variant="danger">{appointError}</GovAlert>}
                      
                      <form onSubmit={handleNodalAppointment}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label className="gov-label">Assign Nodal Officer *</label>
                            <select className="gov-select" value={selectedNodalId} onChange={(e) => setSelectedNodalId(e.target.value)} required>
                              <option value="">Select Officer</option>
                              {nodalOfficers.map((o) => (
                                <option key={o.id} value={o.id}>{`${o.name} (${o.assignedDistrict}) — ${o.email}`}</option>
                              ))}
                            </select>
                          </div>

                          <GovInput
                            label="Officer Designation *"
                            value={nodalDesignation}
                            onChange={(e) => setNodalDesignation(e.target.value)}
                            required
                          />

                          <GovInput
                            label="Department / Domain *"
                            value={nodalDepartment}
                            onChange={(e) => setNodalDepartment(e.target.value)}
                            required
                          />

                          <GovInput
                            label="Appointment Letter Document URL (Optional)"
                            placeholder="Link to signed appointment letter document"
                            value={signedLetterUrl}
                            onChange={(e) => setSignedLetterUrl(e.target.value)}
                          />

                          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                              <input type="checkbox" checked={collectorCc} onChange={(e) => setCollectorCc(e.target.checked)} />
                              Send CC to District Collector
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                              <input type="checkbox" checked={zpCeoCc} onChange={(e) => setZpCeoCc(e.target.checked)} />
                              Send CC to ZP CEO
                            </label>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <GovButton type="submit" disabled={appointLoading}>
                              {appointLoading ? "Appointing…" : "Issue Appointment Letter"}
                            </GovButton>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </GovCardBody>
              </GovCard>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* General Case Info */}
            <GovCard>
              <GovCardHeader><GovCardTitle>Case Timeline</GovCardTitle></GovCardHeader>
              <GovCardBody>
                <GovTimeline steps={timelineSteps} />
              </GovCardBody>
            </GovCard>

            {/* RM Details */}
            <GovCard>
              <GovCardHeader><GovCardTitle>Relationship Manager</GovCardTitle></GovCardHeader>
              <GovCardBody>
                <div style={{ fontSize: 13 }}>
                  <div><strong>Email:</strong> {assessment.relationshipManager?.email || "Unknown"}</div>
                  <div style={{ marginTop: 6 }}><strong>SLA Status:</strong> {getSlaStatus(assessment.submittedToJsAt)}</div>
                </div>
              </GovCardBody>
            </GovCard>
          </div>
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
