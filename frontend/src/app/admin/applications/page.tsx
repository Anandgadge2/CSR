"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovInput from "@/components/gov/GovInput";
import { apiFetch, invalidateCache } from "@/lib/api";
import "../../../styles/gov-theme.css";

interface PendingOrganization {
  id: string;
  name: string;
  organizationType: string;
  district: string | null;
  onboardingStatus: string;
  registrationNumber: string | null;
  email: string | null;
  officialEmail: string | null;
  updatedAt: string;
  createdAt: string;
}

export default function ApplicationsListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [applications, setApplications] = useState<PendingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<PendingOrganization[]>("/admin/organizations/pending");
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const act = async (id: string, action: "approve" | "reject" | "request-clarification") => {
    setActionError("");
    setActingId(id);
    try {
      const body =
        action === "reject"
          ? { reason: "Rejected after verification review" }
          : action === "request-clarification"
            ? { remarks: "Please provide additional documentation" }
            : {};
      await apiFetch(`/admin/organizations/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      invalidateCache("/admin/organizations");
      fetchApplications();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingId(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "danger";
      case "CLARIFICATION_REQUIRED":
        return "warning";
      case "SUBMITTED_FOR_REVIEW":
      case "UNDER_VERIFICATION":
        return "info";
      default:
        return "muted";
    }
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      app.name.toLowerCase().includes(term) ||
      (app.registrationNumber || "").toLowerCase().includes(term) ||
      (app.email || app.officialEmail || "").toLowerCase().includes(term);
    const matchesFilter = filterStatus === "ALL" || app.onboardingStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const underReview = applications.filter((a) =>
    ["SUBMITTED_FOR_REVIEW", "UNDER_VERIFICATION"].includes(a.onboardingStatus)
  ).length;
  const clarifications = applications.filter((a) => a.onboardingStatus === "CLARIFICATION_REQUIRED").length;
  const ngoCount = applications.filter((a) => a.organizationType === "NGO").length;

  return (
    <GovPortalLayout userRole="PORTAL_ADMIN">
      <GovPageHeader
        breadcrumb="Home / Admin / Verification Queue"
        title="Organization Verification Queue"
        description="Review and verify organization onboarding applications awaiting approval"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GovCard>
          <GovCardBody>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginBottom: 8 }}>
              Pending Applications
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--gov-primary)" }}>
              {applications.length}
            </div>
          </GovCardBody>
        </GovCard>
        <GovCard>
          <GovCardBody>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginBottom: 8 }}>
              Under Review
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706" }}>
              {underReview}
            </div>
          </GovCardBody>
        </GovCard>
        <GovCard>
          <GovCardBody>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginBottom: 8 }}>
              Clarification Requested
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#d97706" }}>
              {clarifications}
            </div>
          </GovCardBody>
        </GovCard>
        <GovCard>
          <GovCardBody>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginBottom: 8 }}>
              NGO Applications
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#166534" }}>
              {ngoCount}
            </div>
          </GovCardBody>
        </GovCard>
      </div>

      {/* Filters */}
      <GovCard style={{ marginBottom: 24 }}>
        <GovCardBody>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 700 }}>
                Search Applications
              </label>
              <GovInput
                type="text"
                placeholder="Search by organization name, registration number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 700 }}>
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--gov-border)",
                  borderRadius: "var(--gov-radius)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <option value="ALL">All Status</option>
                <option value="SUBMITTED_FOR_REVIEW">Submitted For Review</option>
                <option value="UNDER_VERIFICATION">Under Verification</option>
                <option value="CLARIFICATION_REQUIRED">Clarification Required</option>
              </select>
            </div>
          </div>
        </GovCardBody>
      </GovCard>

      {actionError && (
        <div className="gov-alert danger" style={{ marginBottom: 16 }}>{actionError}</div>
      )}

      {/* Applications Table */}
      <GovCard>
        <GovCardHeader>
          <GovCardTitle>Applications List ({filteredApplications.length})</GovCardTitle>
        </GovCardHeader>
        <GovCardBody style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--gov-text-muted)", fontSize: 13 }}>
              Loading applications…
            </div>
          ) : error ? (
            <div className="gov-alert danger" style={{ margin: 16 }}>{error}</div>
          ) : filteredApplications.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--gov-text-muted)", fontSize: 13 }}>
              No organizations awaiting verification.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--gov-border)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>
                      ORGANIZATION
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>
                      TYPE
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>
                      DISTRICT
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>
                      REG. NO.
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>
                      UPDATED
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>
                      STATUS
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: "1px solid var(--gov-border)",
                        transition: "background-color 0.15s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--gov-bg-secondary)")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "var(--gov-primary)" }}>
                        <div>{app.name}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gov-text-muted)" }}>
                          {app.email || app.officialEmail || ""}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--gov-text-secondary)" }}>
                        {(app.organizationType || "").replace(/_/g, " ")}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--gov-text-secondary)" }}>
                        {app.district || "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--gov-text-secondary)" }}>
                        {app.registrationNumber || "—"}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--gov-text-secondary)" }}>
                        {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <GovStatusBadge variant={getStatusVariant(app.onboardingStatus)}>
                          {(app.onboardingStatus || "").replace(/_/g, " ")}
                        </GovStatusBadge>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <GovButton
                          variant="primary"
                          disabled={actingId === app.id}
                          onClick={() => act(app.id, "approve")}
                          style={{ fontSize: 11, padding: "5px 10px", marginRight: 6 }}
                        >
                          Approve
                        </GovButton>
                        <GovButton
                          variant="secondary"
                          disabled={actingId === app.id}
                          onClick={() => act(app.id, "request-clarification")}
                          style={{ fontSize: 11, padding: "5px 10px", marginRight: 6 }}
                        >
                          Clarify
                        </GovButton>
                        <GovButton
                          variant="danger"
                          disabled={actingId === app.id}
                          onClick={() => act(app.id, "reject")}
                          style={{ fontSize: 11, padding: "5px 10px" }}
                        >
                          Reject
                        </GovButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
