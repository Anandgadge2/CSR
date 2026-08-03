"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeft, BadgeIndianRupee, Building2, Calendar, CheckCircle2, FileText, Loader2, Send } from "lucide-react";
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
  const { data: response, isLoading, error, refetch } = useApiQuery<any>(["pitch", params.id, isRM ? "rm" : "standard"], isRM ? `/rm/pitches/${params.id}` : `/government-pitches/${params.id}`, { enabled: Boolean(params.id) });
  const pitch = response?.data ?? response;
  const budget = Number(pitch?.budget || pitch?.estimatedCost || 0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const detailFields = pitch ? [
    ["Name of official", pitch.officialName], ["Designation", pitch.designation], ["Department", pitch.department], ["Office name", pitch.officeName], ["Service class", pitch.serviceClass], ["Mobile number", pitch.mobile], ["Email address", pitch.email], ["Division(s)", joinValues(pitch.divisions)], ["District(s)", joinValues(pitch.districts)], ["City / cities", joinValues(pitch.cities)], ["Taluka(s)", joinValues(pitch.talukas)], ["Exact location", pitch.exactLocation], ["Estimated cost", pitch.estimatedCost ? `₹${Number(pitch.estimatedCost).toLocaleString("en-IN")}` : null], ["Government fund declaration", typeof pitch.govtFundDeclaration === "boolean" ? pitch.govtFundDeclaration ? "No government funds available" : "Government funds available" : null], ["Certification type", pitch.certificationType]
  ] : [];

  return <GovPortalLayout><main className="mx-auto min-h-screen max-w-screen-2xl px-4 py-4 md:px-6">
    <GovPageHeader title="Government Pitch" eyebrow={isRM ? "Assigned to you" : "Department Pitches"} actions={<Link href="/pitches" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-800"><ArrowLeft size={15} /> Back to pitches</Link>} />
    {isLoading ? <div className="py-20"><Loader label="Loading pitch details..." /></div> : error || !pitch?.id ? <section className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center"><h2 className="text-base font-bold text-rose-900">Pitch unavailable</h2><p className="mt-1 text-sm text-rose-700">This pitch was not found or is not assigned to your workspace.</p></section> : <div className="space-y-5">
      <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-950 via-blue-900 to-blue-800 p-6 text-white shadow-lg"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">{pitch.pitchReferenceId || "Government development need"}</p><div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row"><h2 className="max-w-3xl text-2xl font-extrabold">{pitch.title || "Government Pitch Proposal"}</h2><span className="h-fit w-fit rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-100">{(pitch.status || "SUBMITTED").replace(/_/g, " ")}</span></div></section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><PitchCard icon={<FileText size={18} />} label="Pitch reference" value={pitch.pitchReferenceId} /><PitchCard icon={<BadgeIndianRupee size={18} />} label="Estimated outlay" value={budget ? `₹${budget.toLocaleString("en-IN")}` : "Not specified"} /><PitchCard icon={<Building2 size={18} />} label="Department" value={pitch.department || "Government department"} /><PitchCard icon={<Calendar size={18} />} label="Submitted" value={pitch.createdAt ? new Date(pitch.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"} /></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-extrabold text-slate-900">Submitted pitch details</h3><p className="mt-1 text-xs text-slate-500">The complete information submitted by the government department.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{detailFields.filter(([, value]) => value).map(([label, value]) => <PitchCard key={label} icon={<FileText size={18} />} label={label} value={String(value)} />)}</div><LongAnswer label="CSR requirement" value={pitch.csrRequirement} /><Documents label="HOD certification" documents={pitch.hodCertificationDocument ? [pitch.hodCertificationDocument] : []} /><Documents label="Supporting documents" documents={pitch.supportingDocuments} /><Documents label="Geo-tagged photos" documents={pitch.geoTaggedPhotos} /></section>
      {isRM && <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-extrabold text-blue-950">Relationship Manager verification</h3><p className="mt-1 text-xs text-blue-800">Confirm the pitch documents and requirement, then send it to the Joint Secretary for an approval decision.</p></div><button type="button" disabled={submittingReview || pitch.status === "JS_APPROVAL_PENDING"} onClick={async () => { setSubmittingReview(true); setReviewMessage(""); try { const result = await apiFetch<any>(`/rm/pitches/${pitch.id}/verify`, { method: "PATCH", body: JSON.stringify({}) }); setReviewMessage(result?.message || "Pitch verified and sent to the Joint Secretary."); refetch(); } catch (err) { setReviewMessage(err instanceof Error ? err.message : "Unable to send the pitch for approval."); } finally { setSubmittingReview(false); } }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-60">{submittingReview ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}{pitch.status === "JS_APPROVAL_PENDING" ? "With Joint Secretary" : "Verify & send to JS"}</button>{reviewMessage && <p className="text-xs font-semibold text-blue-800 sm:col-span-2">{reviewMessage}</p>}</section>}
    </div>}
  </main></GovPortalLayout>;
}

function PitchCard({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-blue-800">{icon}<p className="text-[11px] font-extrabold uppercase tracking-wider">{label}</p></div><p className="mt-3 break-words text-sm font-bold text-slate-900">{value || "Not provided"}</p></div>; }
function LongAnswer({ label, value }: { label: string; value?: string | null }) { return value ? <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{value}</p></div> : null; }
function Documents({ label, documents }: { label: string; documents?: string[] }) { return documents?.length ? <div className="mt-5"><p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">{label}</p><div className="mt-2 flex flex-wrap gap-2">{documents.map((document, index) => <a key={document} href={document} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100">File {index + 1}</a>)}</div></div> : null; }
function joinValues(values?: string[]) { return values?.filter(Boolean).join(", ") || null; }
