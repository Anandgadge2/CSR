"use client";

/**
 * State CSR Cell / Admin — Helpdesk Queue
 *
 * Static helpdesk queries with the 2-day resolution SLA. Overdue items are
 * flagged; resolving requires a resolution message that is shown to the citizen.
 */
import { useEffect, useState } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovTextarea from "@/components/gov/GovTextarea";
import { apiFetch, invalidateCache } from "@/lib/api";
import { LifeBuoy, Loader2, CheckCircle2, Clock } from "lucide-react";

interface HelpdeskItem {
  id: string;
  trackingId: string;
  subject: string;
  message: string;
  name: string;
  email: string;
  mobile?: string | null;
  status: string;
  resolution?: string | null;
  resolutionDueAt: string;
  resolvedAt?: string | null;
  isOverdue?: boolean;
  createdAt: string;
}

const FILTERS = ["OPEN", "IN_PROGRESS", "RESOLVED", "all"] as const;

export default function HelpdeskQueuePage() {
  const [items, setItems] = useState<HelpdeskItem[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async (status: string = filter) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ data?: HelpdeskItem[] } | HelpdeskItem[]>(`/helpdesk?status=${status}`);
      setItems(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load helpdesk queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const resolve = async (id: string, status: "IN_PROGRESS" | "RESOLVED") => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/helpdesk/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          resolution: status === "RESOLVED" ? resolutionText : undefined,
        }),
      });
      setSuccess(status === "RESOLVED" ? "Query resolved — the citizen can see your resolution on the Helpdesk page." : "Query marked in progress.");
      setResolvingId(null);
      setResolutionText("");
      invalidateCache("/helpdesk");
      await load(filter);
    } catch (err: any) {
      setError(err.message || "Failed to update query");
    } finally {
      setSaving(false);
    }
  };

  const overdueCount = items.filter((i) => i.isOverdue).length;

  return (
    <GovPortalLayout>
      <div className="gov-page-header">
        <div className="gov-breadcrumb">Home / State CSR Cell / Helpdesk Queue</div>
        <h1 className="gov-page-title flex items-center gap-3">
          <LifeBuoy size={26} className="text-[#f7941d]" />
          Helpdesk Queue
        </h1>
        <p className="gov-page-description">
          Citizen and corporate queries from the public helpdesk. SLA: respond within 2 working days.
          {overdueCount > 0 && <strong className="text-[#c62828]"> {overdueCount} overdue.</strong>}
        </p>
      </div>

      {error && <GovAlert variant="danger" className="mb-4">{error}</GovAlert>}
      {success && <GovAlert variant="success" className="mb-4">{success}</GovAlert>}

      <div className="mb-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === f
                ? "border-[#14274e] bg-[#14274e] text-white"
                : "border-[#c7cdd6] bg-white text-[#4b5563] hover:border-[#14274e]"
            }`}
          >
            {f === "all" ? "All" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <GovCard>
        <GovCardHeader>
          <GovCardTitle>Queries {items.length > 0 ? `(${items.length})` : ""}</GovCardTitle>
        </GovCardHeader>
        <GovCardBody>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6b7280] p-4"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#6b7280] p-2">No queries in this view.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 ${item.isOverdue ? "border-[#f9cfc9] bg-[#fdecea]" : "border-[#e0e4ea] bg-white"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs font-bold text-[#14274e]">{item.trackingId}</code>
                      <GovStatusBadge variant={item.status === "RESOLVED" || item.status === "CLOSED" ? "success" : item.status === "IN_PROGRESS" ? "warning" : "info"}>
                        {item.status.replace(/_/g, " ")}
                      </GovStatusBadge>
                      {item.isOverdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#c62828]"><Clock size={12} /> SLA breached</span>
                      )}
                    </div>
                    <span className="text-xs text-[#6b7280]">
                      Due {new Date(item.resolutionDueAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-[#14274e]">{item.subject}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#4b5563]">{item.message}</p>
                  <p className="mt-2 text-xs text-[#6b7280]">
                    From: <strong>{item.name}</strong> · {item.email}{item.mobile ? ` · ${item.mobile}` : ""}
                  </p>

                  {item.resolution && (
                    <div className="mt-2 rounded-lg border border-[#c8e6c9] bg-[#e8f5e9] p-3 text-xs text-[#2e7d32]">
                      <strong>Resolution:</strong> {item.resolution}
                    </div>
                  )}

                  {item.status !== "RESOLVED" && item.status !== "CLOSED" && (
                    resolvingId === item.id ? (
                      <div className="mt-3 flex flex-col gap-2">
                        <GovTextarea
                          label="Resolution (sent to the requester)"
                          rows={3}
                          value={resolutionText}
                          onChange={(e) => setResolutionText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <GovButton
                            onClick={() => resolve(item.id, "RESOLVED")}
                            disabled={saving || !resolutionText.trim()}
                            style={{ minHeight: 32, padding: "4px 12px", fontSize: 12 }}
                          >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Resolve
                          </GovButton>
                          <GovButton
                            variant="muted"
                            onClick={() => { setResolvingId(null); setResolutionText(""); }}
                            style={{ minHeight: 32, padding: "4px 12px", fontSize: 12 }}
                          >
                            Cancel
                          </GovButton>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <GovButton
                          onClick={() => { setResolvingId(item.id); setResolutionText(""); }}
                          style={{ minHeight: 32, padding: "4px 12px", fontSize: 12 }}
                        >
                          <CheckCircle2 size={14} /> Resolve
                        </GovButton>
                        {item.status === "OPEN" && (
                          <GovButton
                            variant="secondary"
                            onClick={() => resolve(item.id, "IN_PROGRESS")}
                            disabled={saving}
                            style={{ minHeight: 32, padding: "4px 12px", fontSize: 12 }}
                          >
                            Mark In Progress
                          </GovButton>
                        )}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
