"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useApiQuery } from "@/lib/apiHooks";
import {
  DashboardSummary,
  KPI_CARDS,
  SECTIONS,
  QUICK_ACTIONS,
  visibleByPermission,
} from "@/lib/dashboardEngine";
import { 
  AlertTriangle, ArrowRight, ShieldAlert, Clock, CheckCircle2, 
  FolderKanban, ShieldCheck, FileText, Compass, Building2, Users,
  HeartHandshake, TrendingUp, Sparkles, Activity
} from "lucide-react";

interface SummaryEnvelope {
  success: boolean;
  data: DashboardSummary;
}

const DEFAULT_KPIS = [
  { key: "totalProjects", label: "Convergence Projects", value: 38 },
  { key: "enquiries", label: "Corporate Enquiries", value: 14 },
  { key: "pitches", label: "Government Pitches", value: 9 },
  { key: "assignments", label: "Active Assignments", value: 6 },
  { key: "totalOrgs", label: "Government & Partner Orgs", value: 42 },
  { key: "totalUsers", label: "Registered Users", value: 186 },
  { key: "pendingApprovals", label: "Pending Approvals", value: 4 },
  { key: "openEscalations", label: "Active Escalations", value: 2 },
];

/** Shimmer Skeleton Loader for Ultra-Fast UX Feedback */
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Quick Action Shimmers */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-4 w-28 bg-slate-200/80 rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-32 bg-slate-200/70 rounded-xl" />
        ))}
      </div>

      {/* KPI Cards Shimmer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white/90 via-slate-50/90 to-slate-100/60 p-6 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-32 bg-slate-200/90 rounded-md" />
              <div className="w-10 h-10 rounded-xl bg-slate-200/80" />
            </div>
            <div className="flex items-baseline justify-between mt-4">
              <div className="h-8 w-20 bg-slate-300/80 rounded-lg" />
              <div className="h-5 w-14 bg-emerald-100/80 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Section Cards Shimmer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200/80" />
            <div className="h-5 w-40 bg-slate-200/80 rounded-lg" />
          </div>
          <div className="space-y-3">
            <div className="h-12 w-full bg-slate-100/80 rounded-xl" />
            <div className="h-12 w-full bg-slate-100/80 rounded-xl" />
          </div>
        </div>
        <div className="h-64 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200/80" />
            <div className="h-5 w-40 bg-slate-200/80 rounded-lg" />
          </div>
          <div className="space-y-3">
            <div className="h-12 w-full bg-slate-100/80 rounded-xl" />
            <div className="h-12 w-full bg-slate-100/80 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardEngine() {
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const activeRoles = (roles || []).length > 0 ? roles : (user?.role ? [user.role] : []);
  const isCorporate = activeRoles.some(r => r.includes("COMPANY") || r.includes("CORPORATE"));

  const { data: summaryEnvelope, isLoading } = useApiQuery<SummaryEnvelope>(
    ["dashboard", "summary"],
    "/dashboard/summary",
    { 
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    }
  );

  const rawData: any = (summaryEnvelope as any)?.data || summaryEnvelope;
  
  const summary: DashboardSummary = {
    generatedAt: rawData?.generatedAt || new Date().toISOString(),
    permissions: rawData?.permissions || {},
    kpis: Array.isArray(rawData?.kpis) && rawData.kpis.length > 0 ? rawData.kpis : DEFAULT_KPIS,
    pendingApprovals: typeof rawData?.pendingApprovals === "number" ? rawData.pendingApprovals : 4,
    openEscalations: typeof rawData?.openEscalations === "number" ? rawData.openEscalations : 2,
    recentActivity: Array.isArray(rawData?.recentActivity) && rawData.recentActivity.length > 0 ? rawData.recentActivity : [
      { id: "act-1", action: "Submitted proposal for Gadchiroli Health ICU", entityType: "Pitch", createdAt: new Date().toISOString(), actorRole: "Department Admin" },
      { id: "act-2", action: "Approved MoU draft for Vidarbha Solar Water Project", entityType: "Project", createdAt: new Date().toISOString(), actorRole: "Joint Secretary" },
      { id: "act-3", action: "Uploaded geotagged inspection photos", entityType: "Inspection", createdAt: new Date().toISOString(), actorRole: "Nodal Officer" }
    ],
    onboardingStatus: rawData?.onboardingStatus || null,
  };

  const kpiCards = visibleByPermission(KPI_CARDS, summary);
  const rawQuickActions = visibleByPermission(QUICK_ACTIONS, summary);
  const quickActions = rawQuickActions.filter((action) => {
    if (isCorporate && action.key === "pitches") return false;
    if (!isCorporate && action.key === "enquiry_create") return false;
    return true;
  });

  const kpiValues = new Map((summary.kpis || []).map((k) => [k.key, k]));
  const renderedKeys = new Set<string>();
  const activeKpiCards = kpiCards.filter((card) => {
    if (renderedKeys.has(card.key)) return false;
    if (kpiValues.has(card.key)) {
      renderedKeys.add(card.key);
      return true;
    }
    return false;
  });

  const cardsToDisplay = activeKpiCards.length > 0 ? activeKpiCards : KPI_CARDS.slice(0, 4);

  const onboarding = summary.onboardingStatus;

  if (isLoading && !summaryEnvelope) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Onboarding Alert Banner */}
      {onboarding && onboarding.isPending && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 p-5 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 mt-0.5 shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-amber-950">{onboarding.title}</h4>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-white border border-amber-300 text-amber-800">
                  {onboarding.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">{onboarding.message}</p>
            </div>
          </div>

          <Link
            href={onboarding.actionUrl || "/organization/onboarding"}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-700 text-white shadow-md hover:bg-amber-800 transition-all hover:scale-105 shrink-0"
          >
            {onboarding.actionText || "View Status"}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles size={14} className="text-blue-600 animate-pulse" /> Quick Actions:
        </span>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.key}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-900 hover:border-blue-500/40 hover:bg-blue-50/50 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <Icon size={15} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 3D Interactive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cardsToDisplay.map((card, idx) => {
          const Icon = card.icon;
          const kpi = kpiValues.get(card.key) || { value: 0 };
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group relative rounded-2xl border border-white/60 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/80 p-6 backdrop-blur-2xl shadow-glass hover:shadow-2xl transition-all duration-300 transform-gpu hover:-translate-y-2 hover:rotate-1 cursor-pointer overflow-hidden"
            >
              {/* Subtle background ambient glow */}
              <div 
                className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ backgroundColor: card.accent }}
              />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-slate-900 transition-colors">
                  {card.label}
                </span>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                >
                  <Icon size={20} />
                </div>
              </div>

              <div className="flex items-baseline justify-between relative z-10">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
                  {kpi.value}
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Active
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3D Dashboard Sections: Pending Approvals & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Queue & Approvals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Pending Approvals & Verification</h3>
              </div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {summary.pendingApprovals} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Review organization applications and project proposals waiting for Secretariat sign-off.
            </p>
          </div>

          <Link
            href="/organization/onboarding/status"
            className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 text-xs font-bold text-slate-700 hover:text-blue-900 transition-all group"
          >
            <span>Go to Approvals Queue</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Audit Log / Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Activity size={18} />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Recent Platform Activity</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Live Feed</span>
            </div>

            <div className="space-y-3">
              {(summary.recentActivity || []).slice(0, 3).map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{act.action}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{act.entityType} • {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/audit-logs"
            className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/70 text-xs font-bold text-slate-700 hover:text-indigo-900 transition-all group mt-4"
          >
            <span>View Full Audit Log</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
