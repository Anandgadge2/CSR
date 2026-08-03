"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Building2, Calendar, CircleCheck, ClipboardCheck, Loader2, Mail, Send, ShieldCheck } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { Loader } from "@/components/ui/Loader";
import { useApiQuery } from "@/lib/apiHooks";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const displayStatus = (status?: string) => (status || "SUBMITTED").replace(/_/g, " ");

export default function EnquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const activeRoles = roles?.length ? roles : user?.role ? [user.role] : [];
  const isRM = activeRoles.some((role) => /RELATIONSHIP[ _-]?MANAGER/i.test(role));
  const path = isRM ? `/rm/enquiries/${params.id}` : `/corporate-enquiries/${params.id}`;
  const { data: response, isLoading, error } = useApiQuery<any>(["enquiry", params.id, isRM ? "rm" : "standard"], path, { enabled: Boolean(params.id) });
  const { data: assessmentResponse, refetch: refetchAssessment } = useApiQuery<any>(["rm-feasibility", params.id], `/rm/enquiries/${params.id}/feasibility`, { enabled: isRM && Boolean(params.id) });
  const enquiry = response?.data ?? response;
  const assessment = assessmentResponse?.data || null;
  const detailFields = enquiry ? [
    ["MCA21 CIN", enquiry.mca21CIN],
    ["CSR Sector", enquiry.sector],
    ["Indicative budget", enquiry.indicativeBudget ? `₹${Number(enquiry.indicativeBudget).toLocaleString("en-IN")}` : null],
    ["Preferred division(s)", joinValues(enquiry.preferredDivisions)],
    ["Preferred district(s)", joinValues(enquiry.preferredDistricts)],
    ["Preferred city / cities", joinValues(enquiry.preferredCities)],
    ["Preferred taluka(s)", joinValues(enquiry.preferredTalukas)],
    ["Contact person", enquiry.contactPersonName],
    ["Mobile number", enquiry.mobile],
    ["Email address", enquiry.contactEmail],
  ] : [];

  return (
    <GovPortalLayout>
      <main className="mx-auto min-h-screen max-w-screen-2xl px-4 py-4 md:px-6">
        <GovPageHeader title="Corporate Enquiry" eyebrow={isRM ? "Assigned to you" : "Corporate Desk"} actions={<Link href="/enquiries" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-800"><ArrowLeft size={15} /> Back to register</Link>} />

        {isLoading ? <div className="py-20"><Loader label="Loading enquiry details..." /></div> : error || !enquiry?.id ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
            <h2 className="text-base font-bold text-rose-900">Enquiry unavailable</h2>
            <p className="mt-1 text-sm text-rose-700">This enquiry was not found or is not assigned to your workspace.</p>
          </section>
        ) : (
          <div className="space-y-4">
            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-6 text-white shadow-lg">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">{enquiry.trackingId || "Corporate enquiry"}</p><h2 className="mt-2 text-2xl font-extrabold">{enquiry.corporateName || "Corporate Partner"}</h2><p className="mt-1 text-sm text-blue-100">Corporate partnership and CSR coordination request</p></div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-100"><CircleCheck size={14} /> {displayStatus(enquiry.status)}</span>
              </div>
            </section>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DetailCard icon={<Building2 size={18} />} label="Corporate partner" value={enquiry.corporateName} />
              <DetailCard icon={<Mail size={18} />} label="Contact email" value={enquiry.contactEmail} />
              <DetailCard icon={<Calendar size={18} />} label="Submitted" value={enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"} />
              <DetailCard icon={<ShieldCheck size={18} />} label="RM assignment" value={isRM ? "Assigned to you" : enquiry.assignedRelationshipManagerId ? "Relationship manager assigned" : "Awaiting assignment"} />
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900">Submitted application details</h3>
              <p className="mt-1 text-xs text-slate-500">The information provided by the corporate at the time of submission.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {detailFields.filter(([, value]) => value).map(([label, value]) => <DetailCard key={label} icon={<Building2 size={18} />} label={label} value={String(value)} />)}
              </div>
              <LongAnswer label="Proposed CSR work" value={enquiry.proposedCSRWork} />
              <Documents documents={enquiry.documents} />
            </section>
            {isRM && <AssessmentWorkspace enquiryId={enquiry.id} existingAssessment={assessment} onSubmitted={refetchAssessment} />}
          </div>
        )}
      </main>
    </GovPortalLayout>
  );
}

function DetailCard({ icon, label, value }: { icon: ReactNode; label: string; value?: string | null }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-blue-800">{icon}<p className="text-[11px] font-extrabold uppercase tracking-wider">{label}</p></div><p className="mt-3 break-words text-sm font-bold text-slate-900">{value || "Not provided"}</p></div>;
}

function LongAnswer({ label, value }: { label: string; value?: string | null }) { return value ? <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{value}</p></div> : null; }
function Documents({ documents }: { documents?: string[] }) { return documents?.length ? <div className="mt-5"><p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">Supporting documents</p><div className="mt-2 flex flex-wrap gap-2">{documents.map((document, index) => <a key={document} href={document} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100">Document {index + 1}</a>)}</div></div> : null; }
function joinValues(values?: string[]) { return values?.filter(Boolean).join(", ") || null; }

const CHECKS = [
  [1, "CSR Compliance", "Activity falls within Schedule VII of the Companies Act.", true], [2, "CSR Compliance", "Not a prohibited CSR activity.", true], [3, "Need Verification", "Addresses a genuine, verified development need.", true], [4, "Need Verification", "Does not duplicate a government scheme or ongoing project in the same location.", true], [5, "Site Readiness", "Site or land is available and under government ownership/control where required.", true], [6, "Site Readiness", "Required permissions and clearances are obtainable in reasonable time.", true], [7, "Site Readiness", "Required government support, personnel, and access are confirmed.", true], [8, "Financial Viability", "Indicative budget is adequate for the proposed scope.", false], [9, "Financial Viability", "Cost estimate is realistic and benchmarked.", false], [10, "Execution Capacity", "Implementing capacity exists.", false], [11, "Execution Capacity", "Timeline is realistic.", false], [12, "Sustainability", "Post-completion ownership of the asset is clear.", true], [13, "Sustainability", "Maintenance or recurring-cost responsibility is identified.", true],
] as const;

function AssessmentWorkspace({ enquiryId, existingAssessment, onSubmitted }: { enquiryId: string; existingAssessment: any; onSubmitted: () => void }) {
  const { data: departmentsResponse } = useApiQuery<any>(["rm-government-departments"], "/rm/government-departments");
  const { data: interactionsResponse, refetch: refetchInteractions } = useApiQuery<any>(["rm-enquiry-interactions", enquiryId], `/rm/enquiries/${enquiryId}/interactions`);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [conditions, setConditions] = useState<Record<number, { remediation: string; owner: string; targetDate: string }>>({});
  const [summary, setSummary] = useState("");
  const [districtText, setDistrictText] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [interactionNote, setInteractionNote] = useState("");
  const [savingInteraction, setSavingInteraction] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const departments = Array.isArray(departmentsResponse?.data) ? departmentsResponse.data : [];
  const interactions = Array.isArray(interactionsResponse?.data) ? interactionsResponse.data : [];
  useEffect(() => {
    if (!existingAssessment?.checklist) return;
    const entries = Array.isArray(existingAssessment.checklist) ? existingAssessment.checklist : [];
    setAnswers(Object.fromEntries(entries.map((item: any) => [item.itemNumber, item.answer || ""])));
    setNotes(Object.fromEntries(entries.map((item: any) => [item.itemNumber, item.note || ""])));
    setSummary(existingAssessment.executiveSummary || "");
    setDistrictText(Array.isArray(existingAssessment.targetDistricts) ? existingAssessment.targetDistricts.join(", ") : "");
    setDepartmentId(existingAssessment.targetDepartmentId || "");
    setConditions(Object.fromEntries((Array.isArray(existingAssessment.conditions) ? existingAssessment.conditions : []).map((condition: any) => [condition.itemNumber, { remediation: condition.remediation || "", owner: condition.owner || "", targetDate: condition.targetDate || "" }])));
  }, [existingAssessment]);
  const completed = CHECKS.filter(([number]) => answers[number]).length;
  const criticalGaps = CHECKS.filter(([number, , , critical]) => critical && answers[number] && answers[number] !== "YES");
  const submit = async () => {
    setMessage("");
    if (completed !== CHECKS.length) return setMessage("Answer all 13 checks before submitting to the Joint Secretary.");
    const targetDistricts = districtText.split(",").map(value => value.trim()).filter(Boolean);
    if (!departmentId || !targetDistricts.length) return setMessage("Select the target department and at least one target district for JS routing.");
    const missingCondition = criticalGaps.some(([number]) => { const condition = conditions[number]; return !condition?.remediation || !condition?.owner || !condition?.targetDate; });
    if (missingCondition) return setMessage("Each critical gap needs a remediation, accountable owner, and target date before it can proceed with conditions.");
    setSubmitting(true);
    try {
      const response = await apiFetch<any>(`/rm/enquiries/${enquiryId}/feasibility`, { method: "POST", body: JSON.stringify({ executiveSummary: summary, targetDepartmentId: departmentId, targetDistricts, conditions: criticalGaps.map(([itemNumber]) => ({ itemNumber, ...conditions[itemNumber] })), checklist: CHECKS.map(([itemNumber]) => ({ itemNumber, answer: answers[itemNumber], note: notes[itemNumber] || "" })) }) });
      setMessage(response?.message || "Assessment submitted to the Joint Secretary.");
      onSubmitted();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to submit the assessment."); } finally { setSubmitting(false); }
  };
  const saveInteraction = async () => { if (interactionNote.trim().length < 3) return setMessage("Enter a brief interaction note first."); setSavingInteraction(true); try { await apiFetch(`/rm/enquiries/${enquiryId}/interactions`, { method: "POST", body: JSON.stringify({ note: interactionNote, channel: "PORTAL" }) }); setInteractionNote(""); refetchInteractions(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to log the interaction."); } finally { setSavingInteraction(false); } };
  return <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-3"><div className="rounded-xl bg-blue-900 p-2 text-white"><ClipboardCheck size={19} /></div><div><h3 className="text-sm font-extrabold text-slate-900">13-factor feasibility assessment</h3><p className="mt-0.5 text-xs text-slate-600">Review, record evidence, conditions and the execution route for the Joint Secretary.</p></div></div><div className="flex items-center gap-2"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-900 shadow-sm">{completed}/13 completed</span>{existingAssessment?.status === "SUBMITTED_TO_JS" && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">With Joint Secretary</span>}</div></div><div className="space-y-4 p-5"><div className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-700">Target Government Department<select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"><option value="">Select approved department</option>{departments.map((department: any) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label className="text-xs font-bold text-slate-700">Target district(s)<input value={districtText} onChange={(event) => setDistrictText(event.target.value)} placeholder="e.g. Pune, Thane" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs" /></label><p className="md:col-span-2 text-[11px] text-blue-800">One approved project can route to multiple DNCs—one for each comma-separated target district. The Department Admin then assigns one or more DNOs.</p></div><div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"><strong>Decision rule:</strong> every check needs an answer. Any gap, including a critical one, can be forwarded as <strong>proceed with conditions</strong> only when the remediation, accountable owner and target date are recorded. SLA days are set by Super Admin and count Maharashtra business days.</div><div className="grid gap-3 xl:grid-cols-2">{CHECKS.map(([number, dimension, question, critical]) => { const requiresCondition = critical && answers[number] && answers[number] !== "YES"; const condition = conditions[number] || { remediation: "", owner: "", targetDate: "" }; return <div key={number} className="rounded-xl border border-slate-200 p-3"><div className="flex gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-700">{number}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-slate-900">{dimension}</p>{critical && <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-rose-700">Critical</span>}</div><p className="mt-1 text-xs leading-5 text-slate-600">{question}</p><div className="mt-2 flex flex-wrap gap-2">{["YES", "NO", "NA"].map(answer => <button key={answer} type="button" onClick={() => setAnswers(prev => ({ ...prev, [number]: answer }))} className={`rounded-lg border px-3 py-1 text-[10px] font-extrabold ${answers[number] === answer ? answer === "YES" ? "border-emerald-600 bg-emerald-600 text-white" : "border-rose-500 bg-rose-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>{answer}</button>)}</div><input value={notes[number] || ""} onChange={(event) => setNotes(prev => ({ ...prev, [number]: event.target.value }))} placeholder="Evidence or reviewer note" className="mt-2 w-full border-0 border-t border-slate-100 pt-2 text-xs text-slate-700 outline-none placeholder:text-slate-400" />{requiresCondition && <div className="mt-3 grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2"><input value={condition.remediation} onChange={(event) => setConditions(prev => ({ ...prev, [number]: { ...condition, remediation: event.target.value } }))} placeholder="Required remediation" className="rounded border border-amber-200 bg-white p-2 text-xs" /><div className="grid grid-cols-2 gap-2"><input value={condition.owner} onChange={(event) => setConditions(prev => ({ ...prev, [number]: { ...condition, owner: event.target.value } }))} placeholder="Accountable owner" className="rounded border border-amber-200 bg-white p-2 text-xs" /><input type="date" value={condition.targetDate} onChange={(event) => setConditions(prev => ({ ...prev, [number]: { ...condition, targetDate: event.target.value } }))} className="rounded border border-amber-200 bg-white p-2 text-xs" /></div></div>}</div></div></div>; })}</div><div className="grid gap-3 lg:grid-cols-[1fr_auto]"><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} placeholder="Executive summary for the Joint Secretary: evidence, risks, conditions and recommendation." className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-5 text-slate-800 outline-none focus:border-blue-600" /><button type="button" onClick={submit} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit to Joint Secretary</button></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-2 sm:flex-row"><input value={interactionNote} onChange={(event) => setInteractionNote(event.target.value)} placeholder="Log a call, meeting, document request, or follow-up…" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-2 text-xs" /><button type="button" onClick={saveInteraction} disabled={savingInteraction} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{savingInteraction ? "Saving…" : "Log interaction"}</button></div>{interactions.length > 0 && <div className="mt-3 max-h-36 space-y-2 overflow-y-auto">{interactions.map((interaction: any) => <p key={interaction.id} className="rounded-lg bg-white p-2 text-xs text-slate-700"><span className="font-bold text-slate-900">{new Date(interaction.occurredAt).toLocaleString("en-IN")}: </span>{interaction.note}</p>)}</div>}</div>{message && <p className={`text-xs font-semibold ${message.toLowerCase().includes("submitted") ? "text-emerald-700" : "text-rose-700"}`}>{message}</p>}</div></section>;
}
