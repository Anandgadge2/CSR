"use client";

/**
 * Joint Secretary — appoint a District Nodal Consultant (DNC) to an approved project.
 *
 * Cascade (per product decision): District → DNC. Organisation is display-only
 * context; the schema has no org→district relation. The JS:
 *  1. picks an approved enquiry/pitch (district auto-fills from it),
 *  2. loads active DNCs mapped to that district,
 *  3. appoints one — backend records the nodal assignment, advances the
 *     workflow to FIELD_OFFICER_ASSIGNMENT, notifies, and resolves the SLA.
 */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovSelect from "@/components/gov/GovSelect";
import GovTextarea from "@/components/gov/GovTextarea";
import GovAlert from "@/components/gov/GovAlert";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch, invalidateCache } from "@/lib/api";
import { hasPageAccess, JS_ACCESS_PERMS } from "@/lib/roleAccess";
import { Loader2, UserCheck } from "lucide-react";

interface ApprovedProject {
  id: string;
  entityType: "CORPORATE_ENQUIRY" | "GOVERNMENT_PITCH";
  trackingId: string;
  companyName: string;
  sector: string;
  preferredDistricts: string[];
  status: string;
  feasibilityAssessment?: { proposedLocationDistrict?: string | null } | null;
}

interface Consultant {
  id: string;
  email: string;
  assignedDistrict: string | null;
  officerProfile?: { fullName?: string | null; designation?: string | null; department?: string | null } | null;
  organizationId?: string | null;
}

const projectDistrict = (p: ApprovedProject): string =>
  p.feasibilityAssessment?.proposedLocationDistrict || p.preferredDistricts?.[0] || "";

export default function NewNodalAppointmentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<ApprovedProject[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedConsultantId, setSelectedConsultantId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;
  const district = selectedProject ? projectDistrict(selectedProject) : "";

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: ApprovedProject[] }>("/js/approved-projects");
      setProjects(res?.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load approved projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && hasPageAccess(JS_ACCESS_PERMS)) loadProjects();
  }, [mounted, loadProjects]);

  // When a project (hence district) is chosen, load the DNCs for that district.
  useEffect(() => {
    if (!district) {
      setConsultants([]);
      setSelectedConsultantId("");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingConsultants(true);
      setSelectedConsultantId("");
      setError("");
      try {
        const res = await apiFetch<{ success: boolean; data: { district: string; consultants: Consultant[] } }>(
          `/assignments/nodal-consultants?district=${encodeURIComponent(district)}`
        );
        if (!cancelled) setConsultants(res?.data?.consultants || []);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load nodal consultants");
      } finally {
        if (!cancelled) setLoadingConsultants(false);
      }
    })();
    return () => { cancelled = true; };
  }, [district]);

  const submit = async () => {
    if (!selectedProject || !selectedConsultantId || !district) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch("/assignments/appoint-nodal-consultant", {
        method: "POST",
        body: JSON.stringify({
          entityType: selectedProject.entityType,
          entityId: selectedProject.id,
          nodalOfficerId: selectedConsultantId,
          district,
          remarks: remarks.trim() || undefined,
        }),
      });
      invalidateCache("/js");
      invalidateCache("/assignments");
      setSuccess("District Nodal Consultant appointed. The project has advanced to field-officer assignment.");
      setTimeout(() => router.push("/js/nodal-appointments"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to appoint nodal consultant");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;
  if (!hasPageAccess(JS_ACCESS_PERMS)) {
    return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;
  }

  const consultantLabel = (c: Consultant) => {
    const name = c.officerProfile?.fullName || c.email;
    const desig = c.officerProfile?.designation ? ` — ${c.officerProfile.designation}` : "";
    return `${name}${desig}`;
  };

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Nodal Appointments / New"
        title="Appoint District Nodal Consultant"
        description="Select an approved project, then appoint a District Nodal Consultant mapped to its district."
        actions={
          <GovButton variant="secondary" onClick={() => router.push("/js/nodal-appointments")}>
            Back to Queue
          </GovButton>
        }
      >
        {error && <GovAlert variant="danger">{error}</GovAlert>}
        {success && <GovAlert variant="success">{success}</GovAlert>}

        <GovCard>
          <GovCardBody>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gov-text-muted)" }}>
                <Loader2 size={16} className="animate-spin" /> Loading approved projects…
              </div>
            ) : projects.length === 0 ? (
              <p style={{ color: "var(--gov-text-muted)", margin: 0 }}>
                No approved projects are currently awaiting a nodal appointment.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
                <GovSelect
                  label="Approved Project"
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Select an approved project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.trackingId} — {p.companyName} ({projectDistrict(p) || "no district"})
                    </option>
                  ))}
                </GovSelect>

                {selectedProject && (
                  <div style={{ fontSize: 13, color: "var(--gov-text-muted)", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
                    <div><strong>District:</strong> {district || "—"}</div>
                    <div><strong>Sector:</strong> {selectedProject.sector || "—"}</div>
                  </div>
                )}

                <GovSelect
                  label="District Nodal Consultant"
                  required
                  value={selectedConsultantId}
                  disabled={!district || loadingConsultants}
                  onChange={(e) => setSelectedConsultantId(e.target.value)}
                  help={
                    !district
                      ? "Select a project first."
                      : loadingConsultants
                        ? "Loading consultants…"
                        : consultants.length === 0
                          ? "No active nodal consultants are mapped to this district. Map one via District Nodal Mappings first."
                          : undefined
                  }
                >
                  <option value="">{loadingConsultants ? "Loading…" : "Select a nodal consultant"}</option>
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id}>{consultantLabel(c)}</option>
                  ))}
                </GovSelect>

                <GovTextarea
                  label="Remarks (optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Any note to accompany the appointment."
                />

                <div>
                  <GovButton
                    variant="primary"
                    onClick={submit}
                    disabled={!selectedProjectId || !selectedConsultantId || submitting}
                  >
                    {submitting ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Loader2 size={16} className="animate-spin" /> Appointing…
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <UserCheck size={16} /> Appoint Consultant
                      </span>
                    )}
                  </GovButton>
                </div>
              </div>
            )}
          </GovCardBody>
        </GovCard>
      </GovPageShell>
    </GovPortalLayout>
  );
}
