"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import { useApiQuery } from "@/lib/apiHooks";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

interface ChecklistItem {
  id: string;
  itemNumber: number;
  dimension: string;
  checkText: string;
  isCritical: boolean;
  answer: "YES" | "NO" | "NA";
  remarks: string | null;
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
  feasibilityResult: "FEASIBLE" | "PROCEED_WITH_CONDITIONS" | "NOT_FEASIBLE";
  recommendation: string;
  suggestedNodalOfficerDomain: string;
  conditionText: string | null;
  submittedToJsAt: string | null;
  jsDecisionBy?: { email: string } | null;
  jsDecisionAt: string | null;
  jsDecisionRemarks: string | null;
  checklistItems: ChecklistItem[];
}

export default function RMAssessmentDetailPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const { data: assessment, isLoading, error } = useApiQuery<AssessmentDetail>(
    ["rm", "assessment", assessmentId],
    `/rm/assessments/${assessmentId}`,
    { staleTime: 30 * 1000, enabled: !!assessmentId }
  );

  const getResultColor = (result: string) => {
    switch (result) {
      case "FEASIBLE":
        return "success";
      case "PROCEED_WITH_CONDITIONS":
        return "warning";
      case "NOT_FEASIBLE":
        return "danger";
      default:
        return "muted";
    }
  };

  if (isLoading) {
    return (
      <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
        <div style={{ padding: 100, textAlign: "center", color: "var(--gov-text-muted)" }}>Loading assessment...</div>
      </GovPortalLayout>
    );
  }

  if (error || !assessment) {
    return (
      <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
        <div style={{ padding: 24 }}>
          <GovAlert variant="danger">Failed to load feasibility assessment details.</GovAlert>
          <Link href="/rm/assessments">
            <GovButton variant="secondary" style={{ marginTop: 16 }}>
              <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Assessments
            </GovButton>
          </Link>
        </div>
      </GovPortalLayout>
    );
  }

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title={`Report ${assessment.reportReference}`}
        description="Detailed Feasibility Assessment Card - Tripartite Alignment Framework"
        breadcrumb="Home / Assessments / Detail"
        actions={
          <Link href="/rm/assessments">
            <GovButton variant="secondary">
              <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to List
            </GovButton>
          </Link>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Company Details */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Assessment Details</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Company Name</span>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{assessment.companyName}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>CIN</span>
                  <span style={{ fontWeight: 600 }}>{assessment.cin}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Sector</span>
                  <span>{assessment.sector}</span>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Indicative Budget</span>
                  <span style={{ fontWeight: 700 }}>₹{Number(assessment.indicativeBudget).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Contact Summary</span>
                  <span>{assessment.contactSummary}</span>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Development Need Addressed</span>
                  <span>{assessment.developmentNeedAddressed}</span>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Summary of Interaction</span>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{assessment.summaryOfInteraction}</p>
                </div>
              </div>
            </GovCardBody>
          </GovCard>

          {/* 13-Point Checklist Table */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>13-Point Feasibility Checklist (Annexure A)</GovCardTitle>
            </GovCardHeader>
            <GovCardBody style={{ padding: 0 }}>
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Item</th>
                      <th>Dimension</th>
                      <th>Verifications / Checks</th>
                      <th style={{ width: 100 }}>Response</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.checklistItems.map((item) => (
                      <tr key={item.id} style={{ background: item.isCritical ? "#fffbeb" : "none" }}>
                        <td>{item.itemNumber}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{item.dimension}</span>
                          {item.isCritical && (
                            <span style={{ display: "block", fontSize: 10, color: "var(--gov-danger)", fontWeight: 700 }}>
                              * CRITICAL
                            </span>
                          )}
                        </td>
                        <td>{item.checkText}</td>
                        <td>
                          <GovStatusBadge variant={item.answer === "YES" ? "success" : item.answer === "NO" ? "danger" : "muted"}>
                            {item.answer}
                          </GovStatusBadge>
                        </td>
                        <td>{item.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GovCardBody>
          </GovCard>
        </div>

        {/* Sidebar Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Status & Results</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", marginBottom: 4 }}>FEASIBILITY STATUS</span>
                  <GovStatusBadge variant={getResultColor(assessment.feasibilityResult)} style={{ fontSize: 14, padding: "6px 12px" }}>
                    {assessment.feasibilityResult.replace(/_/g, " ")}
                  </GovStatusBadge>
                </div>

                {assessment.conditionText && (
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)" }}>CONDITIONS RECORDED</span>
                    <p style={{ margin: "4px 0 0", fontSize: 13, background: "#fffbeb", padding: 8, borderRadius: 4, borderLeft: "4px solid var(--gov-warning)" }}>
                      {assessment.conditionText}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)" }}>RECOMMENDATION NOTES</span>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gov-text)" }}>{assessment.recommendation}</p>
                </div>

                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)" }}>SUGGESTED NODAL OFFICER</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{assessment.suggestedNodalOfficerDomain}</span>
                </div>
              </div>
            </GovCardBody>
          </GovCard>

          {/* Joint Secretary Decision Review */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>JS Decision Review</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              {assessment.jsDecisionAt ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gov-success)" }}>
                    <CheckCircle size={20} />
                    <span style={{ fontWeight: 700 }}>Decision Issued</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 11, color: "var(--gov-text-muted)" }}>DECISION BY</span>
                    <span style={{ fontSize: 13 }}>{assessment.jsDecisionBy?.email || "Joint Secretary"}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 11, color: "var(--gov-text-muted)" }}>DECISION REMARKS</span>
                    <p style={{ margin: "4px 0 0", fontSize: 13, background: "#f8fafc", padding: 8, borderRadius: 4 }}>
                      {assessment.jsDecisionRemarks || "No remarks recorded."}
                    </p>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 11, color: "var(--gov-text-muted)" }}>DATE OF DECISION</span>
                    <span style={{ fontSize: 13 }}>{new Date(assessment.jsDecisionAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gov-warning)" }}>
                  <AlertTriangle size={20} />
                  <span style={{ fontWeight: 700 }}>Pending JS Review</span>
                </div>
              )}
            </GovCardBody>
          </GovCard>
        </div>
      </div>
    </GovPortalLayout>
  );
}
