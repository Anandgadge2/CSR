"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { hasRoleAccess, CONVERGENCE_PROJECT_ROLES } from "@/lib/roleAccess";
import { useAuthStore } from "@/store/authStore";

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
  utilizationCertificates?: UC[];
}

interface UC {
  id: string;
  certificateDocumentUrl: string;
  amountUtilized: number | string;
  verificationStatus: string;
  remarks: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
  uploadedByUser?: { email: string };
  verifiedByNodalOfficer?: { email: string };
}

interface Grievance {
  id: string;
  grievanceId: string;
  issueTitle: string;
  status: string;
  createdAt: string;
}

interface ProjectDetail {
  id: string;
  projectId: string;
  title: string;
  district: string;
  taluka: string;
  location: string;
  sector: string;
  corporateName: string;
  approvedBudget: number | string;
  utilizedAmount: number | string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  nodalOfficerUser?: { email: string };
  implementingAgencyUser?: { email: string };
  mou?: { id: string; mouReferenceId: string; status: string; governmentParty: string; corporateParty: string; implementingAgency: string; signedDocumentUrl: string | null };
  milestones?: Milestone[];
  utilizationCertificates?: UC[];
  grievances?: Grievance[];
}

export default function ConvergenceProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isNodal = user?.role === "DISTRICT_NODAL_OFFICER" || user?.role === "NODAL_OFFICER";

  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isNodal && id) {
      router.replace(`/nodal/projects/${id}`);
    }
  }, [mounted, isNodal, id, router]);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: ProjectDetail }>(`/convergence-projects/${id}`);
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
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  if (loading) {
    return (
      <GovPortalLayout>
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--gov-border)", borderTopColor: "var(--gov-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--gov-text-muted)" }}>Loading project…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </GovPortalLayout>
    );
  }

  if (error || !project) {
    return (
      <GovPortalLayout>
        <GovPageShell breadcrumb="Home / Projects / Detail" title="Project Not Found">
          <GovAlert variant="danger">{error || "Project not found"}</GovAlert>
          <GovButton variant="muted" onClick={() => router.push("/convergence-projects")} style={{ marginTop: 12 }}>← Back</GovButton>
        </GovPageShell>
      </GovPortalLayout>
    );
  }

  const tabs = ["overview", "mou", "milestones", "uc", "grievances"];

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Projects / Detail"
        title={project.title}
        description={`${project.projectId} — ${project.district}, ${project.sector}`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <GovStatusBadge variant={statusToVariant(project.status)} style={{ fontSize: 14, padding: "6px 14px" }}>{project.status.replace(/_/g, " ")}</GovStatusBadge>
            <Link href={`/projects/${project.id}/tracking`}><GovButton variant="secondary">Milestone Tracking</GovButton></Link>
          </div>
        }
      >
        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
          {[
            { label: "Approved Budget", value: fmtCurrency(project.approvedBudget) },
            { label: "Amount Utilised", value: fmtCurrency(project.utilizedAmount) },
            { label: "Physical Progress", value: `${project.physicalProgressPercent}%` },
            { label: "Nodal Officer", value: project.nodalOfficerUser?.email?.split("@")[0] || "—" },
            { label: "Implementing Agency", value: project.implementingAgencyUser?.email?.split("@")[0] || "—" },
            { label: "Corporate", value: project.corporateName },
          ].map((item) => (
            <GovCard key={item.label}>
              <GovCardBody>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6, color: "var(--gov-primary-dark)" }}>{item.value}</div>
              </GovCardBody>
            </GovCard>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--gov-border)", marginTop: 20 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderBottom: activeTab === tab ? "3px solid var(--gov-primary)" : "3px solid transparent",
                background: "none",
                cursor: "pointer",
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? "var(--gov-primary)" : "var(--gov-text-muted)",
                fontSize: 13,
                textTransform: "capitalize",
              }}
            >
              {tab === "uc" ? "Utilisation Certificates" : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: 16 }}>
          {activeTab === "overview" && (
            <GovCard>
              <GovCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    ["Sector", project.sector],
                    ["Location", `${project.taluka}, ${project.district}`],
                    ["Exact Location", project.location],
                    ["Status", project.status.replace(/_/g, " ")],
                    ["Created", fmtDate(project.createdAt)],
                    ["Last Updated", fmtDate(project.updatedAt)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gov-text-muted)" }}>{label}</div>
                      <div style={{ fontSize: 14, marginTop: 4 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </GovCardBody>
            </GovCard>
          )}

          {activeTab === "mou" && (
            <GovCard>
              <GovCardHeader><GovCardTitle>Tripartite MoU</GovCardTitle></GovCardHeader>
              <GovCardBody>
                {project.mou ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      ["MoU Reference", project.mou.mouReferenceId],
                      ["Status", project.mou.status],
                      ["Government Party", project.mou.governmentParty],
                      ["Corporate Party", project.mou.corporateParty],
                      ["Implementing Agency", project.mou.implementingAgency],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gov-text-muted)" }}>{label}</div>
                        <div style={{ fontSize: 14, marginTop: 4 }}>{value || "—"}</div>
                      </div>
                    ))}
                    {project.mou.signedDocumentUrl && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gov-text-muted)" }}>Signed Document</div>
                        <a href={project.mou.signedDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, marginTop: 4, display: "block" }}>Download Signed MoU</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: "var(--gov-text-muted)" }}>MoU details not available.</p>
                )}
              </GovCardBody>
            </GovCard>
          )}

          {activeTab === "milestones" && (
            <GovCard>
              <GovCardHeader><GovCardTitle>Project Milestones</GovCardTitle></GovCardHeader>
              <GovCardBody style={{ padding: 0 }}>
                <div className="gov-table-container">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Milestone</th>
                        <th>Work Type</th>
                        <th>Status</th>
                        <th>Funds Utilised</th>
                        <th>Photos</th>
                        <th>Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(project.milestones || []).length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--gov-text-muted)" }}>No milestones defined.</td></tr>
                      ) : (
                        project.milestones!.map((m) => (
                          <tr key={m.id}>
                            <td><div style={{ fontWeight: 700 }}>{m.name}</div>{m.description && <div style={{ fontSize: 12, color: "var(--gov-text-muted)" }}>{m.description}</div>}</td>
                            <td>{m.workType.replace(/_/g, " ")}</td>
                            <td><GovStatusBadge variant={statusToVariant(m.status)}>{m.status.replace(/_/g, " ")}</GovStatusBadge></td>
                            <td>{fmtCurrency(m.fundsUtilized)}</td>
                            <td>{m.geoTaggedPhotoUrls?.length || 0} photo(s)</td>
                            <td>{m.verifiedAt ? <GovStatusBadge variant="success">Verified</GovStatusBadge> : <GovStatusBadge variant="muted">Pending</GovStatusBadge>}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GovCardBody>
            </GovCard>
          )}

          {activeTab === "uc" && (
            <GovCard>
              <GovCardHeader><GovCardTitle>Utilisation Certificates</GovCardTitle></GovCardHeader>
              <GovCardBody style={{ padding: 0 }}>
                <div className="gov-table-container">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Uploaded At</th>
                        <th>Amount Utilised</th>
                        <th>Status</th>
                        <th>Uploaded By</th>
                        <th>Verified By</th>
                        <th>Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(project.utilizationCertificates || []).length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--gov-text-muted)" }}>No Utilisation Certificates uploaded.</td></tr>
                      ) : (
                        project.utilizationCertificates!.map((uc) => (
                          <tr key={uc.id}>
                            <td>{fmtDate(uc.uploadedAt)}</td>
                            <td>{fmtCurrency(uc.amountUtilized)}</td>
                            <td><GovStatusBadge variant={statusToVariant(uc.verificationStatus)}>{uc.verificationStatus}</GovStatusBadge></td>
                            <td>{uc.uploadedByUser?.email?.split("@")[0] || "—"}</td>
                            <td>{uc.verifiedByNodalOfficer?.email?.split("@")[0] || "Pending"}</td>
                            <td><a href={uc.certificateDocumentUrl} target="_blank" rel="noopener noreferrer">View</a></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GovCardBody>
            </GovCard>
          )}

          {activeTab === "grievances" && (
            <GovCard>
              <GovCardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <GovCardTitle>Related Grievances</GovCardTitle>
                  <GovButton variant="secondary" onClick={() => router.push("/grievances")} style={{ fontSize: 12, padding: "4px 12px", minHeight: 28 }}>Raise Grievance</GovButton>
                </div>
              </GovCardHeader>
              <GovCardBody style={{ padding: 0 }}>
                <div className="gov-table-container">
                  <table className="gov-table">
                    <thead>
                      <tr><th>ID</th><th>Issue</th><th>Status</th><th>Raised</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {(project.grievances || []).length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--gov-text-muted)" }}>No grievances for this project.</td></tr>
                      ) : (
                        project.grievances!.map((g) => (
                          <tr key={g.id}>
                            <td style={{ fontWeight: 700, color: "var(--gov-link)" }}>{g.grievanceId}</td>
                            <td>{g.issueTitle}</td>
                            <td><GovStatusBadge variant={statusToVariant(g.status)}>{g.status.replace(/_/g, " ")}</GovStatusBadge></td>
                            <td>{fmtDate(g.createdAt)}</td>
                            <td><Link href={`/grievances/${g.id}`}><GovButton variant="muted" style={{ fontSize: 11, padding: "3px 10px", minHeight: 28 }}>View</GovButton></Link></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GovCardBody>
            </GovCard>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <GovButton variant="muted" onClick={() => router.push("/convergence-projects")}>← Back to Projects</GovButton>
        </div>
      </GovPageShell>
    </GovPortalLayout>
  );
}
