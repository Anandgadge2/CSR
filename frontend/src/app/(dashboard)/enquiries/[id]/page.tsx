"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  ArrowLeft, Building2, Calendar, CircleCheck, ClipboardCheck, Loader2, Mail, Send,
  ShieldCheck, MapPin, Coins, FileText, Phone, User, CheckCircle2, AlertCircle,
  ExternalLink, Layers, FileCode, Search, ShieldAlert, UserCheck, Flag, CheckSquare,
  Clock, AlertTriangle, Eye, EyeOff, Lock, RefreshCw, MessageSquare, History, Sparkles, FileCheck,
  Copy, Check
} from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { useApiQuery } from "@/lib/apiHooks";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const CHECKS: Array<[number, string, string, boolean]> = [
  [1, "Schedule VII Compliance", "Proposed activity falls strictly within MCA Schedule VII permissible categories.", true],
  [2, "Non-Prohibited Activity", "Activity is not a prohibited CSR activity (e.g. political funding, normal business activities).", true],
  [3, "Genuine Verified Need", "Addresses a genuine, verified development need of the local community.", true],
  [4, "No Scheme Duplication", "Does not duplicate existing state or central government welfare schemes.", true],
  [5, "Land & Site Availability", "Required site or land is available, unencumbered, and under valid control.", true],
  [6, "Required Permissions", "Necessary statutory, environmental, or administrative permissions can be obtained.", true],
  [7, "Government Support", "District or departmental government support is confirmed in writing.", true],
  [8, "Budget Adequacy", "Indicative budget is adequate for the proposed scope of work.", true],
  [9, "Realistic Cost Estimate", "Cost breakdown and unit estimates appear realistic and benchmarked.", true],
  [10, "Implementation Capacity", "Implementing agency or corporate team has demonstrated execution capacity.", true],
  [11, "Realistic Timeline", "Proposed execution timeline is realistic and achievable.", true],
  [12, "Post-Completion Ownership", "Post-completion asset ownership and handing-over structure is clear.", true],
  [13, "Maintenance Responsibility", "Long-term operation and maintenance responsibility is explicitly identified.", true]
];

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

  const [copied, setCopied] = useState(false);

  const isRM = useMemo(() => {
    if (isAdmin) return true;
    const tokens = extractRoleTokens(user, roles, roleDetails);
    return tokens.some((t) => {
      const u = t.toUpperCase();
      return u.includes("RELATIONSHIP") || u.includes("RM") || u === "6";
    });
  }, [user, roles, roleDetails, isAdmin]);

  const path = isRM ? `/rm/enquiries/${params.id}` : `/corporate-enquiries/${params.id}`;

  const { data: response, isLoading, refetch } = useApiQuery<any>(
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

  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "feasibility" | "communication" | "js" | "assignments"
  >("overview");

  const [interactionNote, setInteractionNote] = useState("");
  const [interactions, setInteractions] = useState<Array<{ id: string; note: string; occurredAt: string; author: string }>>([
    { id: "1", note: "Initial proposal assignment received from State CSR Cell.", author: "System", occurredAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "2", note: "Verified Corporate Identification Number (CIN) and Schedule VII eligibility on MCA portal.", author: "Relationship Manager", occurredAt: new Date(Date.now() - 43200000).toISOString() }
  ]);

  const formattedBudget = enquiry?.indicativeBudget
    ? Number(enquiry.indicativeBudget) >= 10000000
      ? `₹${(Number(enquiry.indicativeBudget) / 10000000).toFixed(2)} Cr`
      : `₹${(Number(enquiry.indicativeBudget) / 100000).toFixed(2)} Lakhs`
    : "Not specified";

  const nextActionText = useMemo(() => {
    const status = enquiry?.status || "SUBMITTED";
    switch (status) {
      case "SUBMITTED":
      case "ASSIGNED_TO_RM":
        return "Accept Case & Start Review";
      case "UNDER_RM_REVIEW":
        return "Review Documents & Check Duplicates";
      case "FEASIBILITY_IN_PROGRESS":
        return "Complete 13-Factor Feasibility";
      case "READY_FOR_JS_SUBMISSION":
        return "Submit Report to Joint Secretary";
      case "SUBMITTED_TO_JS":
        return "Awaiting Joint Secretary Decision";
      case "JS_APPROVED":
        return "View District & Dept Assignments";
      default:
        return "Review Case Workflows";
    }
  }, [enquiry?.status]);

  const handleNextAction = async () => {
    const status = enquiry?.status || "SUBMITTED";
    if (status === "SUBMITTED" || status === "ASSIGNED_TO_RM") {
      try {
        await apiFetch(`/corporate-enquiries/${params.id}/accept`, { method: "POST" });
        refetch();
      } catch (err) {
        console.warn("Accept call:", err);
      }
      setActiveTab("documents");
    } else if (status === "UNDER_RM_REVIEW") {
      setActiveTab("documents");
    } else if (status === "FEASIBILITY_IN_PROGRESS") {
      setActiveTab("feasibility");
    } else if (status === "READY_FOR_JS_SUBMISSION" || status === "SUBMITTED_TO_JS") {
      setActiveTab("js");
    } else {
      setActiveTab("overview");
    }
  };

  const copyTrackingId = () => {
    const textToCopy = enquiry?.trackingId || params.id;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <GovPortalLayout>
      <div className="mx-auto min-h-screen max-w-screen-2xl space-y-3.5 px-4 py-3 md:px-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/enquiries"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-900 transition-colors no-underline"
          >
            <ArrowLeft size={14} /> Back to Corporate Enquiries Register
          </Link>
          <span className="text-[11px] font-bold text-slate-500">
            SLA Countdown: <strong className="text-amber-700">3 Days Remaining</strong>
          </span>
        </div>

        {/* Compact Portal Light Header Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 p-4.5 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-blue-950 bg-blue-100/80 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {enquiry?.trackingId || "ENQ-MH-2026"}
                  <button onClick={copyTrackingId} className="ml-1 text-blue-700 hover:text-blue-950" title="Copy ID">
                    {copied ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                  </button>
                </span>
                <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900 border border-amber-200">
                  {enquiry?.status ? enquiry.status.replace(/_/g, " ") : "UNDER REVIEW"}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                  CSR Sector: {enquiry?.sector || "Health & Sanitation"}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {enquiry?.corporateName ? enquiry.corporateName : "Corporate Partnership Proposal"}
              </h1>
            </div>

            {/* Next Action Primary Button */}
            <button
              type="button"
              onClick={handleNextAction}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-blue-950 transition-all hover:scale-[1.01]"
            >
              <Sparkles size={15} /> NEXT ACTION: {nextActionText}
            </button>
          </div>
        </div>

        {/* 6 Responsive Wrap Workspace Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-white p-1 rounded-xl shadow-2xs">
          {[
            { id: "overview", label: "Overview & Profile", icon: Layers },
            { id: "documents", label: "Documents & Verification", icon: FileCheck },
            { id: "feasibility", label: "13-Factor Feasibility", icon: ClipboardCheck },
            { id: "communication", label: "Communications & Log", icon: MessageSquare },
            { id: "js", label: "JS Decision & Status", icon: Send },
            { id: "assignments", label: "Assignments & Audit", icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-900" size={28} />
          </div>
        ) : (
          <div className="space-y-3.5">

            {/* 1. OVERVIEW & PROFILE TAB */}
            {activeTab === "overview" && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-3.5">
                  {/* Dense Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Indicative Budget</span>
                      <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{formattedBudget}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">CSR Sector</span>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">{enquiry?.sector || "Health"}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Submission Date</span>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{enquiry?.createdAt ? new Date(enquiry.createdAt).toLocaleDateString("en-IN") : "2026-08-03"}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Current Stage</span>
                      <p className="text-xs font-extrabold text-blue-900 mt-0.5">{enquiry?.status ? enquiry.status.replace(/_/g, " ") : "Under Review"}</p>
                    </div>
                  </div>

                  {/* Corporate Partner Summary Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Building2 size={16} className="text-blue-800" /> Corporate Partner Details
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        ACTIVE ONBOARDED CORPORATE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Company Name</span>
                        <p className="font-extrabold text-slate-900">{enquiry?.corporateName || "Corporate Partner"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">CIN Registration</span>
                        <p className="font-mono font-bold text-blue-900">{enquiry?.cin || "L72200MH2020PLC123456"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</span>
                        <p className="font-bold text-slate-800">{enquiry?.email || "csr@company.com"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                        <p className="font-bold text-slate-800">{enquiry?.phone || "+91 98200 12345"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Submitted Payload Description */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2">Submitted CSR Proposal Description</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{enquiry?.projectDescription || enquiry?.summary || "Official corporate proposal submitted for CSR convergence funding."}</p>
                  </div>
                </div>

                {/* Quick Review Actions Column */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Quick Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab("documents")}
                        className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
                      >
                        <span className="flex items-center gap-2"><FileCheck size={15} className="text-blue-700" /> Review Uploaded Documents</span>
                        <ArrowLeft size={13} className="rotate-180 text-slate-400" />
                      </button>
                      <button
                        onClick={() => setActiveTab("feasibility")}
                        className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
                      >
                        <span className="flex items-center gap-2"><ClipboardCheck size={15} className="text-blue-700" /> Start 13-Factor Feasibility</span>
                        <ArrowLeft size={13} className="rotate-180 text-slate-400" />
                      </button>
                      <button
                        onClick={() => setActiveTab("communication")}
                        className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
                      >
                        <span className="flex items-center gap-2"><MessageSquare size={15} className="text-blue-700" /> Log Call / Interaction</span>
                        <ArrowLeft size={13} className="rotate-180 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DOCUMENTS & VERIFICATION TAB */}
            {activeTab === "documents" && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2">Uploaded Document Review</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">1. Board Resolution / CSR Approval</span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded">VERIFIED</span>
                      </div>
                      <p className="text-slate-500">Official board approval for CSR budget allocation.</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">2. Indicative Budget Breakdown</span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 rounded">PENDING REVIEW</span>
                      </div>
                      <p className="text-slate-500">Itemized line-item expenditure forecast.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert size={15} className="text-amber-600" /> Automated Duplicate Detection
                  </h3>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-bold">
                    ✓ No duplicate proposal detected for this corporate partner in target district database.
                  </div>
                </div>
              </div>
            )}

            {/* 3. FEASIBILITY TAB */}
            {activeTab === "feasibility" && (
              <FeasibilityWorkspace
                enquiryId={params.id}
                existingAssessment={assessment}
                onSubmitted={() => {
                  refetchAssessment();
                  refetch();
                }}
              />
            )}

            {/* 4. COMMUNICATIONS TAB */}
            {activeTab === "communication" && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <MessageSquare size={16} className="text-blue-800" /> Communication & Interaction Log
                </h3>
                <div className="flex gap-2">
                  <input
                    value={interactionNote}
                    onChange={(e) => setInteractionNote(e.target.value)}
                    placeholder="Log a call, meeting, document request, or follow-up note..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={() => {
                      if (!interactionNote.trim()) return;
                      setInteractions((prev) => [
                        { id: String(Date.now()), note: interactionNote, author: "Relationship Manager", occurredAt: new Date().toISOString() },
                        ...prev
                      ]);
                      setInteractionNote("");
                    }}
                    className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition-colors"
                  >
                    Log Note
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {interactions.map((i) => (
                    <div key={i.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-900">{i.author}</span>
                        <span className="font-mono text-[10px]">{new Date(i.occurredAt).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{i.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. JS DECISION TAB */}
            {activeTab === "js" && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Send size={16} className="text-blue-800" /> Joint Secretary Submission Queue
                </h3>
                {assessment?.status === "SUBMITTED_TO_JS" ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-bold">
                    ✓ Feasibility Assessment has been submitted to the Joint Secretary for approval decision.
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
                    Complete the 13-Factor Feasibility Assessment in the Feasibility Tab to submit the report to JS.
                  </div>
                )}
              </div>
            )}

            {/* 6. ASSIGNMENTS & AUDIT TAB */}
            {activeTab === "assignments" && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2">Post-JS Approval District & Dept Assignments</h3>
                  <p className="text-xs text-slate-500">Assignments to District Nodal Consultant (DNC) and Government Department Officer are automatically triggered upon JS approval.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <History size={16} className="text-blue-800" /> Audit Log & History
                  </h3>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">1. Corporate Enquiry Submitted</span>
                    <span className="font-mono text-slate-500">{enquiry?.createdAt ? new Date(enquiry.createdAt).toLocaleString("en-IN") : "2026-08-03"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </GovPortalLayout>
  );
}

function FeasibilityWorkspace({ enquiryId, existingAssessment, onSubmitted }: { enquiryId: string; existingAssessment: any; onSubmitted: () => void }) {
  const [answers, setAnswers] = useState<Record<number, "YES" | "NO" | "NA">>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [departmentId, setDepartmentId] = useState("");
  const [districtText, setDistrictText] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const { data: deptData } = useApiQuery<any>(["departments"], "/admin/organizations");
  const departments = Array.isArray(deptData?.data) ? deptData.data : Array.isArray(deptData) ? deptData : [];

  useEffect(() => {
    if (existingAssessment) {
      setDepartmentId(existingAssessment.targetDepartmentId || "");
      setDistrictText(Array.isArray(existingAssessment.targetDistricts) ? existingAssessment.targetDistricts.join(", ") : "");
      setSummary(existingAssessment.executiveSummary || "");
      if (Array.isArray(existingAssessment.checklist)) {
        const nextAnswers: Record<number, "YES" | "NO" | "NA"> = {};
        const nextNotes: Record<number, string> = {};
        existingAssessment.checklist.forEach((item: any) => {
          if (item.itemNumber) {
            nextAnswers[item.itemNumber] = item.answer;
            nextNotes[item.itemNumber] = item.note || "";
          }
        });
        setAnswers(nextAnswers);
        setNotes(nextNotes);
      }
    }
  }, [existingAssessment]);

  const completed = Object.keys(answers).length;

  const submit = async () => {
    setMessage("");
    if (completed !== CHECKS.length) return setMessage("Answer all 13 checks before submitting to the Joint Secretary.");
    const targetDistricts = districtText.split(",").map(v => v.trim()).filter(Boolean);
    if (!departmentId || !targetDistricts.length) return setMessage("Select the target department and at least one target district for JS routing.");

    setSubmitting(true);
    try {
      const response = await apiFetch<any>(`/rm/enquiries/${enquiryId}/feasibility`, {
        method: "POST",
        body: JSON.stringify({
          executiveSummary: summary,
          targetDepartmentId: departmentId,
          targetDistricts,
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
          <ClipboardCheck size={16} className="text-blue-800" /> 13-Factor Feasibility Assessment Workspace
        </h3>
        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-extrabold text-blue-900">
          {completed}/13 completed
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-bold text-slate-700 space-y-1">
          <span>Target Government Department *</span>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-blue-600"
          >
            <option value="">Select department</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-700 space-y-1">
          <span>Target District(s) *</span>
          <input
            value={districtText}
            onChange={(e) => setDistrictText(e.target.value)}
            placeholder="e.g. Pune, Thane, Nagpur"
            className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-blue-600"
          />
        </label>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {CHECKS.map(([num, title, desc]) => (
          <div key={num} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/70 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900">{num}. {title}</span>
              <div className="flex gap-1">
                {(["YES", "NO", "NA"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAnswers((prev) => ({ ...prev, [num]: a }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all ${
                      answers[num] === a
                        ? a === "YES" ? "bg-emerald-700 text-white shadow-xs" : a === "NO" ? "bg-rose-700 text-white shadow-xs" : "bg-slate-800 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={3}
        placeholder="Executive summary for the Joint Secretary..."
        className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-600"
      />

      <div className="flex justify-between items-center pt-1">
        {message && <p className="text-xs font-bold text-blue-900">{message}</p>}
        <button
          onClick={submit}
          disabled={submitting}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-blue-950 transition-all"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Submit to Joint Secretary
        </button>
      </div>
    </section>
  );
}
