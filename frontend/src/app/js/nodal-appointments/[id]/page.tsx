"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import GovInput from "@/components/gov/GovInput";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch, clearApiCache } from "@/lib/api";
import { hasRoleAccess, JS_ROLES } from "@/lib/roleAccess";

interface AppointmentDetail {
  id: string;
  district: string;
  domain: string;
  nodalOfficerName: string;
  designation: string;
  department: string;
  appointmentLetterUrl: string | null;
  appointedAt: string;
  collectorCc: boolean;
  zpCeoCc: boolean;
  nodalOfficerUser?: {
    id: string;
    email: string;
    name: string;
  };
  appointedByJs?: {
    email: string;
  };
  corporateEnquiry?: {
    trackingId: string;
    companyName: string;
    sector: string;
    proposedCsrWork: string;
    status: string;
  };
  governmentPitch?: {
    pitchReferenceId: string;
    officialName: string;
    department: string;
    csrRequirement: string;
    status: string;
  };
  assessment?: {
    reportReference: string;
    feasibilityResult: string;
  };
}

export default function JSNodalAppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Letter Upload Form
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: AppointmentDetail }>(`/js/nodal-appointments/${id}`);
      setAppointment(res?.data || null);
      if (res?.data?.appointmentLetterUrl) {
        setUploadUrl(res.data.appointmentLetterUrl);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (mounted && hasRoleAccess(JS_ROLES)) {
      fetchDetails();
    }
  }, [mounted, fetchDetails]);

  if (!mounted) return null;
  if (!hasRoleAccess(JS_ROLES)) return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;

  if (loading) {
    return (
      <GovPortalLayout>
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--gov-border)", borderTopColor: "var(--gov-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--gov-text-muted)" }}>Loading appointment details…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </GovPortalLayout>
    );
  }

  if (error || !appointment) {
    return (
      <GovPortalLayout>
        <GovPageShell breadcrumb="Home / Appointments / Detail" title="Appointment Not Found">
          <GovAlert variant="danger">{error || "Appointment not found"}</GovAlert>
          <GovButton variant="muted" onClick={() => router.push("/js/nodal-appointments")} style={{ marginTop: 12 }}>← Back</GovButton>
        </GovPageShell>
      </GovPortalLayout>
    );
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const handleUploadLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!uploadUrl.trim()) { setUploadError("Please provide a valid document URL"); return; }

    setUploadLoading(true);
    try {
      // Direct update of the appointment model on the assessment/enquiry
      await apiFetch(`/js/assessments/${appointment.assessment?.reportReference ? appointment.assessment.reportReference.replace("FES-", "") : appointment.id}/nodal-officer`, {
        method: "POST",
        body: JSON.stringify({
          district: appointment.district,
          domain: appointment.domain,
          nodalOfficerUserId: appointment.nodalOfficerUser?.id,
          nodalOfficerName: appointment.nodalOfficerName,
          designation: appointment.designation,
          department: appointment.department,
          appointmentLetterUrl: uploadUrl.trim(),
          collectorCc: appointment.collectorCc,
          zpCeoCc: appointment.zpCeoCc,
        }),
      });
      setUploadSuccess("Appointment letter uploaded successfully.");
      clearApiCache();
      fetchDetails();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Failed to save appointment letter URL");
    } finally {
      setUploadLoading(false);
    }
  };

  const caseId = appointment.corporateEnquiry?.trackingId || appointment.governmentPitch?.pitchReferenceId || "—";
  const caseType = appointment.corporateEnquiry ? "Corporate CSR Enquiry" : "Government Department Pitch";
  const caseStatus = appointment.corporateEnquiry?.status || appointment.governmentPitch?.status || "—";

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb={`Home / Appointments / ${appointment.id}`}
        title={`Appointment letter details — ID: ${appointment.id}`}
        description={`Review appointed Nodal Officer profiles, check project status, and upload official appointment letters.`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <GovButton variant="muted" onClick={() => router.push("/js/nodal-appointments")}>← Back to List</GovButton>
          </div>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginTop: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Officer Profile details */}
            <GovCard>
              <GovCardHeader><GovCardTitle>🎖️ Appointed Nodal Officer Profile</GovCardTitle></GovCardHeader>
              <GovCardBody style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><strong>Officer Name:</strong> {appointment.nodalOfficerName}</div>
                <div><strong>Designation:</strong> {appointment.designation}</div>
                <div><strong>Department:</strong> {appointment.department}</div>
                <div><strong>District Scope:</strong> {appointment.district}</div>
                <div><strong>Domain/Sector:</strong> {appointment.domain}</div>
                <div><strong>Official Email:</strong> {appointment.nodalOfficerUser?.email || "—"}</div>
                <div><strong>Appointed By:</strong> JS User ({appointment.appointedByJs?.email || "js.user@mahacsr.gov.in"})</div>
                <div><strong>Appointed Date:</strong> {fmtDate(appointment.appointedAt)}</div>
              </GovCardBody>
            </GovCard>

            {/* Linked Case Details */}
            <GovCard>
              <GovCardHeader><GovCardTitle>📂 Associated Convergence Project Case</GovCardTitle></GovCardHeader>
              <GovCardBody style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><strong>Case ID:</strong> {caseId}</div>
                  <div><strong>Case Type:</strong> {caseType}</div>
                  <div><strong>Linked Assessment:</strong> {appointment.assessment?.reportReference || "—"}</div>
                  <div>
                    <strong>Project Status:</strong>
                    <GovStatusBadge variant="info" style={{ marginLeft: 6 }}>{caseStatus.replace(/_/g, " ")}</GovStatusBadge>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--gov-border)", paddingTop: 12 }}>
                  {appointment.corporateEnquiry ? (
                    <>
                      <strong>Company Name:</strong> {appointment.corporateEnquiry.companyName}
                      <div style={{ marginTop: 6 }}>
                        <strong>Proposed CSR Work:</strong>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gov-text-secondary)" }}>
                          {appointment.corporateEnquiry.proposedCsrWork}
                        </p>
                      </div>
                    </>
                  ) : appointment.governmentPitch ? (
                    <>
                      <strong>Official Name:</strong> {appointment.governmentPitch.officialName}
                      <div style={{ marginTop: 6 }}>
                        <strong>CSR Requirement:</strong>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gov-text-secondary)" }}>
                          {appointment.governmentPitch.csrRequirement}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </GovCardBody>
            </GovCard>

            {/* Appointment Letter Action */}
            <GovCard>
              <GovCardHeader><GovCardTitle>✉️ Official Appointment Letter Document</GovCardTitle></GovCardHeader>
              <GovCardBody>
                {uploadSuccess && <GovAlert variant="success">{uploadSuccess}</GovAlert>}
                {uploadError && <GovAlert variant="danger">{uploadError}</GovAlert>}

                {appointment.appointmentLetterUrl ? (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 14, color: "var(--gov-text-secondary)" }}>
                      The signed appointment letter has been successfully issued.
                    </p>
                    <a href={appointment.appointmentLetterUrl} target="_blank" rel="noopener noreferrer">
                      <GovButton variant="secondary">📥 Download Issued Letter</GovButton>
                    </a>
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--gov-text-secondary)" }}>
                    No signed appointment letter has been uploaded yet. Provide the letter URL below to complete verification.
                  </p>
                )}

                <form onSubmit={handleUploadLetter} style={{ borderTop: "1px solid var(--gov-border)", paddingTop: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <GovInput
                        label="Signed Letter PDF Document URL *"
                        placeholder="https://example.com/letters/appointment.pdf"
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        required
                      />
                    </div>
                    <GovButton type="submit" disabled={uploadLoading} style={{ minHeight: 38 }}>
                      {uploadLoading ? "Saving…" : "Save Appointment Letter"}
                    </GovButton>
                  </div>
                </form>
              </GovCardBody>
            </GovCard>
          </div>

          {/* Sidebar */}
          <div>
            <h3 className="gov-section-title">Notification CCs</h3>
            <GovCard>
              <GovCardBody style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>District Collector Office</div>
                  <GovStatusBadge variant={appointment.collectorCc ? "success" : "muted"}>
                    {appointment.collectorCc ? "Notification Sent" : "No CC"}
                  </GovStatusBadge>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>Zilla Parishad CEO Office</div>
                  <GovStatusBadge variant={appointment.zpCeoCc ? "success" : "muted"}>
                    {appointment.zpCeoCc ? "Notification Sent" : "No CC"}
                  </GovStatusBadge>
                </div>
              </GovCardBody>
            </GovCard>
          </div>
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
