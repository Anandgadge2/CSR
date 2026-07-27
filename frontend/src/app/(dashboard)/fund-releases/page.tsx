"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApiQuery } from "@/lib/apiHooks";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { 
  Coins, Search, Filter, ShieldCheck, CheckCircle2, Clock, Landmark, ArrowUpRight, Check
} from "lucide-react";

interface FundReleaseItem {
  id: string;
  projectName: string;
  district: string;
  tranche: string;
  approvedBudgetCr: number;
  releaseAmountCr: number;
  status: "APPROVED" | "VERIFIED_READY" | "DISBURSED";
  verifiedDate: string;
}

const defaultReleases: FundReleaseItem[] = [
  {
    id: "rel-1",
    projectName: "Gadchiroli Tribal Solar Micro-Grids Phase I",
    district: "Gadchiroli",
    tranche: "Tranche 1 (40%)",
    approvedBudgetCr: 12.5,
    releaseAmountCr: 5.0,
    status: "VERIFIED_READY",
    verifiedDate: "2026-07-24",
  },
  {
    id: "rel-2",
    projectName: "Vidarbha Tele-ICU & Mobile Health Vans",
    district: "Chandrapur",
    tranche: "Tranche 2 (30%)",
    approvedBudgetCr: 18.0,
    releaseAmountCr: 5.4,
    status: "APPROVED",
    verifiedDate: "2026-07-22",
  },
  {
    id: "rel-3",
    projectName: "Nandurbar Smart Secondary School Labs",
    district: "Nandurbar",
    tranche: "Final Tranche (30%)",
    approvedBudgetCr: 8.4,
    releaseAmountCr: 2.52,
    status: "DISBURSED",
    verifiedDate: "2026-07-20",
  },
];

export default function FundReleasesPage() {
  const { data: envelope } = useApiQuery<any>(
    ["fund-releases"],
    "/convergence-projects"
  );

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<FundReleaseItem[]>(defaultReleases);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const handleApproveRelease = (id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setItems(items.map(item => item.id === id ? { ...item, status: "DISBURSED" } : item));
      setApprovingId(null);
    }, 1000);
  };

  const filtered = items.filter(r =>
    r.projectName.toLowerCase().includes(search.toLowerCase()) ||
    r.district.toLowerCase().includes(search.toLowerCase()) ||
    r.tranche.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-6 md:px-8">
      <GovPageHeader
        title="Escrow Fund Release Queue & Milestone Tranches"
        eyebrow="Financial Governance"
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard 
          label="Total Pending Tranches" 
          value={items.filter(i => i.status !== "DISBURSED").length} 
          icon={Coins} 
          index={0} 
          badge="Escrow Tranches" 
          sublabel="Pending disbursement"
        />
        <StatCard 
          label="Disbursement Ready" 
          value={`₹${items.reduce((acc, curr) => acc + (curr.status === "VERIFIED_READY" ? curr.releaseAmountCr : 0), 0).toFixed(2)} Cr`} 
          icon={Landmark} 
          index={1} 
          badge="Verified Ready" 
          sublabel="Ready for transfer"
        />
        <StatCard 
          label="Verified Disbursed" 
          value={`${items.filter(i => i.status === "DISBURSED").length} Tranches`} 
          icon={CheckCircle2} 
          index={2} 
          badge="Transfer Complete" 
          sublabel="Disbursed to project"
        />
      </div>

      {/* Main Content Area */}
      <div className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by project name, district, or tranche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Milestone Tranche</th>
                <th className="py-3 px-4">Release Outlay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.projectName}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{r.district}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-900">{r.tranche}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-blue-950">₹{r.releaseAmountCr} Cr</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "DISBURSED"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "VERIFIED_READY"
                        ? "bg-blue-100 text-blue-800 font-extrabold"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.status === "DISBURSED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <Check size={14} /> Disbursed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveRelease(r.id)}
                        disabled={approvingId === r.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-105"
                      >
                        <ShieldCheck size={13} />
                        {approvingId === r.id ? "Authorizing..." : "Authorize Release"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
