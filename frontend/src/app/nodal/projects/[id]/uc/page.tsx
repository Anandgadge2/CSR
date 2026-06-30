"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, Calendar, ShieldCheck, MessageSquare } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovTextarea from "@/components/gov/GovTextarea";
import { apiFetch } from "@/lib/api";

interface UtilizationCertificate {
  id: string;
  certificateDocumentUrl: string;
  amountUtilized: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  uploadedAt: string;
  remarks: string | null;
  uploadedByUser?: { email: string };
  verifiedByNodalOfficer?: { email: string } | null;
  verifiedAt: string | null;
}

export default function NodalUCPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [selectedUC, setSelectedUC] = useState<UtilizationCertificate | null>(null);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch project & UCs
  const { data: projectResponse, isLoading, refetch } = useQuery({
    queryKey: ["nodal", "project-ucs", projectId],
    queryFn: () => apiFetch<any>(`/convergence-projects/${projectId}`),
    enabled: !!projectId,
  });

  const project = projectResponse?.data || projectResponse;
  const ucs = project?.utilizationCertificates || [];

  const verifyMutation = useMutation({
    mutationFn: ({ ucId, verificationStatus }: { ucId: string; verificationStatus: string }) =>
      apiFetch<any>(`/nodal/utilization-certificates/${ucId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verificationStatus, remarks }),
      }),
    onSuccess: () => {
      setSuccess("Utilisation Certificate verification successfully saved");
      refetch();
      setSelectedUC(null);
      setRemarks("");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to submit verification status");
    },
  });

  const handleOpenVerify = (uc: UtilizationCertificate) => {
    setSelectedUC(uc);
    setRemarks(uc.remarks || "");
    setError(null);
  };

  const handleAction = (verificationStatus: "VERIFIED" | "REJECTED") => {
    if (!selectedUC) return;
    if (!remarks.trim()) {
      setError("Remarks/reason are required for verification action");
      return;
    }
    verifyMutation.mutate({ ucId: selectedUC.id, verificationStatus });
  };

  if (isLoading) {
    return (
      <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
        <div style={{ padding: 100, textAlign: "center", color: "var(--gov-text-muted)" }}>Loading Utilisation Certificates...</div>
      </GovPortalLayout>
    );
  }

  return (
    <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        {/* Back Button */}
        <Link href={`/nodal/projects/${projectId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, color: "var(--gov-primary)", fontWeight: 600, textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Project
        </Link>

        <GovPageHeader
          title="Utilisation Certificates (UCs)"
          description="Review fund utilisation logs. Nodal Officers must audit UC invoices and document signatures."
          breadcrumb="Home / Projects / UCs"
        />

        {error && <GovAlert variant="danger" style={{ marginBottom: 20 }}>{error}</GovAlert>}
        {success && <GovAlert variant="success" style={{ marginBottom: 20 }}>{success}</GovAlert>}

        <div style={{ display: "grid", gridTemplateColumns: selectedUC ? "1fr 400px" : "1fr", gap: 20, alignItems: "start" }}>
          {/* UCs List */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Utilisation Logs</GovCardTitle>
            </GovCardHeader>
            <GovCardBody style={{ padding: 0 }}>
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Uploaded Date</th>
                      <th>Amount Utilised</th>
                      <th>Uploaded By</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ucs.map((uc: any) => (
                      <tr key={uc.id}>
                        <td>{new Date(uc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td>
                          <span style={{ fontWeight: 700 }}>
                            ₹{Number(uc.amountUtilized).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td>{uc.uploadedByUser?.email || "Implementing Agency"}</td>
                        <td>
                          <GovStatusBadge variant={statusToVariant(uc.verificationStatus)}>
                            {uc.verificationStatus}
                          </GovStatusBadge>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <a href={uc.certificateDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                              <GovButton variant="secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }}>
                                <Download size={12} /> Doc
                              </GovButton>
                            </a>
                            {uc.verificationStatus === "PENDING" && (
                              <GovButton variant="primary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }} onClick={() => handleOpenVerify(uc)}>
                                Audit
                              </GovButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GovCardBody>
          </GovCard>

          {/* Verification Panel */}
          {selectedUC && (
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Audit & Verify UC</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", marginBottom: 4 }}>AUDIT AMOUNT</span>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "var(--gov-primary)" }}>
                      ₹{Number(selectedUC.amountUtilized).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", marginBottom: 4 }}>UC DOCUMENT</span>
                    <a href={selectedUC.certificateDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--gov-link)", fontWeight: 600 }}>
                      <FileText size={14} /> Download Uploaded UC PDF
                    </a>
                  </div>

                  <GovTextarea
                    label="Audit Remarks / Rejection Reason"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter audit logs, confirmation of invoices, or rejection reasons..."
                    rows={4}
                    required
                  />

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <GovButton variant="secondary" style={{ flex: 1 }} onClick={() => setSelectedUC(null)}>
                      Cancel
                    </GovButton>
                    <GovButton variant="primary" style={{ flex: 1, background: "var(--gov-success)" }} onClick={() => handleAction("VERIFIED")} disabled={verifyMutation.isPending}>
                      <CheckCircle size={14} style={{ marginRight: 4 }} /> Verify
                    </GovButton>
                    <GovButton variant="primary" style={{ flex: 1, background: "var(--gov-danger)" }} onClick={() => handleAction("REJECTED")} disabled={verifyMutation.isPending}>
                      <XCircle size={14} style={{ marginRight: 4 }} /> Reject
                    </GovButton>
                  </div>
                </div>
              </GovCardBody>
            </GovCard>
          )}
        </div>
      </div>
    </GovPortalLayout>
  );
}
