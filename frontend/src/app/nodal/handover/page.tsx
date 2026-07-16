"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, ShieldCheck, ClipboardCheck, Upload, CheckCircle } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovInput from "@/components/gov/GovInput";
import GovTextarea from "@/components/gov/GovTextarea";
import { apiFetch, API_BASE_URL, getAccessToken } from "@/lib/api";

interface ProjectOption {
  id: string;
  projectId: string;
  title: string;
  district: string;
  status: string;
  mou?: {
    ownershipAfterCompletion: string;
    maintenanceResponsibility: string;
  } | null;
}

export default function NodalHandoverPage() {
  const router = useRouter();

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [form, setForm] = useState({
    ownershipAfterCompletion: "State Government",
    maintenanceResponsibility: "Local Body / Panchayat",
    signedDocumentUrl: "",
    finalRemarks: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploadingDoc(true);
    setUploadError("");
    try {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      handleFieldChange("signedDocumentUrl", data.url);
    } catch (err: any) {
      setUploadError("Failed to upload document to Cloudinary.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Fetch assigned projects
  const { data: projectsResponse, isLoading } = useQuery({
    queryKey: ["nodal", "projects-handover"],
    queryFn: () => apiFetch<any>("/nodal/projects"),
  });

  const projects: ProjectOption[] = projectsResponse?.data?.projects || projectsResponse?.projects || [];

  const handoverMutation = useMutation({
    mutationFn: (projectId: string) =>
      apiFetch<any>(`/nodal/projects/${projectId}/handover`, {
        method: "POST",
        body: JSON.stringify(form),
      }),
    onSuccess: () => {
      setSuccess("Project handover confirmed and status set to COMPLETED");
      setTimeout(() => {
        router.push("/nodal/dashboard");
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to complete project handover");
    },
  });

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setForm((prev) => ({
        ...prev,
        ownershipAfterCompletion: proj.mou?.ownershipAfterCompletion || "State Government",
        maintenanceResponsibility: proj.mou?.maintenanceResponsibility || "Local Body / Panchayat",
      }));
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProjectId) {
      setError("Please select a completed project to handover");
      return;
    }

    handoverMutation.mutate(selectedProjectId);
  };

  if (isLoading) {
    return (
      <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
        <div style={{ padding: 100, textAlign: "center", color: "var(--gov-text-muted)" }}>Loading Handover Console...</div>
      </GovPortalLayout>
    );
  }

  return (
    <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
        {/* Back navigation */}
        <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, background: "none", border: "none", color: "var(--gov-primary)", fontWeight: 600, cursor: "pointer", padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <GovPageHeader
          title="Project Completion & Handover Console"
          description="Log completion reports and record ownership & maintenance transfers of convergence assets to local government bodies."
          breadcrumb="Home / Projects / Handover"
        />

        {error && <GovAlert variant="danger" style={{ marginBottom: 20 }}>{error}</GovAlert>}
        {success && <GovAlert variant="success" style={{ marginBottom: 20 }}>{success}</GovAlert>}

        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Handover Parameters</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="gov-label">Target Convergence Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="gov-select"
                  required
                >
                  <option value="">Select Completed Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.projectId})
                    </option>
                  ))}
                </select>
              </div>

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

               <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="gov-label" style={{ fontWeight: 700 }}>Signed Handover Certificate PDF (Optional)</label>
                
                <div style={{
                  border: "2px dashed var(--gov-border)",
                  borderRadius: 8,
                  padding: "16px 20px",
                  textAlign: "center",
                  background: "var(--gov-bg-card)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "border-color 0.2s"
                }}>
                  <input
                    type="file"
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                      width: "100%",
                      height: "100%"
                    }}
                    onChange={handleFileUpload}
                    disabled={uploadingDoc}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <Upload style={{ color: "var(--gov-text-muted)" }} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gov-text)" }}>
                      {uploadingDoc ? "Uploading to Cloudinary..." : "Drag signed certificate or click to upload"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>PDF, JPG, PNG up to 10MB</span>
                  </div>
                </div>

                {uploadError && <span style={{ color: "var(--gov-danger)", fontSize: 12 }}>{uploadError}</span>}
                {form.signedDocumentUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gov-success)", fontSize: 12, marginTop: 4 }}>
                    <CheckCircle size={14} />
                    <span>Uploaded successfully! URL: <a href={form.signedDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "var(--gov-link)" }}>{form.signedDocumentUrl}</a></span>
                  </div>
                )}
              </div>

              <GovInput
                label="Or paste Handover Certificate URL directly"
                value={form.signedDocumentUrl || ""}
                onChange={(e) => handleFieldChange("signedDocumentUrl", e.target.value)}
                placeholder="https://cloud-storage.gov/handover.pdf"
              />

              <GovTextarea
                label="Final Completion & Handover Remarks"
                value={form.finalRemarks}
                onChange={(e) => handleFieldChange("finalRemarks", e.target.value)}
                placeholder="Record asset commissioning, local body representatives present..."
                rows={4}
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <GovButton variant="secondary" type="button" onClick={() => router.back()}>
                  Cancel
                </GovButton>
                <GovButton variant="primary" type="submit" disabled={handoverMutation.isPending}>
                  <ClipboardCheck size={16} style={{ marginRight: 6 }} /> Confirm Handover
                </GovButton>
              </div>
            </form>
          </GovCardBody>
        </GovCard>
      </div>
    </GovPortalLayout>
  );
}
