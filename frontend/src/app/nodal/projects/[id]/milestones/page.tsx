"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Clock, Calendar, ShieldCheck, AlertTriangle, FileText, Image } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovTextarea from "@/components/gov/GovTextarea";
import { apiFetch } from "@/lib/api";

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string | null;
  geoTaggedPhotoUrls: string[];
  verifiedAt: string | null;
  fundsUtilized: number | null;
}

export default function NodalMilestonesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch project & milestones
  const { data: projectResponse, isLoading, refetch } = useQuery({
    queryKey: ["nodal", "project-milestones", projectId],
    queryFn: () => apiFetch<any>(`/convergence-projects/${projectId}`),
    enabled: !!projectId,
  });

  const project = projectResponse?.data || projectResponse;
  const milestones = project?.milestones || [];

  const verifyMutation = useMutation({
    mutationFn: (milestoneId: string) =>
      apiFetch<any>(`/nodal/milestones/${milestoneId}/verify`, {
        method: "POST",
        body: JSON.stringify({ isVerified: true, remarks }),
      }),
    onSuccess: () => {
      setSuccess("Milestone verification successfully logged");
      refetch();
      setSelectedMilestone(null);
      setRemarks("");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to log milestone verification");
    },
  });

  const handleVerify = (m: Milestone) => {
    setSelectedMilestone(m);
    setRemarks("");
    setError(null);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    if (!remarks.trim()) {
      setError("Verification remarks are required");
      return;
    }
    verifyMutation.mutate(selectedMilestone.id);
  };

  if (isLoading) {
    return (
      <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
        <div style={{ padding: 100, textAlign: "center", color: "var(--gov-text-muted)" }}>Loading Milestones...</div>
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
          title="Project Deliverables & Milestones"
          description="Track physical execution milestones. Nodal Officers must inspect geo-tagged site images and verify completions."
          breadcrumb="Home / Projects / Milestones"
        />

        {error && <GovAlert variant="danger" style={{ marginBottom: 20 }}>{error}</GovAlert>}
        {success && <GovAlert variant="success" style={{ marginBottom: 20 }}>{success}</GovAlert>}

        <div style={{ display: "grid", gridTemplateColumns: selectedMilestone ? "1fr 400px" : "1fr", gap: 20, alignItems: "start" }}>
          {/* Milestones List */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Milestones Monitor</GovCardTitle>
            </GovCardHeader>
            <GovCardBody style={{ padding: 0 }}>
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Milestone Name</th>
                      <th>Target Due Date</th>
                      <th>Progress State</th>
                      <th>Verification Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m: Milestone) => (
                      <tr key={m.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{m.name}</div>
                          {m.description && <div style={{ fontSize: 12, color: "var(--gov-text-muted)", marginTop: 2 }}>{m.description}</div>}
                        </td>
                        <td>{m.dueDate ? new Date(m.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                        <td>
                          <GovStatusBadge variant={statusToVariant(m.status)}>
                            {m.status.replace(/_/g, " ")}
                          </GovStatusBadge>
                        </td>
                        <td>
                          {m.verifiedAt ? (
                            <GovStatusBadge variant="success">VERIFIED</GovStatusBadge>
                          ) : (
                            <GovStatusBadge variant="warning">PENDING REVIEW</GovStatusBadge>
                          )}
                        </td>
                        <td>
                          {m.status === "COMPLETED" && !m.verifiedAt && (
                            <GovButton variant="secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }} onClick={() => handleVerify(m)}>
                              Verify
                            </GovButton>
                          )}
                          {m.verifiedAt && <span style={{ fontSize: 13, color: "var(--gov-text-muted)" }}>Verified</span>}
                          {m.status !== "COMPLETED" && <span style={{ fontSize: 13, color: "var(--gov-text-muted)" }}>In Execution</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GovCardBody>
          </GovCard>

          {/* Verification Panel */}
          {selectedMilestone && (
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Verify Milestone: {selectedMilestone.name}</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <form onSubmit={handleVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Geo-tagged photos review */}
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", marginBottom: 6 }}>GEO-TAGGED EVIDENCE</span>
                    {selectedMilestone.geoTaggedPhotoUrls.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {selectedMilestone.geoTaggedPhotoUrls.map((url, idx) => (
                          <div key={idx} style={{ border: "1px solid var(--gov-border)", borderRadius: 4, overflow: "hidden", height: 100 }}>
                            <img src={url} alt="Evidence" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 12, background: "#f8fafc", borderRadius: 4, textAlign: "center", fontSize: 12, color: "var(--gov-text-muted)" }}>
                        <Image size={24} style={{ display: "block", margin: "0 auto 4px", opacity: 0.5 }} />
                        No photo evidence uploaded yet.
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)" }}>FUNDS UTILIZED</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      ₹{Number(selectedMilestone.fundsUtilized || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <GovTextarea
                    label="Verification Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter detailed validation logs and verification checks..."
                    rows={4}
                    required
                  />

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                    <GovButton variant="secondary" type="button" onClick={() => setSelectedMilestone(null)}>
                      Cancel
                    </GovButton>
                    <GovButton variant="primary" type="submit" disabled={verifyMutation.isPending}>
                      Confirm Verify
                    </GovButton>
                  </div>
                </form>
              </GovCardBody>
            </GovCard>
          )}
        </div>
      </div>
    </GovPortalLayout>
  );
}
