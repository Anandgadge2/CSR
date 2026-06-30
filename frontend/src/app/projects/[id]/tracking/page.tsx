"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovTimeline, { TimelineStep } from "@/components/gov/GovTimeline";
import GovAlert from "@/components/gov/GovAlert";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, hasRoleAccess, CONVERGENCE_PROJECT_ROLES } from "@/lib/roleAccess";

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  workType: string;
  status: string;
  fundsUtilized: number | string;
  geoTaggedPhotoUrls: string[];
  verifiedByNodalOfficerId: string | null;
  verifiedAt: string | null;
  verifiedByNodalOfficer?: { email: string };
  createdAt: string;
  utilizationCertificates?: {
    id: string;
    verificationStatus: string;
    amountUtilized: number | string;
    certificateDocumentUrl: string;
  }[];
}

interface ProjectTracking {
  id: string;
  projectId: string;
  title: string;
  district: string;
  corporateName: string;
  approvedBudget: number | string;
  utilizedAmount: number | string;
  physicalProgressPercent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  mou?: { mouReferenceId: string; status: string; signedAt: string | null };
  milestones?: Milestone[];
  nodalOfficerUser?: { email: string };
}

export default function ProjectTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<ProjectTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressForms, setProgressForms] = useState<Record<string, { status: string; fundsUtilized: string; photoUrl: string; remarks: string }>>({});
  const [ucForms, setUcForms] = useState<Record<string, { certificateDocumentUrl: string; amountUtilized: string; remarks: string }>>({});
  const [actionMessage, setActionMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: ProjectTracking }>(`/convergence-projects/${id}`);
      setProject(res?.data || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (mounted && hasRoleAccess(CONVERGENCE_PROJECT_ROLES)) fetchProject();
  }, [mounted, fetchProject]);

  if (!mounted) return null;
  if (!hasRoleAccess(CONVERGENCE_PROJECT_ROLES)) return <AccessDenied />;

  const fmtCurrency = (v: number | string) => `₹${Number(v).toLocaleString("en-IN")}`;
  const currentUser = getCurrentUser();
  const canUpdateProgress = ["IMPLEMENTING_AGENCY_USER", "NGO_ADMIN", "NGO_MEMBER", "DISTRICT_NODAL_OFFICER", "SUPER_ADMIN", "PORTAL_ADMIN", "CSR_ADMIN"].includes(currentUser?.role || "");

  const updateProgressForm = (milestoneId: string, key: "status" | "fundsUtilized" | "photoUrl" | "remarks", value: string) => {
    setProgressForms((prev) => ({
      ...prev,
      [milestoneId]: {
        status: prev[milestoneId]?.status || "IN_PROGRESS",
        fundsUtilized: prev[milestoneId]?.fundsUtilized || "",
        photoUrl: prev[milestoneId]?.photoUrl || "",
        remarks: prev[milestoneId]?.remarks || "",
        [key]: value,
      },
    }));
  };

  const updateUcForm = (milestoneId: string, key: "certificateDocumentUrl" | "amountUtilized" | "remarks", value: string) => {
    setUcForms((prev) => ({
      ...prev,
      [milestoneId]: {
        certificateDocumentUrl: prev[milestoneId]?.certificateDocumentUrl || "",
        amountUtilized: prev[milestoneId]?.amountUtilized || "",
        remarks: prev[milestoneId]?.remarks || "",
        [key]: value,
      },
    }));
  };

  const submitMilestoneProgress = async (milestone: Milestone) => {
    const form = progressForms[milestone.id];
    if (!form?.status) return;

    setSavingId(`progress-${milestone.id}`);
    setActionMessage("");
    try {
      await apiFetch(`/convergence-projects/${project!.id}/milestones/${milestone.id}/progress`, {
        method: "POST",
        body: JSON.stringify({
          status: form.status,
          fundsUtilized: form.fundsUtilized ? Number(form.fundsUtilized) : undefined,
          geoTaggedPhotoUrls: form.photoUrl ? [form.photoUrl] : undefined,
          remarks: form.remarks || undefined,
        }),
      });
      setActionMessage("Milestone progress saved.");
      await fetchProject();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : "Failed to save milestone progress.");
    } finally {
      setSavingId("");
    }
  };

  const submitUc = async (milestone: Milestone) => {
    const form = ucForms[milestone.id];
    if (!form?.certificateDocumentUrl || !form?.amountUtilized) {
      setActionMessage("UC document URL and amount are required.");
      return;
    }

    setSavingId(`uc-${milestone.id}`);
    setActionMessage("");
    try {
      await apiFetch(`/convergence-projects/${project!.id}/uc`, {
        method: "POST",
        body: JSON.stringify({
          milestoneId: milestone.id,
          certificateDocumentUrl: form.certificateDocumentUrl,
          amountUtilized: Number(form.amountUtilized),
          remarks: form.remarks || undefined,
        }),
      });
      setActionMessage("Utilization Certificate uploaded for verification.");
      await fetchProject();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : "Failed to upload UC.");
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return (
      <GovPortalLayout>
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--gov-border)", borderTopColor: "var(--gov-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--gov-text-muted)" }}>Loading tracking data…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </GovPortalLayout>
    );
  }

  if (error || !project) {
    return (
      <GovPortalLayout>
        <GovPageShell breadcrumb="Home / Projects / Tracking" title="Project Not Found">
          <GovAlert variant="danger">{error || "Project not found"}</GovAlert>
          <GovButton variant="muted" onClick={() => router.push("/convergence-projects")} style={{ marginTop: 12 }}>← Back</GovButton>
        </GovPageShell>
      </GovPortalLayout>
    );
  }

  const milestones = project.milestones || [];
  const completedCount = milestones.filter((m) => m.status === "COMPLETED").length;
  const inProgressCount = milestones.filter((m) => m.status === "IN_PROGRESS").length;

  // Build project lifecycle timeline
  const lifecycleSteps: TimelineStep[] = [
    { label: "Project Onboarded", description: `${project.projectId} created`, date: project.createdAt, status: "completed" },
  ];
  if (project.mou) {
    lifecycleSteps.push({
      label: "MoU Signed",
      description: `${project.mou.mouReferenceId} — ${project.mou.status}`,
      date: project.mou.signedAt || undefined,
      status: project.mou.status === "ACTIVE" || project.mou.status === "SIGNED" ? "completed" : "active",
    });
  }
  if (milestones.length > 0) {
    lifecycleSteps.push({
      label: `Milestones (${completedCount}/${milestones.length} completed)`,
      description: `${inProgressCount} in progress`,
      status: completedCount === milestones.length ? "completed" : milestones.some((m) => m.status !== "NOT_STARTED") ? "active" : "pending",
    });
  }
  const allUCsVerified = milestones.every((m) => m.utilizationCertificates?.some((uc) => uc.verificationStatus === "VERIFIED"));
  lifecycleSteps.push({
    label: "UC Verification",
    description: allUCsVerified ? "All utilization certificates verified" : "Pending verification",
    status: allUCsVerified ? "completed" : "pending",
  });
  lifecycleSteps.push({
    label: "Project Completion",
    description: project.status === "COMPLETED" ? "Project completed" : "Pending",
    status: project.status === "COMPLETED" ? "completed" : "pending",
  });

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Convergence Projects / Milestone Tracking"
        title="Milestone Tracking"
        description={`${project.projectId} — ${project.title}`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <GovStatusBadge variant={statusToVariant(project.status)} style={{ fontSize: 14, padding: "6px 14px" }}>{project.status.replace(/_/g, " ")}</GovStatusBadge>
            <GovButton variant="muted" onClick={() => router.push(`/convergence-projects/${project.id}`)}>View Project</GovButton>
          </div>
        }
      >
        {/* Progress Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
          {[
            { label: "Overall Progress", value: `${project.physicalProgressPercent}%`, color: "var(--gov-primary)" },
            { label: "Budget", value: fmtCurrency(project.approvedBudget), color: "var(--gov-text)" },
            { label: "Utilized", value: fmtCurrency(project.utilizedAmount), color: "var(--gov-link)" },
            { label: "Milestones Completed", value: `${completedCount} / ${milestones.length}`, color: "var(--gov-success)" },
          ].map((k) => (
            <GovCard key={k.label}>
              <GovCardBody>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color, marginTop: 6 }}>{k.value}</div>
              </GovCardBody>
            </GovCard>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginTop: 16 }}>
          {/* Milestones */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 className="gov-section-title">Milestones</h3>
            {actionMessage && (
              <GovAlert variant={actionMessage.toLowerCase().includes("failed") || actionMessage.toLowerCase().includes("required") ? "danger" : "success"}>
                {actionMessage}
              </GovAlert>
            )}
            {milestones.length === 0 ? (
              <GovCard>
                <GovCardBody style={{ textAlign: "center", color: "var(--gov-text-muted)", padding: 32 }}>
                  No milestones defined for this project.
                </GovCardBody>
              </GovCard>
            ) : (
              milestones.map((m, idx) => (
                <GovCard key={m.id}>
                  <GovCardBody>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 11, color: "var(--gov-text-muted)" }}>#{idx + 1}</span>
                          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--gov-primary-dark)" }}>{m.name}</span>
                        </div>
                        {m.description && <div style={{ fontSize: 13, color: "var(--gov-text-secondary)", marginBottom: 8 }}>{m.description}</div>}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, fontSize: 13 }}>
                          <div><span style={{ fontWeight: 700, color: "var(--gov-text-muted)" }}>Work Type: </span>{m.workType.replace(/_/g, " ")}</div>
                          <div><span style={{ fontWeight: 700, color: "var(--gov-text-muted)" }}>Funds: </span>{fmtCurrency(m.fundsUtilized)}</div>
                          <div><span style={{ fontWeight: 700, color: "var(--gov-text-muted)" }}>Photos: </span>{m.geoTaggedPhotoUrls?.length || 0}</div>
                          <div><span style={{ fontWeight: 700, color: "var(--gov-text-muted)" }}>UC: </span>{m.utilizationCertificates?.[0]?.verificationStatus || "PENDING"}</div>
                          <div><span style={{ fontWeight: 700, color: "var(--gov-text-muted)" }}>Verification: </span>{m.verifiedAt ? "✓ Verified" : "Pending"}</div>
                        </div>
                      </div>
                      <GovStatusBadge variant={statusToVariant(m.status)}>
                        {m.status.replace(/_/g, " ")}
                      </GovStatusBadge>
                    </div>
                    {canUpdateProgress && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--gov-border)", display: "grid", gap: 12 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                          <label className="gov-field">
                            <span className="gov-label">Milestone Status</span>
                            <select
                              className="gov-select"
                              value={progressForms[m.id]?.status || m.status}
                              onChange={(e) => updateProgressForm(m.id, "status", e.target.value)}
                            >
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </label>
                          <label className="gov-field">
                            <span className="gov-label">Funds Utilized</span>
                            <input
                              className="gov-input"
                              type="number"
                              min="0"
                              value={progressForms[m.id]?.fundsUtilized || ""}
                              onChange={(e) => updateProgressForm(m.id, "fundsUtilized", e.target.value)}
                              placeholder={String(m.fundsUtilized || 0)}
                            />
                          </label>
                          <label className="gov-field">
                            <span className="gov-label">Geo-Tagged Photo URL</span>
                            <input
                              className="gov-input"
                              value={progressForms[m.id]?.photoUrl || ""}
                              onChange={(e) => updateProgressForm(m.id, "photoUrl", e.target.value)}
                              placeholder="https://..."
                            />
                          </label>
                        </div>
                        <label className="gov-field">
                          <span className="gov-label">Progress Remarks</span>
                          <textarea
                            className="gov-textarea"
                            rows={2}
                            value={progressForms[m.id]?.remarks || ""}
                            onChange={(e) => updateProgressForm(m.id, "remarks", e.target.value)}
                            placeholder="Optional field note for nodal officer review"
                          />
                        </label>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <GovButton onClick={() => submitMilestoneProgress(m)} disabled={savingId === `progress-${m.id}`}>
                            {savingId === `progress-${m.id}` ? "Saving..." : "Save Progress"}
                          </GovButton>
                        </div>

                        <div style={{ padding: 12, background: "var(--gov-surface-muted)", border: "1px solid var(--gov-border)" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--gov-primary)", marginBottom: 10 }}>Utilization Certificate</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                            <label className="gov-field">
                              <span className="gov-label">UC Document URL</span>
                              <input
                                className="gov-input"
                                value={ucForms[m.id]?.certificateDocumentUrl || ""}
                                onChange={(e) => updateUcForm(m.id, "certificateDocumentUrl", e.target.value)}
                                placeholder="https://..."
                              />
                            </label>
                            <label className="gov-field">
                              <span className="gov-label">Amount Utilized</span>
                              <input
                                className="gov-input"
                                type="number"
                                min="0"
                                value={ucForms[m.id]?.amountUtilized || ""}
                                onChange={(e) => updateUcForm(m.id, "amountUtilized", e.target.value)}
                                placeholder="Amount"
                              />
                            </label>
                          </div>
                          <label className="gov-field">
                            <span className="gov-label">UC Remarks</span>
                            <textarea
                              className="gov-textarea"
                              rows={2}
                              value={ucForms[m.id]?.remarks || ""}
                              onChange={(e) => updateUcForm(m.id, "remarks", e.target.value)}
                              placeholder="Optional UC note"
                            />
                          </label>
                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <GovButton variant="secondary" onClick={() => submitUc(m)} disabled={savingId === `uc-${m.id}`}>
                              {savingId === `uc-${m.id}` ? "Uploading..." : "Upload UC"}
                            </GovButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </GovCardBody>
                </GovCard>
              ))
            )}
          </div>

          {/* Lifecycle Timeline */}
          <div>
            <h3 className="gov-section-title">Project Lifecycle</h3>
            <GovCard>
              <GovCardBody>
                <GovTimeline steps={lifecycleSteps} />
              </GovCardBody>
            </GovCard>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <GovButton variant="muted" onClick={() => router.push("/convergence-projects")}>← Back to Projects</GovButton>
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
