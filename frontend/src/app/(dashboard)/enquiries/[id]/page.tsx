"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  ArrowLeft, Building2, Calendar, CircleCheck, ClipboardCheck, Loader2, Mail, Send,
  ShieldCheck, MapPin, Coins, FileText, Phone, User, CheckCircle2, AlertCircle,
  ExternalLink, Layers, FileCode
} from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { Loader } from "@/components/ui/Loader";
import { useApiQuery } from "@/lib/apiHooks";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const displayStatus = (status?: string) => (status || "SUBMITTED").replace(/_/g, " ");

function extractRoleTokens(user: any, roles: any[], roleDetails: any[]): string[] {
  const tokens = new Set<string>();
  if (user?.role) tokens.add(String(user.role));
  if (user?.roleSlug) tokens.add(String(user.roleSlug));
  if (user?.roleNumericId) tokens.add(String(user.roleNumericId));

  (roles || []).forEach((r) => {
    if (typeof r === "string") tokens.add(r);
    else if (typeof r === "number") tokens.add(String(r));
    else if (r && typeof r === "object") {
      if (r.slug) tokens.add(String(r.slug));
      if (r.name) tokens.add(String(r.name));
      if (r.role) tokens.add(String(r.role));
    }
  });

  (roleDetails || []).forEach((rd) => {
    if (rd?.slug) tokens.add(String(rd.slug));
    if (rd?.name) tokens.add(String(rd.name));
  });

  return Array.from(tokens);
}

export default function EnquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const roleDetails = useAuthStore((state) => state.roleDetails);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const isRM = useMemo(() => {
    if (isAdmin) return true;
    const tokens = extractRoleTokens(user, roles, roleDetails);
    return tokens.some((t) => {
      const u = t.toUpperCase();
      return u.includes("RELATIONSHIP") || u.includes("RM") || u === "6";
    });
  }, [user, roles, roleDetails, isAdmin]);
  const path = isRM ? `/rm/enquiries/${params.id}` : `/corporate-enquiries/${params.id}`;

  const { data: response, isLoading, error } = useApiQuery<any>(
    ["enquiry", params.id, isRM ? "rm" : "standard"],
    path,
    { enabled: Boolean(params.id) }
  );

  const { data: assessmentResponse, refetch: refetchAssessment } = useApiQuery<any>(
    ["rm-feasibility", params.id],
    `/rm/enquiries/${params.id}/feasibility`,
    { enabled: isRM && Boolean(params.id) }
  );

  const enquiry = response?.data ?? response;
  const assessment = assessmentResponse?.data || null;

  const formattedBudget = enquiry?.indicativeBudget
    ? Number(enquiry.indicativeBudget) >= 10000000
      ? `₹${(Number(enquiry.indicativeBudget) / 10000000).toFixed(2)} Cr`
      : `₹${(Number(enquiry.indicativeBudget) / 100000).toFixed(2)} Lakhs`
    : "Not specified";

  return (
    <GovPortalLayout>
      <div className="mx-auto min-h-screen max-w-screen-2xl space-y-4 px-4 py-4 md:px-6">
        {/* Single Compact Header (Fixes excessive header height & redundant banners) */}
        <GovPageHeader
          title={enquiry?.corporateName ? enquiry.corporateName : "Corporate Enquiry Details"}
          eyebrow={enquiry?.trackingId || (isRM ? "RM Workspace" : "Corporate Desk")}
          description={enquiry?.sector ? `CSR Sector: ${enquiry.sector} • Budget: ${formattedBudget}` : "Official corporate CSR proposal & coordination request."}
          actions={
            <div className="flex items-center gap-2">
              {enquiry?.status && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  enquiry.status === "APPROVED" || enquiry.status === "VERIFIED" || enquiry.status === "SUBMITTED_TO_JS"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {displayStatus(enquiry.status)}
                </span>
              )}

              <Link
                href="/enquiries"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-900 transition-all"
              >
                <ArrowLeft size={15} /> Back to Enquiries
              </Link>
            </div>
          }
        />

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader label="Loading corporate enquiry details..." />
          </div>
        ) : error || !enquiry?.id ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
            <AlertCircle size={36} className="mx-auto text-rose-600 mb-2" />
            <h2 className="text-base font-bold text-rose-900">Enquiry Unavailable</h2>
            <p className="mt-1 text-xs text-rose-700">This enquiry was not found or is not assigned to your workspace authorization.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Metrics KPI Bar */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailCard
                icon={<Building2 size={16} className="text-blue-600" />}
                label="Corporate Partner"
                value={enquiry.corporateName}
                subtext={`MCA21 CIN: ${enquiry.mca21CIN || "N/A"}`}
              />
              <DetailCard
                icon={<Mail size={16} className="text-purple-600" />}
                label="Contact Email"
                value={enquiry.contactEmail}
                subtext={enquiry.mobile ? `Mobile: ${enquiry.mobile}` : undefined}
              />
              <DetailCard
                icon={<Coins size={16} className="text-amber-600" />}
                label="Indicative CSR Budget"
                value={formattedBudget}
                subtext={`Submitted: ${enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}`}
              />
              <DetailCard
                icon={<ShieldCheck size={16} className="text-emerald-600" />}
                label="RM Assignment"
                value={isRM ? "Assigned to You" : enquiry.assignedRelationshipManagerId ? "RM Assigned" : "Pending Assignment"}
                subtext={isRM ? "Active Reviewer" : "State CSR Cell"}
              />
            </div>

            {/* Application Information & Scope */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-blue-900" /> Submitted Corporate Application Details
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">Statutory and location information provided by the corporate entity upon submission.</p>
              </div>

              {/* Grid of Key Info */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="MCA21 CIN Identifier" value={enquiry.mca21CIN} mono />
                <InfoItem label="CSR Focus Sector" value={enquiry.sector} />
                <InfoItem label="Indicative CSR Outlay" value={formattedBudget} highlight />
                <InfoItem label="Contact Person Name" value={enquiry.contactPersonName} />
                <InfoItem label="Mobile Number" value={enquiry.mobile} />
                <InfoItem label="Contact Email Address" value={enquiry.contactEmail} />
                <InfoItem label="Preferred Division(s)" value={joinValues(enquiry.preferredDivisions)} />
                <InfoItem label="Preferred District(s)" value={joinValues(enquiry.preferredDistricts)} />
                <InfoItem label="Preferred Taluka(s) / City" value={joinValues(enquiry.preferredTalukas) || joinValues(enquiry.preferredCities)} />
              </div>

              {/* Proposed CSR Work Statement */}
              {enquiry.proposedCSRWork && (
                <div className="rounded-xl border border-blue-100 bg-slate-50/70 p-4 space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <FileText size={14} /> Proposed CSR Work Description
                  </span>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800 font-medium">
                    {enquiry.proposedCSRWork}
                  </p>
                </div>
              )}

              {/* Supporting Documents */}
              <Documents documents={enquiry.documents} />
            </div>

            {/* RM 13-Factor Feasibility Assessment Workspace (Visible for Relationship Managers) */}
            {isRM && (
              <AssessmentWorkspace
                enquiryId={enquiry.id}
                existingAssessment={assessment}
                onSubmitted={refetchAssessment}
              />
            )}
          </div>
        )}
      </div>
    </GovPortalLayout>
  );
}

function DetailCard({
  icon,
  label,
  value,
  subtext
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
  subtext?: string | null
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-blue-200 transition-all">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className="mt-2 truncate text-xs font-black text-slate-900">{value || "Not provided"}</p>
      {subtext && <p className="mt-0.5 text-[11px] font-medium text-slate-500">{subtext}</p>}
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono = false,
  highlight = false
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <p className={`mt-1 text-xs ${highlight ? "font-extrabold text-blue-950" : "font-bold text-slate-900"} ${mono ? "font-mono" : ""}`}>
        {value || "Not specified"}
      </p>
    </div>
  );
}

function Documents({ documents }: { documents?: string[] }) {
  if (!documents || documents.length === 0) return null;
  return (
    <div className="pt-2 border-t border-slate-100">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5 mb-2">
        <FileCode size={14} /> Attached Supporting Documents ({documents.length})
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
            <ExternalLink size={12} className="text-blue-600" />
          </a>
        ))}
      </div>
    </div>
  );
}

function joinValues(values?: string[]) {
  return values?.filter(Boolean).join(", ") || null;
}

const CHECKS = [
  [1, "CSR Compliance", "Activity falls within Schedule VII of the Companies Act.", true],
  [2, "CSR Compliance", "Not a prohibited CSR activity.", true],
  [3, "Need Verification", "Addresses a genuine, verified development need.", true],
  [4, "Need Verification", "Does not duplicate a government scheme or ongoing project in the same location.", true],
  [5, "Site Readiness", "Site or land is available and under government ownership/control where required.", true],
  [6, "Site Readiness", "Required permissions and clearances are obtainable in reasonable time.", true],
  [7, "Site Readiness", "Required government support, personnel, and access are confirmed.", true],
  [8, "Financial Viability", "Indicative budget is adequate for the proposed scope.", false],
  [9, "Financial Viability", "Cost estimate is realistic and benchmarked.", false],
  [10, "Execution Capacity", "Implementing capacity exists.", false],
  [11, "Execution Capacity", "Timeline is realistic.", false],
  [12, "Sustainability", "Post-completion ownership of the asset is clear.", true],
  [13, "Sustainability", "Maintenance or recurring-cost responsibility is identified.", true],
] as const;

function AssessmentWorkspace({
  enquiryId,
  existingAssessment,
  onSubmitted
}: {
  enquiryId: string;
  existingAssessment: any;
  onSubmitted: () => void
}) {
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
    const missingCondition = criticalGaps.some(([number]) => {
      const condition = conditions[number];
      return !condition?.remediation || !condition?.owner || !condition?.targetDate;
    });
    if (missingCondition) return setMessage("Each critical gap needs a remediation, accountable owner, and target date before it can proceed with conditions.");

    setSubmitting(true);
    try {
      const response = await apiFetch<any>(`/rm/enquiries/${enquiryId}/feasibility`, {
        method: "POST",
        body: JSON.stringify({
          executiveSummary: summary,
          targetDepartmentId: departmentId,
          targetDistricts,
          conditions: criticalGaps.map(([itemNumber]) => ({ itemNumber, ...conditions[itemNumber] })),
          checklist: CHECKS.map(([itemNumber]) => ({ itemNumber, answer: answers[itemNumber], note: notes[itemNumber] || "" }))
        })
      });
      setMessage(response?.message || "Assessment submitted to the Joint Secretary.");
      onSubmitted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit the assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveInteraction = async () => {
    if (interactionNote.trim().length < 3) return setMessage("Enter a brief interaction note first.");
    setSavingInteraction(true);
    try {
      await apiFetch(`/rm/enquiries/${enquiryId}/interactions`, {
        method: "POST",
        body: JSON.stringify({ note: interactionNote, channel: "PORTAL" })
      });
      setInteractionNote("");
      refetchInteractions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to log the interaction.");
    } finally {
      setSavingInteraction(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xs">
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-900 p-2 text-white shadow-xs">
            <ClipboardCheck size={19} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">13-Factor Feasibility Assessment Workspace</h3>
            <p className="mt-0.5 text-xs text-slate-600">Record evidence, remediation conditions, and Department JS routing.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white border border-blue-200 px-3 py-1 text-xs font-bold text-blue-900 shadow-2xs">
            {completed}/13 completed
          </span>
          {existingAssessment?.status === "SUBMITTED_TO_JS" && (
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold">
              With Joint Secretary
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* Department & District Routing */}
        <div className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 md:grid-cols-2">
          <label className="text-xs font-bold text-slate-700">
            Target Government Department
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="">Select approved department</option>
              {departments.map((department: any) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            Target District(s)
            <input
              value={districtText}
              onChange={(event) => setDistrictText(event.target.value)}
              placeholder="e.g. Pune, Thane, Nagpur"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </label>
          <p className="md:col-span-2 text-[11px] text-blue-900 font-medium">
            One approved project can route to multiple DNCs—one for each comma-separated target district.
          </p>
        </div>

        {/* Decision Rule */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 font-medium">
          <strong>Decision Rule:</strong> Every check needs an answer. Critical gaps can be forwarded as <strong>proceed with conditions</strong> only when remediation, owner, and target date are recorded.
        </div>

        {/* Checklist */}
        <div className="grid gap-3 xl:grid-cols-2">
          {CHECKS.map(([number, dimension, question, critical]) => {
            const requiresCondition = critical && answers[number] && answers[number] !== "YES";
            const condition = conditions[number] || { remediation: "", owner: "", targetDate: "" };
            return (
              <div key={number} className="rounded-xl border border-slate-200 p-3 bg-white hover:border-blue-200 transition-all">
                <div className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-700">
                    {number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{dimension}</p>
                      {critical && (
                        <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[9px] font-extrabold uppercase text-rose-800">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{question}</p>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {["YES", "NO", "NA"].map(answer => (
                        <button
                          key={answer}
                          type="button"
                          onClick={() => setAnswers(prev => ({ ...prev, [number]: answer }))}
                          className={`rounded-lg border px-3 py-1 text-[10px] font-extrabold transition-all ${
                            answers[number] === answer
                              ? answer === "YES"
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                                : "border-rose-500 bg-rose-500 text-white shadow-2xs"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                          }`}
                        >
                          {answer}
                        </button>
                      ))}
                    </div>

                    <input
                      value={notes[number] || ""}
                      onChange={(event) => setNotes(prev => ({ ...prev, [number]: event.target.value }))}
                      placeholder="Evidence or reviewer note"
                      className="mt-2.5 w-full border-0 border-t border-slate-100 pt-2 text-xs text-slate-700 outline-none placeholder:text-slate-400"
                    />

                    {requiresCondition && (
                      <div className="mt-3 grid gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                        <input
                          value={condition.remediation}
                          onChange={(event) => setConditions(prev => ({ ...prev, [number]: { ...condition, remediation: event.target.value } }))}
                          placeholder="Required remediation action"
                          className="rounded-lg border border-amber-200 bg-white p-2 text-xs text-slate-800"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={condition.owner}
                            onChange={(event) => setConditions(prev => ({ ...prev, [number]: { ...condition, owner: event.target.value } }))}
                            placeholder="Accountable owner"
                            className="rounded-lg border border-amber-200 bg-white p-2 text-xs text-slate-800"
                          />
                          <input
                            type="date"
                            value={condition.targetDate}
                            onChange={(event) => setConditions(prev => ({ ...prev, [number]: { ...condition, targetDate: event.target.value } }))}
                            className="rounded-lg border border-amber-200 bg-white p-2 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Executive Summary & Submit */}
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] pt-2">
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            placeholder="Executive summary for the Joint Secretary: evidence, risks, conditions and recommendation..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 outline-none focus:border-blue-600"
          />
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit to Joint Secretary
          </button>
        </div>

        {/* Log Interaction */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={interactionNote}
              onChange={(event) => setInteractionNote(event.target.value)}
              placeholder="Log a call, meeting, document request, or follow-up note…"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
            />
            <button
              type="button"
              onClick={saveInteraction}
              disabled={savingInteraction}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-60"
            >
              {savingInteraction ? "Saving…" : "Log Interaction"}
            </button>
          </div>

          {interactions.length > 0 && (
            <div className="max-h-36 space-y-2 overflow-y-auto pt-1">
              {interactions.map((interaction: any) => (
                <p key={interaction.id} className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">{new Date(interaction.occurredAt).toLocaleString("en-IN")}: </span>
                  {interaction.note}
                </p>
              ))}
            </div>
          )}
        </div>

        {message && (
          <p className={`text-xs font-bold ${message.toLowerCase().includes("submitted") ? "text-emerald-700" : "text-rose-700"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
