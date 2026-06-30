"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, FileText, CheckCircle, HelpCircle, Upload, CheckSquare } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge, { statusToVariant } from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovInput from "@/components/gov/GovInput";
import GovTextarea from "@/components/gov/GovTextarea";
import { apiFetch } from "@/lib/api";

interface MouDetail {
  id: string;
  mouReferenceId: string;
  districtDepartmentName: string;
  nodalOfficerName: string;
  corporateName: string;
  cin: string;
  projectTitle: string;
  projectDescription: string;
  scheduleVIIClause: string;
  projectLocation: string;
  deliverables: any;
  timelineMonths: number;
  financialContribution: number;
  governmentContribution: number | null;
  implementationMode: string;
  implementingAgencyName: string | null;
  ownershipAfterCompletion: string;
  maintenanceResponsibility: string;
  signedDocumentUrl: string | null;
  status: string;
}

export default function NodalMouBuilderPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [form, setForm] = useState({
    districtDepartmentName: "District Administration",
    nodalOfficerName: "",
    corporateName: "",
    cin: "",
    projectTitle: "",
    projectDescription: "",
    scheduleVIIClause: "Schedule VII Clause 1",
    projectLocation: "",
    timelineMonths: 12,
    financialContribution: 0,
    governmentContribution: "",
    implementationMode: "NGO_PARTNER",
    implementingAgencyName: "",
    ownershipAfterCompletion: "State Government",
    maintenanceResponsibility: "Local Body / Panchayat",
    signedDocumentUrl: "",
    status: "DRAFT",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch project & existing MoU
  const { data: projectResponse, isLoading, refetch } = useQuery({
    queryKey: ["nodal", "project-mou", projectId],
    queryFn: () => apiFetch<any>(`/convergence-projects/${projectId}`),
    enabled: !!projectId,
  });

  const project = projectResponse?.data || projectResponse;

  useEffect(() => {
    if (project) {
      setForm((prev) => ({
        ...prev,
        corporateName: project.corporateName || prev.corporateName,
        projectTitle: project.title || prev.projectTitle,
        projectDescription: project.projectDescription || project.title || prev.projectDescription,
        projectLocation: project.district || prev.projectLocation,
        financialContribution: Number(project.approvedBudget || 0),
        nodalOfficerName: project.nodalOfficerUser?.email || prev.nodalOfficerName,
        ...(project.mou ? {
          districtDepartmentName: project.mou.districtDepartmentName,
          nodalOfficerName: project.mou.nodalOfficerName,
          corporateName: project.mou.corporateName,
          cin: project.mou.cin,
          projectTitle: project.mou.projectTitle,
          projectDescription: project.mou.projectDescription,
          scheduleVIIClause: project.mou.scheduleVIIClause,
          projectLocation: project.mou.projectLocation,
          timelineMonths: project.mou.timelineMonths,
          financialContribution: Number(project.mou.financialContribution),
          governmentContribution: project.mou.governmentContribution ? String(project.mou.governmentContribution) : "",
          implementationMode: project.mou.implementationMode,
          implementingAgencyName: project.mou.implementingAgencyName || "",
          ownershipAfterCompletion: project.mou.ownershipAfterCompletion,
          maintenanceResponsibility: project.mou.maintenanceResponsibility,
          signedDocumentUrl: project.mou.signedDocumentUrl || "",
          status: project.mou.status,
        } : {}),
      }));
    }
  }, [project]);

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch<any>(`/nodal/projects/${projectId}/mou`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setSuccess("Tripartite MoU details updated successfully");
      refetch();
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to save MoU details");
    },
  });

  const handleFieldChange = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (status?: string) => {
    setError(null);
    setSuccess(null);
    const postData = {
      ...form,
      status: status || form.status,
      governmentContribution: form.governmentContribution ? parseFloat(form.governmentContribution) : null,
    };
    saveMutation.mutate(postData);
  };

  if (isLoading) {
    return (
      <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
        <div style={{ padding: 100, textAlign: "center", color: "var(--gov-text-muted)" }}>Loading MoU Builder...</div>
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
          title="Tripartite MoU Builder & Legal Review"
          description="Prepare, review and log signed Tripartite Memorandum of Understanding (MoU) under Annexure B Framework"
          breadcrumb="Home / Projects / MoU Builder"
        />

        {error && <GovAlert variant="danger" style={{ marginBottom: 20 }}>{error}</GovAlert>}
        {success && <GovAlert variant="success" style={{ marginBottom: 20 }}>{success}</GovAlert>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
          {/* Main MoU Builder Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>tripartite Agreement Variables</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <GovInput
                    label="District Department Authority Name"
                    value={form.districtDepartmentName}
                    onChange={(e) => handleFieldChange("districtDepartmentName", e.target.value)}
                    required
                  />
                  <GovInput
                    label="Nodal Officer Name"
                    value={form.nodalOfficerName}
                    onChange={(e) => handleFieldChange("nodalOfficerName", e.target.value)}
                    required
                  />
                  <GovInput
                    label="Corporate / Company Name"
                    value={form.corporateName}
                    onChange={(e) => handleFieldChange("corporateName", e.target.value)}
                    required
                  />
                  <GovInput
                    label="Corporate CIN"
                    value={form.cin}
                    onChange={(e) => handleFieldChange("cin", e.target.value)}
                    required
                  />
                  <div style={{ gridColumn: "span 2" }}>
                    <GovInput
                      label="Project Title"
                      value={form.projectTitle}
                      onChange={(e) => handleFieldChange("projectTitle", e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <GovTextarea
                      label="Project Description"
                      value={form.projectDescription}
                      onChange={(e) => handleFieldChange("projectDescription", e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                  <GovInput
                    label="Schedule VII Focus Area Clause"
                    value={form.scheduleVIIClause}
                    onChange={(e) => handleFieldChange("scheduleVIIClause", e.target.value)}
                    required
                  />
                  <GovInput
                    label="Project Location Details"
                    value={form.projectLocation}
                    onChange={(e) => handleFieldChange("projectLocation", e.target.value)}
                    required
                  />
                  <GovInput
                    label="Timeline Duration (Months)"
                    type="number"
                    value={form.timelineMonths}
                    onChange={(e) => handleFieldChange("timelineMonths", parseInt(e.target.value))}
                    required
                  />
                  <GovInput
                    label="Corporate CSR Contribution (₹)"
                    type="number"
                    value={form.financialContribution}
                    onChange={(e) => handleFieldChange("financialContribution", parseFloat(e.target.value))}
                    required
                  />
                  <GovInput
                    label="Implementing Agency / NGO Name"
                    value={form.implementingAgencyName}
                    onChange={(e) => handleFieldChange("implementingAgencyName", e.target.value)}
                  />
                  <GovInput
                    label="Government Share (₹ - Optional)"
                    type="number"
                    value={form.governmentContribution}
                    onChange={(e) => handleFieldChange("governmentContribution", e.target.value)}
                  />
                  <GovInput
                    label="Post-completion Asset Ownership Entity"
                    value={form.ownershipAfterCompletion}
                    onChange={(e) => handleFieldChange("ownershipAfterCompletion", e.target.value)}
                    required
                  />
                  <GovInput
                    label="Operations & Maintenance Responsibility"
                    value={form.maintenanceResponsibility}
                    onChange={(e) => handleFieldChange("maintenanceResponsibility", e.target.value)}
                    required
                  />
                </div>
              </GovCardBody>
            </GovCard>

            {/* tri-partite MoU Clauses View */}
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Tripartite Legal MoU Draft (Annexure B Clauses)</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 6, border: "1px solid var(--gov-border)", height: 400, overflowY: "scroll", fontSize: 13, fontFamily: "serif", lineHeight: 1.6, color: "#1e293b" }}>
                  <h3 style={{ textAlign: "center", marginBottom: 20 }}>TRIPARTITE MEMORANDUM OF UNDERSTANDING</h3>
                  <p>This Tripartite Memorandum of Understanding (MoU) is entered into this date by and between:</p>
                  <ol>
                    <li><strong>The Governor of Maharashtra</strong>, represented by the Nodal Officer: <u>{form.nodalOfficerName || "[Name]"}</u> of <u>{form.districtDepartmentName || "[Department]"}</u> (hereinafter called the "Government / First Party").</li>
                    <li><strong>Corporate Partner:</strong> <u>{form.corporateName || "[Company Name]"}</u>, having CIN: <u>{form.cin || "[CIN]"}</u> (hereinafter called the "Corporate / Second Party").</li>
                    <li><strong>Implementing Agency / NGO:</strong> <u>{form.implementingAgencyName || "[NGO Name]"}</u> (hereinafter called the "Implementing Agency / Third Party").</li>
                  </ol>
                  <p><strong>WHEREAS:</strong></p>
                  <ul>
                    <li>The First Party has identified a developmental need for the public benefit, namely <u>{form.projectTitle || "[Project Title]"}</u>.</li>
                    <li>The Second Party wishes to contribute corporate social responsibility (CSR) funds of amount <u>₹{Number(form.financialContribution).toLocaleString("en-IN") || "[Budget]"}</u> to implement this project.</li>
                  </ul>
                  <p><strong>IT IS MUTUALLY AGREED BY THE PARTIES AS FOLLOWS:</strong></p>
                  <ol>
                    <li><strong>Scope of Project:</strong> The project details, location, and deliverables shall strictly align with <u>{form.projectDescription || "[Description]"}</u>.</li>
                    <li><strong>Financial Terms:</strong> No government budget funds shall duplicate the CSR funding allocated for this work.</li>
                    <li><strong>Asset Handover:</strong> Upon successful physical completion, the asset ownership shall vest with <u>{form.ownershipAfterCompletion || "[Ownership Entity]"}</u> and the maintenance responsibility shall be undertaken by <u>{form.maintenanceResponsibility || "[Maintenance Entity]"}</u>.</li>
                  </ol>
                </div>
              </GovCardBody>
            </GovCard>
          </div>

          {/* Sidebar MoU Status & Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>MoU Document Status</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", marginBottom: 4 }}>STATUS</span>
                    <GovStatusBadge variant={statusToVariant(form.status)} style={{ fontSize: 13 }}>
                      {form.status.replace(/_/g, " ")}
                    </GovStatusBadge>
                  </div>

                  {form.signedDocumentUrl ? (
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "var(--gov-text-muted)", marginBottom: 4 }}>SIGNED FILE</span>
                      <a href={form.signedDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--gov-link)", fontWeight: 600 }}>
                        <FileText size={14} /> View Signed MoU
                      </a>
                    </div>
                  ) : (
                    <GovInput
                      label="Signed Document URL (After Signatures)"
                      value={form.signedDocumentUrl}
                      onChange={(e) => handleFieldChange("signedDocumentUrl", e.target.value)}
                      placeholder="https://cloud-storage.gov/mou.pdf"
                    />
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                    <GovButton variant="primary" onClick={() => handleSave()} disabled={saveMutation.isPending}>
                      <Save size={16} style={{ marginRight: 6 }} /> Save Draft
                    </GovButton>

                    {form.status !== "SIGNED" && (
                      <GovButton variant="secondary" onClick={() => handleSave("SIGNED")} disabled={saveMutation.isPending || !form.signedDocumentUrl}>
                        <CheckSquare size={16} style={{ marginRight: 6 }} /> Confirm Signed MoU
                      </GovButton>
                    )}
                  </div>
                </div>
              </GovCardBody>
            </GovCard>
          </div>
        </div>
      </div>
    </GovPortalLayout>
  );
}
