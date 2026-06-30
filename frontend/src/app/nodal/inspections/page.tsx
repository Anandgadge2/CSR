"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, Calendar, MapPin, ClipboardList, Save, ShieldAlert } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovDataTable from "@/components/gov/GovDataTable";
import GovAlert from "@/components/gov/GovAlert";
import GovInput from "@/components/gov/GovInput";
import GovTextarea from "@/components/gov/GovTextarea";
import GovModal from "@/components/gov/GovModal";
import { apiFetch } from "@/lib/api";

interface Inspection {
  id: string;
  visitDate: string;
  latitude: number | null;
  longitude: number | null;
  geoTaggedImages: string[];
  remarks: string | null;
  issuesFound: string | null;
  actionRequired: string | null;
  nextVisitDate: string | null;
  convergenceProject: {
    projectId: string;
    title: string;
  };
}

interface ProjectOption {
  id: string;
  projectId: string;
  title: string;
}

export default function NodalInspectionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    convergenceProjectId: "",
    visitDate: new Date().toISOString().substring(0, 10),
    latitude: "",
    longitude: "",
    imageUrl: "",
    remarks: "",
    issuesFound: "",
    actionRequired: "",
    nextVisitDate: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch inspections list
  const { data: inspectionsResponse, isLoading, refetch } = useQuery({
    queryKey: ["nodal", "inspections"],
    queryFn: () => apiFetch<any>("/nodal/inspections"),
  });

  // Fetch assigned projects for the dropdown selector
  const { data: projectsResponse } = useQuery({
    queryKey: ["nodal", "projects-selector"],
    queryFn: () => apiFetch<any>("/nodal/projects"),
  });

  const inspections = inspectionsResponse?.data || [];
  const projects: ProjectOption[] = projectsResponse?.data?.projects || projectsResponse?.projects || [];

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch<any>("/nodal/inspections", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setSuccess("Inspection log created successfully");
      refetch();
      setShowAddModal(false);
      setForm({
        convergenceProjectId: "",
        visitDate: new Date().toISOString().substring(0, 10),
        latitude: "",
        longitude: "",
        imageUrl: "",
        remarks: "",
        issuesFound: "",
        actionRequired: "",
        nextVisitDate: "",
      });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create inspection visit log");
    },
  });

  const handleFieldChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.convergenceProjectId) {
      setError("Please select a project to inspect");
      return;
    }

    const payload = {
      ...form,
      geoTaggedImages: form.imageUrl ? [form.imageUrl] : [],
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      nextVisitDate: form.nextVisitDate || null,
    };

    createMutation.mutate(payload);
  };

  const columns = [
    {
      key: "visitDate",
      label: "Visit Date",
      render: (v: unknown) => new Date(v as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      key: "convergenceProject",
      label: "Project Details",
      render: (v: unknown) => {
        const p = v as Inspection["convergenceProject"];
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600 }}>{p.title}</span>
            <span style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>Ref: {p.projectId}</span>
          </div>
        );
      },
    },
    {
      key: "gps",
      label: "GPS Location",
      render: (_: unknown, row: Record<string, unknown>) => {
        const castRow = row as unknown as Inspection;
        if (!castRow.latitude) return "—";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <MapPin size={12} style={{ color: "var(--gov-text-muted)" }} />
            <span>{castRow.latitude.toFixed(6)}, {castRow.longitude?.toFixed(6)}</span>
          </div>
        );
      },
    },
    {
      key: "issuesFound",
      label: "Issues Logged",
      render: (v: unknown) => (v ? <span style={{ color: "var(--gov-danger)", fontWeight: 600 }}>{v as string}</span> : <span style={{ color: "var(--gov-success)" }}>None</span>),
    },
    {
      key: "nextVisitDate",
      label: "Next Scheduled Visit",
      render: (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"),
    },
  ];

  return (
    <GovPortalLayout userRole="DISTRICT_NODAL_OFFICER">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        <GovPageHeader
          title="Field Inspections Log"
          description="Log physical site visits, document GPS coordinates, upload geo-tagged images, and track construction issues."
          breadcrumb="Home / Nodal Officer / Inspections"
          actions={
            <GovButton variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} style={{ marginRight: 6 }} /> Record Visit
            </GovButton>
          }
        />

        {success && <GovAlert variant="success" style={{ marginBottom: 20 }}>{success}</GovAlert>}

        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Inspection Records ({inspections.length})</GovCardTitle>
          </GovCardHeader>
          <GovCardBody style={{ padding: 0 }}>
            <GovDataTable
              columns={columns}
              data={inspections as unknown as Record<string, unknown>[]}
              loading={isLoading}
              emptyMessage="No inspection records found in your district."
            />
          </GovCardBody>
        </GovCard>

        {/* Add Inspection Modal */}
        {showAddModal && (
          <GovModal open={showAddModal} title="Record Field Inspection Visit" onClose={() => setShowAddModal(false)}>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16, width: 500 }}>
              {error && <GovAlert variant="danger">{error}</GovAlert>}

              <div>
                <label className="gov-label">Target Convergence Project</label>
                <select
                  value={form.convergenceProjectId}
                  onChange={(e) => handleFieldChange("convergenceProjectId", e.target.value)}
                  className="gov-select"
                  required
                >
                  <option value="">Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.projectId})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <GovInput
                  label="Inspection Visit Date"
                  type="date"
                  value={form.visitDate}
                  onChange={(e) => handleFieldChange("visitDate", e.target.value)}
                  required
                />
                <GovInput
                  label="Next Scheduled Visit (Optional)"
                  type="date"
                  value={form.nextVisitDate}
                  onChange={(e) => handleFieldChange("nextVisitDate", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <GovInput
                  label="GPS Latitude"
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={(e) => handleFieldChange("latitude", e.target.value)}
                  placeholder="e.g. 18.9756"
                />
                <GovInput
                  label="GPS Longitude"
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={(e) => handleFieldChange("longitude", e.target.value)}
                  placeholder="e.g. 72.8258"
                />
              </div>

              <GovInput
                label="Geo-tagged Evidence Image URL"
                value={form.imageUrl}
                onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                placeholder="https://image-hosting.gov/evidence.jpg"
              />

              <GovTextarea
                label="Site Inspection Remarks"
                value={form.remarks}
                onChange={(e) => handleFieldChange("remarks", e.target.value)}
                placeholder="Record structural condition, work quality..."
                rows={3}
              />

              <GovInput
                label="Issues / Non-compliance found (if any)"
                value={form.issuesFound}
                onChange={(e) => handleFieldChange("issuesFound", e.target.value)}
                placeholder="e.g. Foundation cracking, Delay in slab laying"
              />

              <GovInput
                label="Required Action Note"
                value={form.actionRequired}
                onChange={(e) => handleFieldChange("actionRequired", e.target.value)}
                placeholder="e.g. Rectify mix ratio of cement"
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <GovButton variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </GovButton>
                <GovButton variant="primary" type="submit" disabled={createMutation.isPending}>
                  <Save size={16} style={{ marginRight: 6 }} /> Save Log
                </GovButton>
              </div>
            </form>
          </GovModal>
        )}
      </div>
    </GovPortalLayout>
  );
}
