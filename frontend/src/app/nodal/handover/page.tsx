"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, ShieldCheck, ClipboardCheck } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovInput from "@/components/gov/GovInput";
import GovTextarea from "@/components/gov/GovTextarea";
import { apiFetch } from "@/lib/api";

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

              <GovInput
                label="Signed Handover Certificate PDF URL"
                value={form.signedDocumentUrl}
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
