"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useApiQuery } from "@/lib/apiHooks";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { 
  Sparkles, Plus, Search, Filter, MapPin, Coins, ArrowUpRight, CheckCircle2, FileText, Landmark
} from "lucide-react";

interface Requirement {
  id: string;
  refId: string;
  title: string;
  category: string;
  district: string;
  estimatedCostLakhs: number;
  status: "SUBMITTED" | "APPROVED" | "PUBLISHED";
  date: string;
}

const mockRequirements: Requirement[] = [
  {
    id: "req-1",
    refId: "REQ-2026-901",
    title: "Solar Power Micro-Grids for 50 Rural Primary Health Sub-Centres",
    category: "Environment & Renewable Energy",
    district: "Gadchiroli",
    estimatedCostLakhs: 200,
    status: "PUBLISHED",
    date: "2026-07-24",
  },
  {
    id: "req-2",
    refId: "REQ-2026-844",
    title: "Primary School Computer Labs & Broadband Setup",
    category: "Education & Digital Literacy",
    district: "Nandurbar",
    estimatedCostLakhs: 140,
    status: "APPROVED",
    date: "2026-07-21",
  },
  {
    id: "req-3",
    refId: "REQ-2026-720",
    title: "Clean Drinking Water Reverse Osmosis Plants in Drought-Prone Villages",
    category: "Water Security & Sanitation",
    district: "Solapur",
    estimatedCostLakhs: 310,
    status: "PUBLISHED",
    date: "2026-07-18",
  },
];

export default function RequirementsPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["csr-requirements"],
    "/csr-requirements"
  );

  const [search, setSearch] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("ALL");

  const rawReqs = envelope?.data?.requirements || envelope?.data || envelope?.requirements || (Array.isArray(envelope) ? envelope : []);

  const reqsList: Requirement[] = rawReqs.length > 0 ? rawReqs.map((r: any) => ({
    id: r.id,
    refId: r.refId || `REQ-${r.id.slice(0, 6)}`,
    title: r.title || r.projectName || "Department CSR Requirement",
    category: r.category || r.sector || "General Healthcare",
    district: r.district || "Maharashtra District",
    estimatedCostLakhs: r.estimatedCost ? Math.round(Number(r.estimatedCost) / 100000) : 150,
    status: r.status || "PUBLISHED",
    date: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "2026-07-24",
  })) : mockRequirements;

  const filtered = reqsList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.refId.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
    const matchesDist = filterDistrict === "ALL" || item.district === filterDistrict;
    return matchesSearch && matchesDist;
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-6 md:px-8">
      <GovPageHeader
        title="Department CSR Requirements & Needs"
        eyebrow="Requirements Hub"
        actions={
          <Link
            href="/requirements/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <Plus size={16} /> Create Requirement
          </Link>
        }
      />

      {/* 3D Modern Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div 
          whileHover={{ y: -4, rotate: 1 }}
          className="rounded-2xl border border-white/60 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 p-6 backdrop-blur-xl shadow-glass"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Total Requirements</span>
            <FileText size={20} className="text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-blue-950 font-heading">{reqsList.length}</p>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 block">Departmental CSR Needs</span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, rotate: -1 }}
          className="rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 p-6 backdrop-blur-xl shadow-glass"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Total Funding Needed</span>
            <Coins size={20} className="text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-950 font-heading">
            ₹{(reqsList.reduce((acc, curr) => acc + curr.estimatedCostLakhs, 0) / 100).toFixed(2)} Cr
          </p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Gap funding requirement</span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, rotate: 1 }}
          className="rounded-2xl border border-white/60 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 p-6 backdrop-blur-xl shadow-glass"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Published Needs</span>
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-950 font-heading">
            {reqsList.filter(r => r.status === "PUBLISHED" || r.status === "APPROVED").length}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Open for CSR pledges</span>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search title, ref ID, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Districts</option>
                <option value="Gadchiroli">Gadchiroli</option>
                <option value="Nandurbar">Nandurbar</option>
                <option value="Solapur">Solapur</option>
              </select>
            </div>

            <Link
              href="/requirements/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={16} /> Create Requirement
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group relative rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/40 to-blue-50/20 p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md font-mono">{item.refId}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === "PUBLISHED" || item.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {item.status}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <MapPin size={13} className="text-blue-600" /> District: {item.district}
              </p>
              <span className="mt-2 inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {item.category}
              </span>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cost Estimate</span>
                  <p className="text-sm font-extrabold text-blue-900 font-heading">₹{item.estimatedCostLakhs} Lakhs</p>
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
