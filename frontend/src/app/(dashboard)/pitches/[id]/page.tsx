"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft, BadgeIndianRupee, Building2, Calendar, CheckCircle2, FileText,
  Loader2, Send, MapPin, Layers, FileCode, ShieldCheck, AlertCircle
} from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { Loader } from "@/components/ui/Loader";
import { useApiQuery } from "@/lib/apiHooks";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function PitchDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const activeRoles = roles?.length ? roles : user?.role ? [user.role] : [];
  const isRM = activeRoles.some((role) => /RELATIONSHIP[ _-]?MANAGER/i.test(role));

  const { data: response, isLoading, error, refetch } = useApiQuery<any>(
    ["pitch", params.id, isRM ? "rm" : "standard"],
    isRM ? `/rm/pitches/${params.id}` : `/government-pitches/${params.id}`,
    { enabled: Boolean(params.id) }
  );

  const pitch = response?.data ?? response;
  const budget = Number(pitch?.budget || pitch?.estimatedCost || 0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const formattedBudget = budget
    ? budget >= 10000000
      ? `₹${(budget / 10000000).toFixed(2)} Cr`
      : `₹${(budget / 100000).toFixed(2)} Lakhs`
    : "Not specified";

  const detailFields = pitch ? [
    ["Name of official", pitch.officialName],
    ["Designation", pitch.designation],
    ["Department", pitch.department],
    ["Office name", pitch.officeName],
    ["Service class", pitch.serviceClass],
    ["Mobile number", pitch.mobile],
    ["Email address", pitch.email],
    ["Division(s)", joinValues(pitch.divisions)],
    ["District(s)", joinValues(pitch.districts)],
    ["City / cities", joinValues(pitch.cities)],
    ["Taluka(s)", joinValues(pitch.talukas)],
    ["Exact location", pitch.exactLocation],
    ["Estimated cost", pitch.estimatedCost ? `₹${Number(pitch.estimatedCost).toLocaleString("en-IN")}` : null],
    ["Government fund declaration", typeof pitch.govtFundDeclaration === "boolean" ? pitch.govtFundDeclaration ? "No government funds available" : "Government funds available" : null],
    ["Certification type", pitch.certificationType]
  ] : [];

  return (
    <GovPortalLayout>
      <main className="mx-auto min-h-screen max-w-screen-2xl space-y-4 px-4 py-4 md:px-6">
        {/* Single Compact Header Bar */}
        <GovPageHeader
          title={pitch?.title || "Government Pitch Proposal"}
          eyebrow={pitch?.pitchReferenceId || (isRM ? "RM Assigned Workspace" : "Department Pitch")}
          description={pitch?.department ? `Department: ${pitch.department} • Outlay: ${formattedBudget}` : "Departmental development proposal seeking corporate CSR funding."}
          actions={
            <div className="flex items-center gap-2">
              {pitch?.status && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  pitch.status === "APPROVED" || pitch.status === "VERIFIED" || pitch.status === "CSR_COMMITTED"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {(pitch.status || "SUBMITTED").replace(/_/g, " ")}
                </span>
              )}

              <Link
                href="/pitches"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-900 transition-all"
              >
                <ArrowLeft size={15} /> Back to Pitches
              </Link>
            </div>
          }
        />

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader label="Loading pitch details..." />
          </div>
        ) : error || !pitch?.id ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
            <AlertCircle size={36} className="mx-auto text-rose-600 mb-2" />
            <h2 className="text-base font-bold text-rose-900">Pitch Unavailable</h2>
            <p className="mt-1 text-xs text-rose-700">This pitch was not found or is not assigned to your workspace.</p>
          </section>
        ) : (
          <div className="space-y-4">
            {/* Quick Summary KPI Cards */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PitchCard icon={<FileText size={16} className="text-blue-600" />} label="Pitch Reference" value={pitch.pitchReferenceId} />
              <PitchCard icon={<BadgeIndianRupee size={16} className="text-amber-600" />} label="Estimated Outlay" value={formattedBudget} />
              <PitchCard icon={<Building2 size={16} className="text-purple-600" />} label="Department" value={pitch.department || "Government Department"} />
              <PitchCard icon={<Calendar size={16} className="text-indigo-600" />} label="Submitted Date" value={pitch.createdAt ? new Date(pitch.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"} />
            </section>

            {/* Submitted Pitch Details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Submitted Pitch Application Details</h3>
                <p className="mt-0.5 text-xs text-slate-500">Official information submitted by the government department officer.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {detailFields.filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    <p className="mt-1 text-xs font-bold text-slate-900">{String(value)}</p>
                  </div>
                ))}
              </div>

              <LongAnswer label="CSR Requirement & Project Scope" value={pitch.csrRequirement} />
              <Documents label="HOD Certification Document" documents={pitch.hodCertificationDocument ? [pitch.hodCertificationDocument] : []} />
              <Documents label="Supporting Project Documents" documents={pitch.supportingDocuments} />
              <Documents label="Geo-Tagged Site Photos" documents={pitch.geoTaggedPhotos} />
            </section>

            {/* Relationship Manager Verification Action */}
            {isRM && (
              <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
                <div>
                  <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-700" /> Relationship Manager Verification
                  </h3>
                  <p className="mt-0.5 text-xs text-blue-800">Confirm pitch requirement & documents, then forward to Joint Secretary for approval decision.</p>
                </div>

                <button
                  type="button"
                  disabled={submittingReview || pitch.status === "JS_APPROVAL_PENDING"}
                  onClick={async () => {
                    setSubmittingReview(true);
                    setReviewMessage("");
                    try {
                      const result = await apiFetch<any>(`/rm/pitches/${pitch.id}/verify`, { method: "PATCH", body: JSON.stringify({}) });
                      setReviewMessage(result?.message || "Pitch verified and sent to the Joint Secretary.");
                      refetch();
                    } catch (err) {
                      setReviewMessage(err instanceof Error ? err.message : "Unable to send the pitch for approval.");
                    } finally {
                      setSubmittingReview(false);
                    }
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-blue-950 transition-all disabled:opacity-60"
                >
                  {submittingReview ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {pitch.status === "JS_APPROVAL_PENDING" ? "With Joint Secretary" : "Verify & Send to JS"}
                </button>
                {reviewMessage && <p className="text-xs font-bold text-blue-800 sm:col-span-2">{reviewMessage}</p>}
              </section>
            )}
          </div>
        )}
      </main>
    </GovPortalLayout>
  );
}

function PitchCard({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-blue-200 transition-all">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className="mt-2 truncate text-xs font-black text-slate-900">{value || "Not provided"}</p>
    </div>
  );
}

function LongAnswer({ label, value }: { label: string; value?: string | null }) {
  return value ? (
    <div className="rounded-xl border border-blue-100 bg-slate-50/70 p-4 space-y-1.5">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
        <FileText size={14} /> {label}
      </span>
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800 font-medium">{value}</p>
    </div>
  ) : null;
}

function Documents({ label, documents }: { label: string; documents?: string[] }) {
  if (!documents || documents.length === 0) return null;
  return (
    <div className="pt-2 border-t border-slate-100">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5 mb-2">
        <FileCode size={14} /> {label} ({documents.length})
      </span>
      <div className="flex flex-wrap gap-2">
        {documents.map((document, index) => (
          <a
            key={document}
            href={document}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <FileText size={14} className="text-blue-700" />
            <span>Document #{index + 1}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function joinValues(values?: string[]) {
  return values?.filter(Boolean).join(", ") || null;
}
