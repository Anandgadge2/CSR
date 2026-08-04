"use client";

import { useState } from "react";
import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useApiQuery } from "@/lib/apiHooks";
import { Flag, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Search, Filter, Loader2, Building2 } from "lucide-react";

export default function MilestonesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(["all-milestones"], "/convergence-projects");
  const projects = Array.isArray(envelope?.data) ? envelope.data : Array.isArray(envelope) ? envelope : [];
  const [search, setSearch] = useState("");

  const milestonesList = projects.flatMap((p: any) => {
    const list = Array.isArray(p.milestones) ? p.milestones : [];
    return list.map((m: any) => ({
      ...m,
      projectTitle: p.title || p.name || "CSR Project",
      projectCode: p.projectCode || p.code || p.id?.slice(0, 8),
      district: p.district || "Statewide"
    }));
  });

  const filtered = milestonesList.filter((m: any) => {
    const term = search.toLowerCase();
    return (
      (m.title || "").toLowerCase().includes(term) ||
      (m.projectTitle || "").toLowerCase().includes(term) ||
      (m.projectCode || "").toLowerCase().includes(term)
    );
  });

  return (
    <GovPortalLayout>
      <main className="mx-auto min-h-screen max-w-screen-2xl space-y-4 px-4 py-4 md:px-6">
        <GovPageHeader
          title="Project Milestones & Verification Register"
          eyebrow="Execution Monitoring"
          description="Track milestone deliverables, progress status, field inspection evidence, and fund release triggers across active projects."
        />

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Milestones"
            value={milestonesList.length}
            icon={Flag}
            index={0}
            badge="Milestones Engine"
            sublabel="Configured project targets"
          />
          <StatCard
            label="Completed & Verified"
            value={milestonesList.filter((m: any) => m.status === "COMPLETED" || m.status === "VERIFIED").length}
            icon={CheckCircle2}
            index={1}
            badge="Verified Deliverables"
            sublabel="Verified by inspection team"
          />
          <StatCard
            label="In Progress & Due"
            value={milestonesList.filter((m: any) => m.status !== "COMPLETED" && m.status !== "VERIFIED").length}
            icon={Clock}
            index={2}
            badge="Active Execution"
            sublabel="Pending physical verification"
          />
        </div>

        {/* Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by milestone title, project code, or project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Milestones List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-900" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500 shadow-xs">
            <Flag size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-base font-bold text-slate-800">No project milestones found</p>
            <p className="mt-1 text-xs text-slate-500">Project milestones are automatically tracked when projects are onboarded and assigned.</p>
            <div className="mt-4">
              <Link href="/convergence-projects" className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition-all">
                Browse Convergence Projects <ArrowUpRight size={14} />
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((m: any, idx: number) => (
              <div key={m.id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900">{m.projectCode}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${m.status === "COMPLETED" || m.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                      {m.status || "PENDING"}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-extrabold text-slate-900">{m.title || "Milestone Deliverable"}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">Project: {m.projectTitle} ({m.district})</p>
                </div>
                {m.targetDate && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Target Date: {new Date(m.targetDate).toLocaleDateString("en-IN")}</span>
                    <span>Outlay: ₹{m.amount ? (Number(m.amount) / 100000).toFixed(2) + " Lakh" : "N/A"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </GovPortalLayout>
  );
}
