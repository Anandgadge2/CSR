"use client";

import { useState, useEffect, useCallback } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovInput from "@/components/gov/GovInput";
import GovSelect from "@/components/gov/GovSelect";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { apiFetch } from "@/lib/api";
import "../../styles/gov-theme.css";

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  details: unknown;
  createdAt: string;
  user?: { id: string; email: string; role: string } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const envelope = await apiFetch<any>("/audit-logs?limit=250");
      const list = envelope?.data?.logs || envelope?.data || envelope?.logs || (Array.isArray(envelope) ? envelope : []);
      setLogs(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const actions = Array.from(new Set(logs.map((l) => l.action))).sort();
  const distinctUsers = new Set(logs.map((l) => l.user?.email).filter(Boolean)).size;

  const filtered = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (log.user?.email || "").toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      (log.entityType || "").toLowerCase().includes(term) ||
      (log.entityId || "").toLowerCase().includes(term);
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const actionVariant = (action: string): "success" | "warning" | "danger" | "info" | "muted" => {
    const a = action.toUpperCase();
    if (a.includes("FAIL") || a.includes("REJECT") || a.includes("DELETE") || a.includes("SUSPEND")) return "danger";
    if (a.includes("APPROVE") || a.includes("VERIF") || a.includes("CREATE")) return "success";
    if (a.includes("LOGIN") || a.includes("ACCESS")) return "info";
    return "muted";
  };

  const detailText = (details: unknown) => {
    if (details == null) return "";
    if (typeof details === "string") return details;
    try {
      return JSON.stringify(details);
    } catch {
      return String(details);
    }
  };

  return (
    <GovPortalLayout userRole="PORTAL_ADMIN">
      <GovPageHeader
        breadcrumb="Admin / Audit Logs"
        title="System Audit Logs"
        description="Immutable record of user actions, entity modifications, and system events"
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GovCard>
          <GovCardBody>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginBottom: 8 }}>
              Total Logged Events
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--gov-primary)" }}>{logs.length}</div>
          </GovCardBody>
        </GovCard>
        <GovCard>
          <GovCardBody>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginBottom: 8 }}>
              Distinct Active Users
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--gov-link)" }}>{distinctUsers}</div>
          </GovCardBody>
        </GovCard>
        <GovCard>
          <GovCardBody>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted)", marginBottom: 8 }}>
              Action Categories
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--gov-primary-dark)" }}>{actions.length}</div>
          </GovCardBody>
        </GovCard>
      </div>

      {/* Log Search and Filters */}
      <GovCard style={{ marginBottom: 24 }}>
        <GovCardBody>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 items-end">
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 700 }}>
                Search Audit Logs
              </label>
              <GovInput
                type="text"
                placeholder="Search by user email, action name, or entity ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <GovSelect
              label="Filter by Action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
              ))}
            </GovSelect>
          </div>
        </GovCardBody>
      </GovCard>

      {/* Log Table */}
      <GovCard>
        <GovCardHeader>
          <GovCardTitle>System Audit Events ({filtered.length})</GovCardTitle>
        </GovCardHeader>
        <GovCardBody style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--gov-text-muted)", fontSize: 13 }}>
              Loading audit events from database…
            </div>
          ) : error ? (
            <div className="gov-alert danger" style={{ margin: 16 }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--gov-text-muted)", fontSize: 13 }}>
              No audit events found in database.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--gov-border)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>TIMESTAMP</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>USER</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>ACTION</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>ENTITY</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>IP ADDRESS</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)" }}>DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => {
                    const detail = detailText(log.details);
                    const expanded = expandedId === log.id;
                    return (
                      <tr
                        key={log.id}
                        style={{ borderBottom: "1px solid var(--gov-border)", cursor: detail ? "pointer" : "default" }}
                        onClick={() => setExpandedId(expanded ? null : log.id)}
                      >
                        <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--gov-text-secondary)", whiteSpace: "nowrap" }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13 }}>
                          <div style={{ fontWeight: 700 }}>{log.user?.email || "system"}</div>
                          <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>{log.user?.role || ""}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <GovStatusBadge variant={actionVariant(log.action)}>
                            {log.action.replace(/_/g, " ")}
                          </GovStatusBadge>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--gov-text-secondary)" }}>
                          <div>{log.entityType || "—"}</div>
                          {log.entityId && (
                            <div style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>
                              {log.entityId.length > 18 ? `${log.entityId.slice(0, 18)}…` : log.entityId}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--gov-text-secondary)" }}>
                          {log.ipAddress || "—"}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--gov-text-secondary)", maxWidth: 320 }}>
                          <span title={detail} style={expanded ? { wordBreak: "break-all" } : undefined}>
                            {expanded || detail.length <= 80 ? detail || "—" : `${detail.slice(0, 80)}…`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
