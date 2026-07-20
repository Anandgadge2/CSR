"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";

/**
 * JS assignment cascade — District → District Nodal Consultant → Appoint.
 *
 * Backed by GET /assignments/districts, GET /assignments/nodal-consultants?district=,
 * and POST /assignments/appoint-nodal-consultant. Per product decision the cascade
 * is district-first; organisation is shown only as display context on each DNC,
 * never as a filter (schema has no org→district relation).
 *
 * Used on the JS approval screens for an approved CORPORATE_ENQUIRY / GOVERNMENT_PITCH.
 */

interface NodalConsultant {
  id: string;
  email: string;
  assignedDistrict: string | null;
  officerProfile?: { fullName?: string | null; designation?: string | null; department?: string | null } | null;
  organizationId?: string | null;
}

interface Props {
  entityType: "CORPORATE_ENQUIRY" | "GOVERNMENT_PITCH";
  entityId: string;
  /** District resolved for the entity — preselects and locks the district step when provided. */
  defaultDistrict?: string | null;
  onAppointed?: () => void;
}

export default function NodalAssignmentPanel({ entityType, entityId, defaultDistrict, onAppointed }: Props) {
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>(defaultDistrict || "");
  const [consultants, setConsultants] = useState<NodalConsultant[]>([]);
  const [consultantId, setConsultantId] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [appointing, setAppointing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: load canonical district list.
  useEffect(() => {
    let cancelled = false;
    setLoadingDistricts(true);
    apiFetch<{ success: boolean; data: { districts: string[] } }>("/assignments/districts")
      .then((res) => { if (!cancelled) setDistricts(res?.data?.districts || []); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load districts"); })
      .finally(() => { if (!cancelled) setLoadingDistricts(false); });
    return () => { cancelled = true; };
  }, []);

  // Step 2: whenever the district changes, load its DNCs and reset the selection.
  const loadConsultants = useCallback((d: string) => {
    if (!d) { setConsultants([]); return; }
    setLoadingConsultants(true);
    setConsultantId("");
    apiFetch<{ success: boolean; data: { consultants: NodalConsultant[] } }>(
      `/assignments/nodal-consultants?district=${encodeURIComponent(d)}`
    )
      .then((res) => setConsultants(res?.data?.consultants || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load nodal consultants"))
      .finally(() => setLoadingConsultants(false));
  }, []);

  useEffect(() => {
    if (district) loadConsultants(district);
  }, [district, loadConsultants]);

  // Step 3: appoint.
  const appoint = async () => {
    if (!district || !consultantId) return;
    setAppointing(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch("/assignments/appoint-nodal-consultant", {
        method: "POST",
        body: JSON.stringify({ entityType, entityId, nodalOfficerId: consultantId, district, remarks: remarks || undefined }),
      });
      setSuccess("District Nodal Consultant appointed. The project has moved to field-officer assignment.");
      onAppointed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to appoint nodal consultant");
    } finally {
      setAppointing(false);
    }
  };

  const consultantLabel = (c: NodalConsultant) => {
    const name = c.officerProfile?.fullName || c.email;
    const desig = c.officerProfile?.designation ? ` — ${c.officerProfile.designation}` : "";
    const dept = c.officerProfile?.department ? ` (${c.officerProfile.department})` : "";
    return `${name}${desig}${dept}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {error && <GovAlert variant="danger">{error}</GovAlert>}
      {success && <GovAlert variant="success">{success}</GovAlert>}

      {/* Step 1 — District */}
      <div>
        <label className="gov-label" style={{ fontWeight: 700 }}>1. Implementation District</label>
        <select
          className="gov-select"
          value={district}
          disabled={Boolean(defaultDistrict) || loadingDistricts || appointing}
          onChange={(e) => setDistrict(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="">{loadingDistricts ? "Loading districts…" : "Select a district"}</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {defaultDistrict && (
          <p style={{ fontSize: 11, color: "var(--gov-text-muted)", marginTop: 4 }}>
            District is fixed to the one resolved for this application.
          </p>
        )}
      </div>

      {/* Step 2 — District Nodal Consultant */}
      <div>
        <label className="gov-label" style={{ fontWeight: 700 }}>2. District Nodal Consultant</label>
        <select
          className="gov-select"
          value={consultantId}
          disabled={!district || loadingConsultants || appointing}
          onChange={(e) => setConsultantId(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="">
            {!district ? "Select a district first" : loadingConsultants ? "Loading consultants…" : consultants.length === 0 ? "No consultants mapped to this district" : "Select a nodal consultant"}
          </option>
          {consultants.map((c) => <option key={c.id} value={c.id}>{consultantLabel(c)}</option>)}
        </select>
        {district && !loadingConsultants && consultants.length === 0 && (
          <p style={{ fontSize: 11, color: "var(--gov-danger, #be123c)", marginTop: 4 }}>
            No active District Nodal Consultant is mapped to {district}. Map one via the assignments admin before appointing.
          </p>
        )}
      </div>

      {/* Step 3 — Remarks + appoint */}
      <div>
        <label className="gov-label" style={{ fontWeight: 700 }}>3. Remarks (optional)</label>
        <textarea
          className="gov-input"
          value={remarks}
          disabled={appointing}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          placeholder="Any note for the appointed consultant"
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>

      {/* Confirmation preview — who is about to be appointed */}
      {consultantId && (() => {
        const c = consultants.find((x) => x.id === consultantId);
        if (!c) return null;
        return (
          <div style={{
            border: "1px solid var(--gov-border, #e2e8f0)",
            borderLeft: "4px solid var(--gov-blue, #1e3a8a)",
            borderRadius: 8,
            padding: "10px 14px",
            background: "var(--gov-bg-subtle, #f8fafc)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--gov-text-muted)" }}>
              About to appoint
            </div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>{c.officerProfile?.fullName || c.email}</div>
            <div style={{ fontSize: 12, color: "var(--gov-text-muted)", marginTop: 2 }}>
              {[c.officerProfile?.designation, c.officerProfile?.department, district].filter(Boolean).join(" · ")}
            </div>
          </div>
        );
      })()}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <GovButton variant="primary" onClick={appoint} disabled={!district || !consultantId || appointing}>
          {appointing ? "Appointing…" : "Appoint Nodal Consultant"}
        </GovButton>
      </div>
    </div>
  );
}
