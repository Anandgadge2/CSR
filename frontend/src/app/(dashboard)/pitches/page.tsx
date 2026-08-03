"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useApiQuery } from "@/lib/apiHooks";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { Loader } from "@/components/ui/Loader";
import { 
  Compass, Plus, Search, Filter, MapPin, Coins, ArrowUpRight, CheckCircle2, Clock, FileText
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Pitch {
  id: string;
  refNo: string;
  title: string;
  department: string;
  district: string;
  outlayLakhs: number;
  status: "SUBMITTED" | "APPROVED" | "VERIFIED" | "CSR_COMMITTED";
  submittedDate: string;
}

export default function PitchesPage() {
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const activeRoles = (roles || []).length > 0 ? roles : (user?.role ? [user.role] : []);
  const isRM = activeRoles.some(r => r.toUpperCase().includes("RELATIONSHIP_MANAGER") || r.toUpperCase().includes("RELATIONSHIP MANAGER"));

  const { data: envelope, isLoading, error: fetchError } = useApiQuery<any>(
    [isRM ? "rm-pitches" : "government-pitches"],
    isRM ? "/rm/pitches" : "/government-pitches"
  );

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const rawPitches: any[] = Array.isArray(envelope)
    ? envelope
    : Array.isArray(envelope?.data)
    ? envelope.data
    : Array.isArray(envelope?.data?.pitches)
    ? envelope.data.pitches
    : Array.isArray(envelope?.pitches)
    ? envelope.pitches
    : [];

  const pitchesList: Pitch[] = rawPitches.map((p: any) => ({
    id: p.id,
    refNo: p.pitchReferenceId || p.refNo || `PITCH-${p.id ? p.id.slice(0, 6) : "2026"}`,
    title: p.title || p.projectName || "Untitled pitch",
    department: p.department || "Not specified",
    district: Array.isArray(p.districts) && p.districts.length ? p.districts.join(", ") : p.district || "Not specified",
    outlayLakhs: p.estimatedOutlay ? Math.round(Number(p.estimatedOutlay) / 100000) : Number(p.budget || p.estimatedCost || 0) / 100000,
    status: p.status || "SUBMITTED",
    submittedDate: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
  }));

  const filtered = pitchesList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.refNo.toLowerCase().includes(search.toLowerCase()) ||
                          item.department.toLowerCase().includes(search.toLowerCase()) ||
                          item.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <GovPortalLayout>
      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col gap-4 px-4 py-4 md:px-6">
        <GovPageHeader
          title="Government Development Pitches & Proposals"
          eyebrow="Department Pitches"
          description="Statewide directory of departmental proposals seeking corporate partner empanelement and CSR funding."
          actions={
            !isRM &&
            <Link
              href="/pitches/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={16} /> Create Pitch Proposal
            </Link>
          }
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard 
            label="Total Submitted Pitches" 
            value={pitchesList.length} 
            icon={Compass} 
            index={0} 
            colorTheme="blue" 
            badge="Gov Proposals" 
            sublabel="Statewide Department Pitches"
          />
          <StatCard 
            label="Total Outlay Required" 
            value={`₹${(pitchesList.reduce((acc, curr) => acc + curr.outlayLakhs, 0) / 100).toFixed(2)} Cr`} 
            icon={Coins} 
            index={1} 
            colorTheme="amber" 
            badge="CSR Budget Need" 
            sublabel="Estimated CSR Outlay"
          />
          <StatCard 
            label="CSR Committed / Approved" 
            value={pitchesList.filter(p => p.status === "APPROVED" || p.status === "CSR_COMMITTED" || p.status === "VERIFIED").length} 
            icon={CheckCircle2} 
            index={2} 
            colorTheme="emerald" 
            badge="Ready for MOU" 
            sublabel="Empaneled with Corporates"
          />
        </div>

        {/* Content Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search title, ref ID, department, or district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="CSR_COMMITTED">CSR Committed</option>
                </select>
              </div>

              {!isRM && <Link
                href="/pitches/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <Plus size={16} /> Create Pitch Proposal
              </Link>}
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader label="Loading Government Pitches from Database..." />
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm font-semibold text-rose-800">
              Unable to load government pitches. Please refresh or try again shortly.
            </div>
          ) : pitchesList.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
              <FileText className="mx-auto text-slate-300 mb-3" size={48} />
              <h3 className="text-base font-bold text-slate-800">No Government Pitches Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are currently no government pitch proposals recorded in the database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="group relative rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/40 to-blue-50/20 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-md font-mono">{item.refNo}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "CSR_COMMITTED" || item.status === "APPROVED" || item.status === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">{item.department}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin size={13} className="text-blue-600" /> District: {item.district}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Outlay</span>
                      <p className="text-sm font-extrabold text-blue-950 font-heading">₹{item.outlayLakhs} Lakhs</p>
                    </div>
                    <Link
                      href={`/pitches/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      {isRM ? "Review Pitch" : "View Pitch"} <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GovPortalLayout>
  );
}
