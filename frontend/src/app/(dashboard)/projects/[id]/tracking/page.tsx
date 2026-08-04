"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, hasPageAccess, CONVERGENCE_PROJECT_PERMS } from "@/lib/roleAccess";
import {
  Building2, Coins, CheckCircle2, FileText, ArrowLeft, MapPin,
  Calendar, UserCheck, ShieldCheck, FileCheck, ExternalLink, AlertCircle,
  UploadCloud, Save, Eye, Clock, Check, Layers
} from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  workType: string;
  status: string;
  fundsUtilized: number | string;
  geoTaggedPhotoUrls: string[];
  verifiedByNodalOfficerId: string | null;
  verifiedAt: string | null;
  verifiedByNodalOfficer?: { email: string };
  createdAt: string;
  utilizationCertificates?: {
    id: string;
    verificationStatus: string;
    amountUtilized: number | string;
    certificateDocumentUrl: string;
  }[];
}

interface ProjectTracking {
  id: string;
  projectId: string;
  title: string;
  district: string;
  corporateName: string;
  approvedBudget: number | string;
  utilizedAmount: number | string;
  physicalProgressPercent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  mou?: { mouReferenceId: string; status: string; signedAt: string | null };
  milestones?: Milestone[];
  nodalOfficerUser?: { email: string };
}

export default function ProjectTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<ProjectTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressForms, setProgressForms] = useState<Record<string, { status: string; fundsUtilized: string; photoUrl: string; remarks: string }>>({});
  const [ucForms, setUcForms] = useState<Record<string, { certificateDocumentUrl: string; amountUtilized: string; remarks: string; fileName?: string }>>({});
  const [actionMessage, setActionMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ success: boolean; data: ProjectTracking }>(`/convergence-projects/${id}`);
      setProject(res?.data || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (mounted && hasPageAccess(CONVERGENCE_PROJECT_PERMS)) fetchProject();
  }, [mounted, fetchProject]);

  if (!mounted) return null;

  const fmtCurrency = (v: number | string) => {
    const num = Number(v);
    if (isNaN(num) || num === 0) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const currentUser = getCurrentUser();
  const canUpdateProgress = ["IMPLEMENTING_AGENCY_USER", "NGO_ADMIN", "NGO_MEMBER", "DISTRICT_NODAL_OFFICER", "SUPER_ADMIN", "PORTAL_ADMIN", "CSR_ADMIN"].includes(currentUser?.role || "");

  const updateProgressForm = (milestoneId: string, key: "status" | "fundsUtilized" | "photoUrl" | "remarks", value: string) => {
    setProgressForms((prev) => ({
      ...prev,
      [milestoneId]: {
        status: prev[milestoneId]?.status || "IN_PROGRESS",
        fundsUtilized: prev[milestoneId]?.fundsUtilized || "",
        photoUrl: prev[milestoneId]?.photoUrl || "",
        remarks: prev[milestoneId]?.remarks || "",
        [key]: value,
      },
    }));
  };

  const updateUcForm = (milestoneId: string, key: "certificateDocumentUrl" | "amountUtilized" | "remarks" | "fileName", value: string) => {
    setUcForms((prev) => ({
      ...prev,
      [milestoneId]: {
        certificateDocumentUrl: prev[milestoneId]?.certificateDocumentUrl || "",
        amountUtilized: prev[milestoneId]?.amountUtilized || "",
        remarks: prev[milestoneId]?.remarks || "",
        fileName: prev[milestoneId]?.fileName || "",
        [key]: value,
      },
    }));
  };

  const handleFileSelect = (milestoneId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const simulatedUrl = URL.createObjectURL(file);
      updateUcForm(milestoneId, "certificateDocumentUrl", simulatedUrl);
      updateUcForm(milestoneId, "fileName", file.name);
    }
  };

  const submitMilestoneProgress = async (milestone: Milestone) => {
    const form = progressForms[milestone.id];
    if (!form?.status) return;

    setSavingId(`progress-${milestone.id}`);
    setActionMessage("");
    try {
      await apiFetch(`/convergence-projects/${project!.id}/milestones/${milestone.id}/progress`, {
        method: "POST",
        body: JSON.stringify({
          status: form.status,
          fundsUtilized: form.fundsUtilized ? Number(form.fundsUtilized) : undefined,
          geoTaggedPhotoUrls: form.photoUrl ? [form.photoUrl] : undefined,
          remarks: form.remarks || undefined,
        }),
      });
      setActionMessage("Milestone progress updated successfully.");
      await fetchProject();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : "Failed to save milestone progress.");
    } finally {
      setSavingId("");
    }
  };

  const submitUc = async (milestone: Milestone) => {
    const form = ucForms[milestone.id];
    if (!form?.certificateDocumentUrl || !form?.amountUtilized) {
      setActionMessage("UC document and amount utilised are required.");
      return;
    }

    setSavingId(`uc-${milestone.id}`);
    setActionMessage("");
    try {
      await apiFetch(`/convergence-projects/${project!.id}/milestones/${milestone.id}/uc`, {
        method: "POST",
        body: JSON.stringify({
          certificateDocumentUrl: form.certificateDocumentUrl,
          amountUtilized: Number(form.amountUtilized),
          remarks: form.remarks || undefined,
        }),
      });
      setActionMessage("Utilisation Certificate uploaded successfully.");
      await fetchProject();
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : "Failed to upload Utilisation Certificate.");
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return (
      <GovPortalLayout>
        <div className="py-20 flex justify-center">
          <Loader label="Loading Milestone Tracking Details from Database..." />
        </div>
      </GovPortalLayout>
    );
  }

  if (error || !project) {
    return (
      <GovPortalLayout>
        <GovPageHeader breadcrumb="Home / Projects / Milestone Tracking" title="Project Not Found" />
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center max-w-lg mx-auto my-8">
          <AlertCircle className="mx-auto text-rose-600 mb-2" size={40} />
          <h3 className="font-bold text-rose-950 text-base">{error || "Project record not found"}</h3>
          <button
            onClick={() => router.push("/convergence-projects")}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-900 text-white font-bold text-xs shadow-xs hover:bg-rose-950 transition-all"
          >
            <ArrowLeft size={14} /> Back to Projects Register
          </button>
        </div>
      </GovPortalLayout>
    );
  }

  const milestones = project.milestones || [];
  const completedCount = milestones.filter((m) => m.status === "COMPLETED").length;
  const inProgressCount = milestones.filter((m) => m.status === "IN_PROGRESS").length;

  interface LifecycleStepItem {
    label: string;
    description: string;
    date?: string;
    status: "completed" | "active" | "pending";
  }

  const lifecycleSteps: LifecycleStepItem[] = [
    {
      label: "Project Onboarded",
      description: `${project.projectId} created`,
      date: project.createdAt || undefined,
      status: "completed",
    },
  ];
  if (project.mou) {
    lifecycleSteps.push({
      label: "MoU Signed",
      description: `${project.mou.mouReferenceId} — ${project.mou.status}`,
      date: project.mou.signedAt || undefined,
      status: project.mou.status === "ACTIVE" || project.mou.status === "SIGNED" ? "completed" : "active",
    });
  }
  if (milestones.length > 0) {
    lifecycleSteps.push({
      label: `Milestones (${completedCount}/${milestones.length} completed)`,
      description: `${inProgressCount} in progress`,
      status: completedCount === milestones.length ? "completed" : milestones.some((m) => m.status !== "NOT_STARTED") ? "active" : "pending",
    });
  }
  const allUCsVerified = milestones.every((m) => m.utilizationCertificates?.some((uc) => uc.verificationStatus === "VERIFIED"));
  lifecycleSteps.push({
    label: "UC Verification",
    description: allUCsVerified ? "All Utilisation Certificates verified" : "Pending verification",
    status: allUCsVerified ? "completed" : "pending",
  });

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Projects / Milestone Tracking"
        title="Milestone Tracking & UC Upload"
        description={`${project.projectId} — ${project.title}`}
        actions={
          <div className="flex items-center gap-3">
            <GovStatusBadge variant={project.status === "COMPLETED" ? "success" : "info"}>
              {project.status.replace(/_/g, " ")}
            </GovStatusBadge>

            <Link
              href={`/convergence-projects/${project.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
            >
              <Eye size={14} /> View Project Overview
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Progress KPI Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard
            label="Overall Physical Progress"
            value={`${project.physicalProgressPercent}%`}
            icon={FileCheck}
            index={0}
            colorTheme="blue"
            badge="Verified Progress"
            sublabel="Physical Execution"
          />
          <StatCard
            label="Total Approved Budget"
            value={fmtCurrency(project.approvedBudget)}
            icon={Coins}
            index={1}
            colorTheme="amber"
            badge="Pledged Budget"
            sublabel="Project Allocation"
          />
          <StatCard
            label="Amount Utilised"
            value={fmtCurrency(project.utilizedAmount)}
            icon={CheckCircle2}
            index={2}
            colorTheme="emerald"
            badge="Audited Outlay"
            sublabel="Utilised by Agency"
          />
          <StatCard
            label="Milestones Completed"
            value={`${completedCount} / ${milestones.length}`}
            icon={Layers}
            index={3}
            colorTheme="purple"
            badge="Phased Delivery"
            sublabel="Milestone Progress"
          />
        </div>

        {/* Global Action Banner Notification */}
        {actionMessage && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${
            actionMessage.toLowerCase().includes("failed") || actionMessage.toLowerCase().includes("required")
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}>
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage("")} className="text-slate-500 hover:text-slate-900 text-xs underline font-semibold">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-Column: Milestone Progress & Upload Forms */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers size={18} className="text-blue-900" /> Milestone Management & UC Submission
            </h3>

            {milestones.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-xs">
                <FileText className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-xs text-slate-500 font-medium">No milestone phases defined for this project.</p>
              </div>
            ) : (
              milestones.map((m, idx) => (
                <div key={m.id} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
                  {/* Milestone Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          Phase #{idx + 1}
                        </span>
                        <h4 className="font-extrabold text-base text-slate-900">{m.name}</h4>
                      </div>
                      {m.description && <p className="text-xs text-slate-500 font-medium mt-1">{m.description}</p>}
                    </div>
                    <GovStatusBadge variant={m.status === "COMPLETED" ? "success" : m.status === "IN_PROGRESS" ? "info" : "warning"}>
                      {m.status.replace(/_/g, " ")}
                    </GovStatusBadge>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Work Type</span>
                      <span className="font-semibold text-slate-800">{m.workType.replace(/_/g, " ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Funds Utilised</span>
                      <span className="font-bold text-blue-950">{fmtCurrency(m.fundsUtilized)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">UC Status</span>
                      <span className="font-bold text-emerald-700">{m.utilizationCertificates?.[0]?.verificationStatus || "PENDING"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Nodal Verification</span>
                      <span className="font-bold text-slate-700">{m.verifiedAt ? "✓ Verified" : "Pending"}</span>
                    </div>
                  </div>

                  {canUpdateProgress && (
                    <div className="space-y-6 pt-2">
                      {/* Sub-Section 1: Milestone Progress Update */}
                      <div className="space-y-3 bg-slate-50/40 p-4 rounded-xl border border-slate-200/80">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-blue-700" /> Milestone Status & Field Progress
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-slate-500 font-bold block mb-1">Status</label>
                            <select
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                              value={progressForms[m.id]?.status || m.status}
                              onChange={(e) => updateProgressForm(m.id, "status", e.target.value)}
                            >
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-500 font-bold block mb-1">Funds Utilised (₹)</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                              value={progressForms[m.id]?.fundsUtilized || ""}
                              onChange={(e) => updateProgressForm(m.id, "fundsUtilized", e.target.value)}
                              placeholder={String(m.fundsUtilized || 0)}
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 font-bold block mb-1">Geo-Tagged Photo URL</label>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                              value={progressForms[m.id]?.photoUrl || ""}
                              onChange={(e) => updateProgressForm(m.id, "photoUrl", e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 font-bold block text-xs mb-1">Progress Field Notes & Remarks</label>
                          <textarea
                            rows={2}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                            value={progressForms[m.id]?.remarks || ""}
                            onChange={(e) => updateProgressForm(m.id, "remarks", e.target.value)}
                            placeholder="Provide field remarks or milestone execution notes for Nodal Officer review..."
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => submitMilestoneProgress(m)}
                            disabled={savingId === `progress-${m.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                          >
                            <Save size={14} />
                            {savingId === `progress-${m.id}` ? "Saving Progress..." : "Save Progress"}
                          </button>
                        </div>
                      </div>

                      {/* Sub-Section 2: Enhanced Utilisation Certificate (UC) Upload Card */}
                      <div className="space-y-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/30 p-5">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                          <h5 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                            <FileCheck size={16} className="text-indigo-600" /> Utilisation Certificate (UC) Submission
                          </h5>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                            Statutory Audited UC
                          </span>
                        </div>

                        {/* Enhanced Dropzone File Upload Component */}
                        <div className="relative rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-5 text-center hover:border-indigo-400 transition-all cursor-pointer group">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={(e) => handleFileSelect(m.id, e)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <UploadCloud size={32} className="mx-auto text-indigo-600 group-hover:scale-110 transition-transform mb-2" />
                          <p className="text-xs font-bold text-slate-800">
                            {ucForms[m.id]?.fileName ? (
                              <span className="text-emerald-700 font-extrabold">Selected: {ucForms[m.id]?.fileName}</span>
                            ) : (
                              "Click to browse or drop Utilisation Certificate document"
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">Supports PDF, DOCX, PNG, JPG (Max 15MB)</p>
                        </div>

                        {/* Alternative Document URL & Amount Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-slate-600 font-bold block mb-1">Document URL (or Auto-Generated)</label>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-indigo-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                              value={ucForms[m.id]?.certificateDocumentUrl || ""}
                              onChange={(e) => updateUcForm(m.id, "certificateDocumentUrl", e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="text-slate-600 font-bold block mb-1">Amount Utilised in Certificate (₹)</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full rounded-xl border border-indigo-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                              value={ucForms[m.id]?.amountUtilized || ""}
                              onChange={(e) => updateUcForm(m.id, "amountUtilized", e.target.value)}
                              placeholder="Enter amount certified"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-600 font-bold block text-xs mb-1">UC Auditor Remarks</label>
                          <textarea
                            rows={2}
                            className="w-full rounded-xl border border-indigo-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                            value={ucForms[m.id]?.remarks || ""}
                            onChange={(e) => updateUcForm(m.id, "remarks", e.target.value)}
                            placeholder="Chartered Accountant (CA) certification remarks or voucher details..."
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => submitUc(m)}
                            disabled={savingId === `uc-${m.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 hover:from-indigo-950 hover:to-blue-950 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            <UploadCloud size={15} />
                            {savingId === `uc-${m.id}` ? "Uploading Certificate..." : "Upload Utilisation Certificate"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Column: Project Lifecycle Timeline */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-600" /> Project Lifecycle Timeline
            </h3>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
              {lifecycleSteps.map((step, idx) => {
                const isCompleted = step.status === "completed";
                const isActive = step.status === "active";

                return (
                  <div key={idx} className="flex items-start gap-3.5 relative">
                    {idx < lifecycleSteps.length - 1 && (
                      <div className={`absolute left-3.5 top-8 bottom-0 w-0.5 ${isCompleted ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 z-10 ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : isActive
                        ? "bg-blue-100 text-blue-900 border border-blue-300 animate-pulse"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}>
                      {isCompleted ? <Check size={14} /> : idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{step.label}</div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80">
          <button
            onClick={() => router.push("/convergence-projects")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
          >
            ← Back to Projects Register
          </button>
        </div>
      </div>
    </GovPortalLayout>
  );
}
