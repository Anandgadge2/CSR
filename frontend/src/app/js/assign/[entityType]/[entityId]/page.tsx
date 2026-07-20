"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageShell from "@/components/gov/GovPageShell";
import { GovCard, GovCardBody, GovCardHeader, GovCardTitle } from "@/components/gov/GovCard";
import GovAlert from "@/components/gov/GovAlert";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import AccessDenied from "@/components/gov/AccessDenied";
import { apiFetch } from "@/lib/api";
import { hasRoleAccess, JS_ROLES } from "@/lib/roleAccess";
import NodalAssignmentPanel from "@/components/js/NodalAssignmentPanel";

/**
 * JS assignment screen for an approved application. Shows the entity context
 * (district, reference, workflow stage, existing assignments) and hosts the
 * District → DNC → Appoint cascade.
 *
 * Route: /js/assign/[entityType]/[entityId]
 *   entityType ∈ { corporate-enquiry, government-pitch }
 */

const TYPE_MAP: Record<string, "CORPORATE_ENQUIRY" | "GOVERNMENT_PITCH"> = {
  "corporate-enquiry": "CORPORATE_ENQUIRY",
  "government-pitch": "GOVERNMENT_PITCH",
};

interface AssignmentContext {
  district: string;
  title: string;
  reference: string;
  workflowStage?: string;
  assignments?: Array<{ assignmentType: string; assignedTo?: { email?: string } | null; status: string }>;
  nodalOfficer?: { email?: string } | null;
}

export default function JSAssignPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [context, setContext] = useState<AssignmentContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const rawType = String(params.entityType || "");
  const entityId = String(params.entityId || "");
  const entityType = TYPE_MAP[rawType];

  useEffect(() => { setMounted(true); }, []);

  const fetchContext = useCallback(async () => {
    if (!entityType || !entityId) { setError("Invalid assignment target"); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: AssignmentContext }>(
        `/assignments/context/${entityType}/${entityId}`
      );
      setContext(res?.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignment context");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    if (mounted && hasRoleAccess(JS_ROLES)) fetchContext();
  }, [mounted, fetchContext]);

  if (!mounted) return null;
  if (!hasRoleAccess(JS_ROLES)) return <AccessDenied requiredRoles={["Joint Secretary", "Admin"]} />;

  return (
    <GovPortalLayout>
      <GovPageShell
        breadcrumb="Home / Assignments / Appoint Nodal Consultant"
        title="Appoint District Nodal Consultant"
        description="Assign the approved application to a District Nodal Consultant for the implementation district."
      >
        {error && <GovAlert variant="danger">{error}</GovAlert>}

        {loading ? (
          <GovCard><GovCardBody>Loading application context…</GovCardBody></GovCard>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Context */}
            <GovCard>
              <GovCardHeader><GovCardTitle>Application</GovCardTitle></GovCardHeader>
              <GovCardBody>
                {context ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                    <Row label="Reference" value={context.reference} />
                    <Row label="Title" value={context.title} />
                    <Row label="District" value={context.district} />
                    {context.workflowStage && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--gov-text-muted)" }}>Stage</span>
                        <GovStatusBadge variant="info">{context.workflowStage.replace(/_/g, " ")}</GovStatusBadge>
                      </div>
                    )}
                    {context.nodalOfficer?.email && (
                      <Row label="Current Nodal" value={context.nodalOfficer.email} />
                    )}
                  </div>
                ) : (
                  <p>No context available.</p>
                )}
              </GovCardBody>
            </GovCard>

            {/* Cascade */}
            <GovCard>
              <GovCardHeader><GovCardTitle>Assignment</GovCardTitle></GovCardHeader>
              <GovCardBody>
                {done ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <GovAlert variant="success">Nodal Consultant appointed successfully.</GovAlert>
                    <button className="gov-btn gov-btn-secondary" onClick={() => router.push("/js/nodal-appointments")}>
                      View Nodal Appointments
                    </button>
                  </div>
                ) : entityType ? (
                  <NodalAssignmentPanel
                    entityType={entityType}
                    entityId={entityId}
                    defaultDistrict={context?.district || null}
                    onAppointed={() => setDone(true)}
                  />
                ) : (
                  <GovAlert variant="danger">Unknown entity type.</GovAlert>
                )}
              </GovCardBody>
            </GovCard>
          </div>
        )}
      </GovPageShell>
    </GovPortalLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "var(--gov-text-muted)" }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}
