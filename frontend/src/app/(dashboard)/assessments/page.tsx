"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileCheck2, Loader2, XCircle, ClipboardCheck, ArrowUpRight, Search, Building2, MapPin, Sparkles } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useApiQuery } from "@/lib/apiHooks";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function AssessmentsPage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const roleNames = roles?.length ? roles : user?.role ? [user.role] : [];
  const isJs = roleNames.some((role) => /JOINT[ _-]?SECRETARY/i.test(String(role)));

  const { data: response, isLoading, refetch } = useApiQuery<any>(
    [isJs ? "js-pending-assessments" : "feasibility-assessments"],
    isJs ? "/js/assessments/pending" : "/feasibility"
  );

  const [search, setSearch] = useState("");

  const assessments = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.assessments)
    ? response.data.assessments
    : Array.isArray(response)
    ? response
    : [];

  const filtered = assessments.filter((a: any) => {
    const term = search.toLowerCase();
    return (
      (a.id || "").toLowerCase().includes(term) ||
      (a.enquiryId || "").toLowerCase().includes(term) ||
      (a.executiveSummary || "").toLowerCase().includes(term) ||
      (a.recommendation || "").toLowerCase().includes(term)
    );
  });

  return (
    <GovPortalLayout>
      <main className="mx-auto min-h-screen max-w-screen-2xl space-y-4 px-4 py-4 md:px-6">
        <GovPageHeader
          eyebrow={isJs ? "Joint Secretary Workspace" : "Assessment Register"}
          title={isJs ? "Feasibility Decisions & Approvals" : "Feasibility Reports & Assessments"}
          description={
            isJs
              ? "Review 13-factor feasibility assessments, conditional gaps, and district routing submitted by RMs before deciding."
              : "Technical, financial, and execution feasibility assessments compiled by Relationship Managers."
          }
        />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Assessments"
            value={assessments.length}
            icon={ClipboardCheck}
            index={0}
            badge="Feasibility Engine"
            sublabel="Compiled reports"
          />
          <StatCard
            label="Submitted to JS"
            value={assessments.filter((a: any) => a.status === "SUBMITTED_TO_JS").length}
            icon={FileCheck2}
            index={1}
            badge="Pending JS Decision"
            sublabel="Awaiting decision"
          />
          <StatCard
            label="Approved & Routed"
            value={assessments.filter((a: any) => a.status === "APPROVED" || a.status === "ROUTED" || a.jsDecision === "PROCEED").length}
            icon={CheckCircle2}
            index={2}
            badge="Execution Pipeline"
            sublabel="Routed to DNC / Dept"
          />
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by assessment ID, enquiry ID, or recommendation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-900" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500 shadow-xs">
            <ClipboardCheck size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-slate-900">No feasibility assessments found</p>
            <p className="mt-1.5 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Relationship Managers compile 13-Factor Feasibility Assessments directly inside assigned Corporate Enquiries. Once compiled, reports are submitted to Joint Secretary for review.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/enquiries"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-all"
              >
                View Corporate Enquiries <ArrowUpRight size={14} />
              </Link>
            </div>
          </section>
        ) : (
          <div className="space-y-4">
            {filtered.map((assessment: any) =>
              isJs ? (
                <JsAssessmentCard key={assessment.id} assessment={assessment} onCompleted={refetch} />
              ) : (
                <section key={assessment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-blue-900">Assessment #{assessment.id.slice(0, 8)}</p>
                      <h3 className="mt-0.5 text-sm font-extrabold text-slate-900">Corporate Enquiry #{assessment.enquiryId?.slice(0, 8) || assessment.enquiryId}</h3>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-blue-800 border border-blue-200">
                      {assessment.status}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Target Department</span>
                      <p className="mt-0.5 font-bold text-slate-800">{assessment.targetDepartmentId || "Not specified"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Target District(s)</span>
                      <p className="mt-0.5 font-bold text-slate-800">{Array.isArray(assessment.targetDistricts) ? assessment.targetDistricts.join(", ") : "Statewide"}</p>
                    </div>
                  </div>

                  {assessment.executiveSummary && (
                    <div className="rounded-xl bg-blue-50/40 p-3.5 border border-blue-100">
                      <p className="text-[11px] font-bold text-blue-950">Executive Summary</p>
                      <p className="mt-1 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{assessment.executiveSummary}</p>
                    </div>
                  )}
                </section>
              )
            )}
          </div>
        )}
      </main>
    </GovPortalLayout>
  );
}

function JsAssessmentCard({ assessment, onCompleted }: { assessment: any; onCompleted: () => void }) {
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");
  const checklist = Array.isArray(assessment.checklist) ? assessment.checklist : [];
  const conditions = Array.isArray(assessment.conditions) ? assessment.conditions : [];

  const decide = async (decision: "PROCEED" | "PROCEED_WITH_CONDITIONS" | "DO_NOT_PROCEED") => {
    setWorking(decision);
    setMessage("");
    try {
      const result = await apiFetch<any>(`/js/assessments/${assessment.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, reason })
      });
      setMessage(result?.message || "Decision recorded.");
      onCompleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to record decision.");
    } finally {
      setWorking("");
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-xs font-extrabold text-blue-900">Assessment {assessment.id.slice(0, 8)}</p>
          <h2 className="mt-1 text-base font-extrabold text-slate-900">Corporate Enquiry #{assessment.enquiryId}</h2>
          <p className="mt-1 text-xs text-slate-600">RM Recommendation: <strong>{assessment.recommendation?.replaceAll("_", " ")}</strong></p>
        </div>
        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold text-amber-900 border border-amber-200">
          Awaiting JS Decision
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Target Department" value={assessment.targetDepartmentId || "Not selected"} />
          <Info label="Target Districts" value={assessment.targetDistricts?.join(", ") || "Statewide"} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-extrabold text-slate-900">RM Executive Summary</p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{assessment.executiveSummary || "No summary supplied."}</p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {checklist.map((item: any) => (
            <div key={item.itemNumber} className="rounded-lg border border-slate-200 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-slate-900">{item.itemNumber}. {item.dimension}</p>
                <span className={`rounded px-2 py-0.5 text-[10px] font-extrabold ${item.answer === "YES" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                  {item.answer}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{item.checkText}</p>
              {item.note && <p className="mt-2 border-t border-slate-100 pt-2 text-slate-700">{item.note}</p>}
            </div>
          ))}
        </div>

        {conditions.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-extrabold text-amber-950">Conditions that must be carried into execution</p>
            <div className="mt-2 space-y-2">
              {conditions.map((condition: any) => (
                <p key={condition.itemNumber} className="rounded-lg bg-white p-2 text-xs text-slate-700">
                  <strong>Check {condition.itemNumber}:</strong> {condition.remediation} — Owner: {condition.owner}; target: {condition.targetDate}
                </p>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={2}
          placeholder="Decision note (required for a decision not to proceed; recommended for all decisions)"
          className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-600"
        />

        <div className="flex flex-wrap gap-2">
          <button disabled={Boolean(working)} onClick={() => decide("PROCEED")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-all disabled:opacity-60">
            <CheckCircle2 size={15} /> Approve & Route Project
          </button>
          <button disabled={Boolean(working)} onClick={() => decide("PROCEED_WITH_CONDITIONS")} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-all disabled:opacity-60">
            <FileCheck2 size={15} /> Approve with Conditions
          </button>
          <button disabled={Boolean(working)} onClick={() => decide("DO_NOT_PROCEED")} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 shadow-xs hover:bg-rose-100 transition-all disabled:opacity-60">
            <XCircle size={15} /> Do Not Proceed
          </button>
        </div>

        {working && <p className="text-xs font-semibold text-blue-800">Recording decision…</p>}
        {message && <p className="text-xs font-semibold text-slate-700">{message}</p>}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">{label}</p>
      <p className="mt-1 break-words text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}
