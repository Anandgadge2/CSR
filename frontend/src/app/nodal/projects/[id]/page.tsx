"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  ClipboardCheck,
  FileCheck,
  Search,
  CheckSquare,
  ChevronRight,
  Download
} from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";

interface ProjectDetail {
  id: string;
  projectId: string;
  title: string;
  district: string;
  taluka: string;
  location: string;
  sector: string;
  corporateName: string;
  approvedBudget: number;
  utilizedAmount: number;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  status: string;
  createdAt: string;
  implementingAgencyUser?: { email: string };
  mou?: {
    id: string;
    mouReferenceId: string;
    status: string;
    signedDocumentUrl: string | null;
  } | null;
  milestones: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    dueDate: string | null;
    geoTaggedPhotoUrls: string[];
    verifiedAt: string | null;
  }[];
  utilizationCertificates: {
    id: string;
    certificateDocumentUrl: string;
    amountUtilized: number;
    verificationStatus: string;
    uploadedAt: string;
    remarks: string | null;
  }[];
  grievances: {
    id: string;
    grievanceId: string;
    issueTitle: string;
    status: string;
    createdAt: string;
  }[];
}

const fetchProject = async (id: string): Promise<ProjectDetail> => {
  const res = await apiFetch<any>(`/convergence-projects/${id}`);
  return res?.data || res;
};

export default function NodalProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useQuery<ProjectDetail>({
    queryKey: ["nodal", "project", projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
          <PageSkeleton />
        </div>
      </GovPortalLayout>
    );
  }

  if (error || !project) {
    return (
      <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
          <GovAlert variant="danger">Failed to load project details.</GovAlert>
        </div>
      </GovPortalLayout>
    );
  }

  return (
    <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        {/* Back navigation */}
        <Link href="/nodal/projects" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, color: "var(--gov-primary)", fontWeight: 600, textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <GovPageHeader
          title={project.title}
          description={`Project Reference ID: ${project.projectId}`}
          breadcrumb="Home / Nodal Officer / Projects / Detail"
        />

        {/* Project KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
          <GovCard>
            <GovCardBody>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Building2 size={24} style={{ color: "var(--gov-primary)" }} />
                <div>
                  <span style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Corporate Partner</span>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{project.corporateName}</div>
                </div>
              </div>
            </GovCardBody>
          </GovCard>

          <GovCard>
            <GovCardBody>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <MapPin size={24} style={{ color: "var(--gov-success)" }} />
                <div>
                  <span style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Location</span>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{project.taluka}, {project.district}</div>
                </div>
              </div>
            </GovCardBody>
          </GovCard>

          <GovCard>
            <GovCardBody>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ClipboardCheck size={24} style={{ color: "var(--gov-warning)" }} />
                <div>
                  <span style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>Approved Budget</span>
                  <div style={{ fontWeight: 800, fontSize: 16, marginTop: 2 }}>₹{Number(project.approvedBudget).toLocaleString("en-IN")}</div>
                </div>
              </div>
            </GovCardBody>
          </GovCard>
        </div>

        {/* Action Panel for Nodal Officer */}
        <GovCard style={{ marginBottom: 24, borderLeft: "6px solid var(--gov-primary)" }}>
          <GovCardBody>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Nodal Officer Operations Console</h3>
                <p style={{ margin: 0, fontSize: 13, color: "var(--gov-text-muted)" }}>Manage tripartite MoUs, verify project milestones/utilization certificates, log field inspections, and record handovers.</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/nodal/projects/${project.id}/mou`}>
                  <GovButton variant="primary">
                    <FileText size={16} style={{ marginRight: 6 }} /> MoU Builder
                  </GovButton>
                </Link>
                <Link href={`/nodal/projects/${project.id}/milestones`}>
                  <GovButton variant="secondary">
                    <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Milestones
                  </GovButton>
                </Link>
                <Link href={`/nodal/projects/${project.id}/uc`}>
                  <GovButton variant="secondary">
                    <FileCheck size={16} style={{ marginRight: 6 }} /> UCs
                  </GovButton>
                </Link>
              </div>
            </div>
          </GovCardBody>
        </GovCard>

        {/* Project progress and other details */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Progress Card */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Project Status & Progress</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      <span>Physical Progress</span>
                      <span>{project.physicalProgressPercent}%</span>
                    </div>
                    <div style={{ height: 10, background: "var(--gov-border)", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ width: `${project.physicalProgressPercent}%`, height: "100%", background: "var(--gov-primary)", transition: "width 0.4s ease" }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      <span>Financial Utilization ({project.financialProgressPercent}%)</span>
                      <span>₹{Number(project.utilizedAmount).toLocaleString("en-IN")} / ₹{Number(project.approvedBudget).toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ height: 10, background: "var(--gov-border)", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ width: `${project.financialProgressPercent}%`, height: "100%", background: "var(--gov-success)", transition: "width 0.4s ease" }}></div>
                    </div>
                  </div>
                </div>
              </GovCardBody>
            </GovCard>

            {/* Milestones list */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Milestones Overview</GovCardTitle>
              </GovCardHeader>
              <GovCardBody style={{ padding: 0 }}>
                <div className="gov-table-container">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Deliverable / Stage</th>
                        <th>Target Date</th>
                        <th>Photos</th>
                        <th>Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.milestones.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <span style={{ fontWeight: 600 }}>{m.name}</span>
                          </td>
                          <td>{m.dueDate ? new Date(m.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</td>
                          <td>
                            <GovStatusBadge variant={m.geoTaggedPhotoUrls.length > 0 ? "success" : "muted"}>
                              {m.geoTaggedPhotoUrls.length} photos
                            </GovStatusBadge>
                          </td>
                          <td>
                            {m.verifiedAt ? (
                              <GovStatusBadge variant="success">Verified</GovStatusBadge>
                            ) : (
                              <GovStatusBadge variant="warning">Pending Review</GovStatusBadge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GovCardBody>
            </GovCard>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Quick Actions */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Operations Quick Actions</GovCardTitle>
              </GovCardHeader>
              <GovCardBody style={{ padding: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link href={`/nodal/inspections?projectId=${project.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", justifySelf: "stretch", width: "100%", alignItems: "center", justifyContent: "space-between", padding: 12, background: "#f8fafc", borderRadius: 6, cursor: "pointer", border: "1px solid var(--gov-border)" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gov-text)" }}>Record Inspection Visit</span>
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                  <Link href={`/nodal/handover?projectId=${project.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", justifySelf: "stretch", width: "100%", alignItems: "center", justifyContent: "space-between", padding: 12, background: "#f8fafc", borderRadius: 6, cursor: "pointer", border: "1px solid var(--gov-border)" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gov-text)" }}>Confirm Completion & Handover</span>
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                </div>
              </GovCardBody>
            </GovCard>

            {/* Tripartite MoU status */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Tripartite MoU Alignment</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                {project.mou ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--gov-text-muted)" }}>REFERENCE ID</span>
                      <span style={{ fontWeight: 600 }}>{project.mou.mouReferenceId}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--gov-text-muted)", marginBottom: 4 }}>STATUS</span>
                      <GovStatusBadge variant={project.mou.status === "SIGNED" ? "success" : "warning"}>
                        {project.mou.status.replace(/_/g, " ")}
                      </GovStatusBadge>
                    </div>
                    {project.mou.signedDocumentUrl && (
                      <a href={project.mou.signedDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--gov-link)", fontWeight: 600, marginTop: 4 }}>
                        <Download size={14} /> Download Signed Copy
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 10, color: "var(--gov-text-muted)" }}>
                    No tripartite MoU created yet.
                  </div>
                )}
              </GovCardBody>
            </GovCard>
          </div>
        </div>
      </div>
    </GovPortalLayout>
  );
}
