"use client";

import React, { useState } from "react";
import { HelpCircle, Send, Ticket, Search, Loader2 } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovInput from "@/components/gov/GovInput";
import GovTextarea from "@/components/gov/GovTextarea";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { apiFetch } from "@/lib/api";

interface HelpdeskStatus {
  trackingId: string;
  subject: string;
  status: string;
  resolution?: string | null;
  resolutionDueAt: string;
  resolvedAt?: string | null;
  createdAt: string;
}

const GUIDES = [
  { tag: "Guide 1", title: "Corporate Enquiry Journey", detail: "How the 8-step convergence flow works — from enquiry and RM contact to MoU signing and project onboarding." },
  { tag: "Guide 2", title: "Pitching a Development Need", detail: "For government officers: submitting a district development need with location evidence and cost estimates." },
  { tag: "Guide 3", title: "Tracking Your Application", detail: "Use your tracking ID (CSR-MH-… / GP-MH-…) on the Track page for a live stage-by-stage timeline." },
  { tag: "Guide 4", title: "Implementing Agency Sub-Logins", detail: "Corporates can delegate implementation to a CSR-1 registered NGO; activation needs Nodal Officer approval." },
];

export default function HelpCenterPage() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<{ trackingId: string; resolutionDueAt: string } | null>(null);

  const [trackId, setTrackId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [trackResult, setTrackResult] = useState<HelpdeskStatus | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await apiFetch<{ data?: { trackingId: string; resolutionDueAt: string } } & { trackingId?: string; resolutionDueAt?: string }>("/helpdesk", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = (res as any).data ?? res;
      setTicket({ trackingId: data.trackingId, resolutionDueAt: data.resolutionDueAt });
      setForm({ name: "", email: "", mobile: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Failed to submit query");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackResult(null);
    if (!trackId.trim()) return;
    setTracking(true);
    try {
      const res = await apiFetch<{ data?: HelpdeskStatus } & HelpdeskStatus>(`/helpdesk/track/${trackId.trim().toUpperCase()}`);
      setTrackResult((res as any).data ?? res);
    } catch (err: any) {
      setTrackError(err.status === 404 ? "Query not found. Check the tracking ID." : err.message || "Failed to fetch query status");
    } finally {
      setTracking(false);
    }
  };

  return (
    <GovPortalLayout showSidebar={false}>
      <div className="gov-public-main">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">Home / Helpdesk</div>
          <h1 className="gov-page-title flex items-center gap-3">
            <HelpCircle size={26} className="text-[#f7941d]" />
            Helpdesk
          </h1>
          <p className="gov-page-description">
            Submit a query about the portal, registrations, or the CSR convergence process.
            Every query gets a tracking ID and is resolved within 2 working days.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {/* Guides */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Self-Help Guides</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div className="flex flex-col gap-3">
                {GUIDES.map((guide) => (
                  <div key={guide.tag} className="border border-[#e0e4ea] border-l-4 border-l-[#f7941d] p-3 rounded-lg bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#f7941d]">{guide.tag}</span>
                    <h4 className="text-sm font-bold text-[#14274e] mt-0.5">{guide.title}</h4>
                    <p className="text-xs text-[#4b5563] mt-1 leading-relaxed">{guide.detail}</p>
                  </div>
                ))}
              </div>
            </GovCardBody>
          </GovCard>

          {/* Submit Query */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle className="flex items-center gap-2"><Ticket size={16} /> Submit a Query</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              {ticket ? (
                <div className="flex flex-col gap-3 text-center p-2">
                  <GovAlert variant="success">Query submitted successfully.</GovAlert>
                  <div className="border border-[#e0e4ea] bg-[#f4f5f7] rounded-lg p-4">
                    <p className="text-xs text-[#6b7280] mb-1">Your Tracking ID</p>
                    <code className="text-lg font-mono font-bold text-[#14274e]">{ticket.trackingId}</code>
                    <p className="text-xs text-[#4b5563] mt-2">
                      Response due by {new Date(ticket.resolutionDueAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} (2-day SLA).
                    </p>
                  </div>
                  <GovButton variant="secondary" onClick={() => setTicket(null)}>Submit another query</GovButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {error && <GovAlert variant="danger">{error}</GovAlert>}
                  <GovInput label="Your Name" required format="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <GovInput label="Email" type="email" required format="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <GovInput label="Mobile (optional)" format="phone" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                  <GovInput label="Subject" required maxLength={200} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                  <GovTextarea label="Describe your query" required rows={4} maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <GovButton type="submit" disabled={submitting}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit Query
                  </GovButton>
                </form>
              )}
            </GovCardBody>
          </GovCard>

          {/* Track Query */}
          <GovCard>
            <GovCardHeader>
              <GovCardTitle className="flex items-center gap-2"><Search size={16} /> Track a Query</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <form onSubmit={handleTrack} className="flex flex-col gap-3">
                <GovInput
                  label="Helpdesk Tracking ID"
                  placeholder="HD-MH-2026-000001"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                  error={trackError}
                />
                <GovButton type="submit" variant="secondary" disabled={tracking}>
                  {tracking ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Check Status
                </GovButton>
              </form>

              {trackResult && (
                <div className="mt-4 border border-[#e0e4ea] rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono font-bold text-[#14274e]">{trackResult.trackingId}</code>
                    <GovStatusBadge variant={trackResult.status === "RESOLVED" || trackResult.status === "CLOSED" ? "success" : trackResult.status === "IN_PROGRESS" ? "warning" : "info"}>
                      {trackResult.status.replace(/_/g, " ")}
                    </GovStatusBadge>
                  </div>
                  <p className="text-sm font-semibold text-[#333333]">{trackResult.subject}</p>
                  <p className="text-xs text-[#6b7280]">
                    Submitted {new Date(trackResult.createdAt).toLocaleDateString("en-IN")} · Response due {new Date(trackResult.resolutionDueAt).toLocaleDateString("en-IN")}
                  </p>
                  {trackResult.resolution && (
                    <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-lg p-3 text-xs text-[#2e7d32]">
                      <strong>Resolution:</strong> {trackResult.resolution}
                    </div>
                  )}
                </div>
              )}
            </GovCardBody>
          </GovCard>
        </div>
      </div>
    </GovPortalLayout>
  );
}
