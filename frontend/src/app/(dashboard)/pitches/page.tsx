"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useApiQuery } from "@/lib/apiHooks";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { 
  Compass, Plus, Search, Filter, Landmark, MapPin, Coins, ArrowUpRight, CheckCircle2, Clock
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

const mockPitches: Pitch[] = [
  {
    id: "p-1",
    refNo: "PITCH-2026-042",
    title: "Gadchiroli Tribal Health Sub-Centre Tele-ICU Facilities",
    department: "Public Health Department",
    district: "Gadchiroli",
    outlayLakhs: 250,
    status: "APPROVED",
    submittedDate: "2026-07-22",
  },
  {
    id: "p-2",
    refNo: "PITCH-2026-039",
    title: "Smart Classroom Digital Hardware for Nandurbar Ashram Schools",
    department: "Tribal Development Department",
    district: "Nandurbar",
    outlayLakhs: 180,
    status: "CSR_COMMITTED",
    submittedDate: "2026-07-19",
  },
  {
    id: "p-3",
    refNo: "PITCH-2026-028",
    title: "Solapur Rural Check Dams & Solar RO Drinking Water Plants",
    department: "Water Resources & Sanitation Dept",
    district: "Solapur",
    outlayLakhs: 320,
    status: "SUBMITTED",
    submittedDate: "2026-07-24",
  },
];

export default function PitchesPage() {
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const activeRoles = (roles || []).length > 0 ? roles : (user?.role ? [user.role] : []);
  const isRM = activeRoles.some(r => r.toUpperCase().includes("RELATIONSHIP_MANAGER") || r.toUpperCase().includes("RELATIONSHIP MANAGER"));

  const { data: envelope, isLoading } = useApiQuery<any>(
    ["government-pitches"],
    "/government-pitches"
  );

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const rawPitches = envelope?.data?.pitches || envelope?.data || envelope?.pitches || (Array.isArray(envelope) ? envelope : []);

  const pitchesList: Pitch[] = rawPitches.length > 0 ? rawPitches.map((p: any) => ({
    id: p.id,
    refNo: p.pitchReferenceId || p.refNo || `PITCH-${p.id?.slice(0, 6) || "2026"}`,
    title: p.title || p.projectName || "Government Pitch Proposal",
    department: p.department || "Government Department",
    district: p.district || "Maharashtra District",
    outlayLakhs: p.estimatedOutlay ? Math.round(Number(p.estimatedOutlay) / 100000) : 200,
    status: p.status || "SUBMITTED",
    submittedDate: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "2026-07-24",
  })) : mockPitches;

  const filtered = pitchesList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.refNo.toLowerCase().includes(search.toLowerCase()) ||
                          item.department.toLowerCase().includes(search.toLowerCase()) ||
                          item.district.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-6 md:px-8">
      <GovPageHeader
        title="Government Development Pitches & Proposals"
        eyebrow="Department Pitches"
        actions={
          !isRM ? (
            <Link
              href="/pitches/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={16} /> Create Pitch
            </Link>
          ) : null
        }
      />

      {/* 3D Modern Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard 
          label="Total Pitches" 
          value={pitchesList.length} 
          icon={Compass} 
          index={0} 
          badge="State Pitches" 
          sublabel="State department submissions"
        />
        <StatCard 
          label="Total Outlay Required" 
          value={`₹${(pitchesList.reduce((acc, curr) => acc + curr.outlayLakhs, 0) / 100).toFixed(2)} Cr`} 
          icon={Coins} 
          index={1} 
          badge="Outlay Required" 
          sublabel="Required CSR funding"
        />
        <StatCard 
          label="Secretariat Approved" 
          value={pitchesList.filter(p => p.status === "APPROVED" || p.status === "CSR_COMMITTED").length} 
          icon={CheckCircle2} 
          index={2} 
          badge="Verified & Ready" 
          sublabel="Ready for corporate adoption"
        />
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search title, department, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="CSR_COMMITTED">CSR Committed</option>
              </select>
            </div>

            {!isRM && (
              <Link
                href="/pitches/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <Plus size={16} /> Create Pitch
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group relative rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/40 to-indigo-50/20 p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md font-mono">{item.refNo}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === "APPROVED" || item.status === "CSR_COMMITTED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {item.status}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold"><Landmark size={13} className="text-slate-400" /> {item.department}</span>
                <span className="flex items-center gap-1 font-medium"><MapPin size={13} className="text-blue-600" /> District: {item.district}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Outlay</span>
                  <p className="text-sm font-extrabold text-blue-900 font-heading">₹{item.outlayLakhs} Lakhs</p>
                </div>
                <Link
                  href="/convergence-projects"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-900 transition-colors"
                >
                  View Details <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
