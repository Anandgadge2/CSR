"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import { apiFetch } from "@/lib/api";
import { 
  Building2, 
  FolderOpen, 
  CheckCircle2, 
  ClipboardList, 
  ShieldCheck, 
  FileText,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  projectId: string;
  title: string;
  district: string;
  taluka: string;
  sector: string;
  corporateName: string;
  approvedBudget: number | string;
  utilizedAmount: number | string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  status: string;
  createdAt: string;
  nodalOfficerUser?: { email: string };
  _count?: { milestones: number; utilizationCertificates: number; grievances: number };
}

export default function AgencyDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: Project[] }>("/convergence-projects");
      setProjects(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) fetchDashboardData();
  }, [mounted, fetchDashboardData]);

  if (!mounted) return null;

  const totalProjects = projects.length;
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "EXECUTION_STARTED").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.approvedBudget || 0), 0);
  const totalUtilized = projects.reduce((sum, p) => sum + Number(p.utilizedAmount || 0), 0);
  const avgPhysicalProgress = totalProjects 
    ? Math.round(projects.reduce((sum, p) => sum + (p.physicalProgressPercent || 0), 0) / totalProjects) 
    : 0;

  const fmtCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  return (
    <GovPortalLayout userRole="IMPLEMENTING_AGENCY_USER">
      <GovPageShell
        breadcrumb="Home / Agency / Dashboard"
        title="Implementing Agency Dashboard"
        description="Monitor assigned corporate-government CSR convergence projects, track physical deliverables, and submit utilization certificates."
      >
        {isLoadingStats(loading, error)}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
            {/* Metric KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              
              <GovCard>
                <GovCardBody style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "#eff6ff", borderRadius: 8, padding: 10 }}>
                    <Building2 size={24} style={{ color: "var(--gov-primary)" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Total Projects</span>
                    <div style={{ fontWeight: 700, fontSize: 24, marginTop: 2 }}>{totalProjects}</div>
                  </div>
                </GovCardBody>
              </GovCard>

              <GovCard>
                <GovCardBody style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "#fffbeb", borderRadius: 8, padding: 10 }}>
                    <FolderOpen size={24} style={{ color: "var(--gov-warning)" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>In Progress</span>
                    <div style={{ fontWeight: 700, fontSize: 24, marginTop: 2 }}>{inProgress}</div>
                  </div>
                </GovCardBody>
              </GovCard>

              <GovCard>
                <GovCardBody style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 10 }}>
                    <CheckCircle2 size={24} style={{ color: "var(--gov-success)" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Completed</span>
                    <div style={{ fontWeight: 700, fontSize: 24, marginTop: 2 }}>{completed}</div>
                  </div>
                </GovCardBody>
              </GovCard>

              <GovCard>
                <GovCardBody style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "#f5f3ff", borderRadius: 8, padding: 10 }}>
                    <ClipboardList size={24} style={{ color: "#7c3aed" }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Avg Progress</span>
                    <div style={{ fontWeight: 700, fontSize: 24, marginTop: 2 }}>{avgPhysicalProgress}%</div>
                  </div>
                </GovCardBody>
              </GovCard>

            </div>

            {/* Financial Overview Card */}
            <GovCard>
              <GovCardBody>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--gov-primary-dark)" }}>Financial Utilization Status</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>TOTAL APPROVED BUDGET</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: "var(--gov-text)" }}>{fmtCurrency(totalBudget)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>TOTAL FUNDS UTILIZED & INVOICED</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: "var(--gov-success)" }}>{fmtCurrency(totalUtilized)}</div>
                  </div>
                </div>
              </GovCardBody>
            </GovCard>

            {/* Main grid */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
              
              {/* Recent projects */}
              <GovCard>
                <GovCardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <GovCardTitle>Assigned Projects Overview</GovCardTitle>
                    <Link href="/agency/projects" style={{ fontSize: 12, fontWeight: 600, color: "var(--gov-link)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                      View All Projects <ArrowRight size={14} />
                    </Link>
                  </div>
                </GovCardHeader>
                <GovCardBody style={{ padding: 0 }}>
                  {projects.length === 0 ? (
                    <div style={{ padding: 48, textAlign: "center", color: "var(--gov-text-muted)" }}>No convergence projects assigned to your agency yet.</div>
                  ) : (
                    <div className="gov-table-container">
                      <table className="gov-table">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>District</th>
                            <th>Physical Progress</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.slice(0, 5).map((p) => (
                            <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/convergence-projects/${p.id}`)}>
                              <td>
                                <div style={{ fontWeight: 600 }}>{p.title}</div>
                                <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>{p.projectId}</div>
                              </td>
                              <td>{p.district}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700 }}>{p.physicalProgressPercent}%</span>
                                  <div style={{ height: 6, background: "var(--gov-border)", borderRadius: 3, flex: 1, minWidth: 60 }}>
                                    <div style={{ height: 6, background: "var(--gov-primary)", borderRadius: 3, width: `${p.physicalProgressPercent}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <GovStatusBadge variant={statusToVariant(p.status)}>{p.status.replace(/_/g, " ")}</GovStatusBadge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </GovCardBody>
              </GovCard>

              {/* Instructions and Guidelines */}
              <GovCard>
                <GovCardHeader>
                  <GovCardTitle>Implementing Agency Guidelines</GovCardTitle>
                </GovCardHeader>
                <GovCardBody style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, lineHeight: 1.5 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <ShieldCheck size={18} style={{ color: "var(--gov-success)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Milestone Updates:</strong> Track physical progress and mark milestones as <code>IN_PROGRESS</code> or <code>COMPLETED</code>.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <FileText size={18} style={{ color: "var(--gov-link)", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Utilization Certificates:</strong> Upload UCs and invoices for each completed milestone to trigger funds auditing by the Nodal Officer.
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--gov-border)", paddingTop: 10, fontSize: 12, color: "var(--gov-text-muted)" }}>
                    All submissions undergo dual verification: first audited by the mapped District Nodal Officer, and then synced to the State CSR Cell registry.
                  </div>
                </GovCardBody>
              </GovCard>

            </div>
          </div>
        )}
      </GovPageShell>
    </GovPortalLayout>
  );
}

function isLoadingStats(loading: boolean, error: string) {
  if (loading) {
    return <div style={{ padding: 48, textAlign: "center", color: "var(--gov-text-muted)" }}>Loading dashboard statistics...</div>;
  }
  if (error) {
    return <GovAlert variant="danger">{error}</GovAlert>;
  }
  return null;
}
