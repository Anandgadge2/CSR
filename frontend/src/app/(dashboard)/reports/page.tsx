"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApiQuery } from "@/lib/apiHooks";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { 
  FileText, Download, Filter, Search, CheckCircle2, ShieldCheck, BarChart3, ArrowUpRight, Sparkles, TrendingUp, PieChart, Coins, Activity, Layers, Landmark
} from "lucide-react";

interface ReportItem {
  id: string;
  code: string;
  name: string;
  category: string;
  format: string;
  period: string;
  updatedAt: string;
}

const defaultReports: ReportItem[] = [
  {
    id: "rpt-1",
    code: "RPT-CSR-2026",
    name: "Statewide CSR Fund Utilization Audit Report",
    category: "Financial Audit",
    format: "PDF / Excel",
    period: "FY 2025-26 Q1-Q4",
    updatedAt: "2026-07-24",
  },
  {
    id: "rpt-2",
    code: "RPT-NGO-882",
    name: "Verified Implementing Agency Due Diligence Summary",
    category: "Compliance",
    format: "PDF",
    period: "Annual 2026",
    updatedAt: "2026-07-22",
  },
  {
    id: "rpt-3",
    code: "RPT-MOU-401",
    name: "Tripartite MoU & Tranche Disbursement Register",
    category: "Project Releases",
    format: "Excel / CSV",
    period: "Monthly",
    updatedAt: "2026-07-25",
  },
  {
    id: "rpt-4",
    code: "RPT-DIST-905",
    name: "Aspirational District CSR Investment Breakdown",
    category: "Impact Analytics",
    format: "PDF / Interactive",
    period: "FY 2025-26",
    updatedAt: "2026-07-20",
  },
];

const sectorAnalytics = [
  { sector: "Healthcare & Tele-ICU", allocatedCr: 42.5, utilizedPct: 88, projects: 28, color: "from-blue-600 to-indigo-600" },
  { sector: "Education & Digital Labs", allocatedCr: 36.8, utilizedPct: 94, projects: 34, color: "from-purple-600 to-indigo-600" },
  { sector: "Rural Water & Sanitation", allocatedCr: 28.2, utilizedPct: 91, projects: 19, color: "from-cyan-600 to-blue-600" },
  { sector: "Agriculture & Solar Pumps", allocatedCr: 19.4, utilizedPct: 85, projects: 15, color: "from-emerald-600 to-teal-600" },
  { sector: "Skill Development & Livelihood", allocatedCr: 14.2, utilizedPct: 90, projects: 12, color: "from-amber-600 to-orange-600" },
];

const districtDistribution = [
  { district: "Gadchiroli", sharePct: 32, amountCr: 45.2, status: "Aspirational Focus" },
  { district: "Nandurbar", sharePct: 24, amountCr: 33.9, status: "Tribal Priority" },
  { district: "Solapur", sharePct: 18, amountCr: 25.4, status: "Drought Focus" },
  { district: "Chandrapur", sharePct: 14, amountCr: 19.7, status: "Industrial Belt" },
  { district: "Others (Statewide)", sharePct: 12, amountCr: 16.9, status: "General Projects" },
];

const monthlyTrend = [
  { month: "Jan", amountCr: 12.4 },
  { month: "Feb", amountCr: 16.8 },
  { month: "Mar", amountCr: 24.5 },
  { month: "Apr", amountCr: 21.0 },
  { month: "May", amountCr: 28.6 },
  { month: "Jun", amountCr: 37.8 },
];

export default function ReportsPage() {
  const { data: envelope } = useApiQuery<any>(
    ["reports"],
    "/reports"
  );

  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "REPORTS">("ANALYTICS");

  const apiReports = envelope?.data?.reports || envelope?.data || envelope?.reports || [];
  const reportsList: ReportItem[] = apiReports.length > 0 ? apiReports.map((r: any) => ({
    id: r.id || r.code,
    code: r.code || "RPT-CSR",
    name: r.name || r.title || "CSR Compliance Summary",
    category: r.category || "CSR Compliance",
    format: "PDF / CSV",
    period: "FY 2025-26",
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString().split("T")[0] : "2026-07-25",
  })) : defaultReports;

  const filtered = reportsList.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert("Official compliance report generated & downloaded!");
    }, 1200);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
      <GovPageHeader
        title="CSR Analytical Dashboard & Audit Reports"
        eyebrow="State Governance & Analytics"
        actions={
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              onClick={() => setActiveTab("ANALYTICS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ANALYTICS"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 size={14} /> Analytics & Graphs
            </button>
            <button
              onClick={() => setActiveTab("REPORTS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "REPORTS"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} /> Official Reports ({reportsList.length})
            </button>
          </div>
        }
      />

      {/* 3D KPI Key Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total CSR Committed" 
          value="₹141.1 Cr" 
          icon={Coins} 
          index={0} 
          badge="+24% YoY" 
          sublabel="Outlay Growth"
        />
        <StatCard 
          label="Utilization Rate" 
          value="91.4%" 
          icon={Activity} 
          index={1} 
          badge="Verified" 
          sublabel="Tranche Releases"
        />
        <StatCard 
          label="Aspirational Priority" 
          value="56%" 
          icon={Landmark} 
          index={2} 
          badge="Tribal Focus" 
          sublabel="Tribal Districts Outlay"
        />
        <StatCard 
          label="MCA Compliance" 
          value="100%" 
          icon={Sparkles} 
          index={3} 
          badge="Sec 135 OK" 
          sublabel="Section 135 Compliant"
        />
      </div>

      {activeTab === "ANALYTICS" && (
        <div className="flex flex-col gap-6">
          {/* Top Charts Row: Sector Allocation & District Ring */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Sector Allocation Bar Graph */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-600" /> Sector-Wise CSR Capital Allocation & Utilization
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Budget outlays (₹ Crores) vs verified project utilization rate</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                  FY 2025-26
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {sectorAnalytics.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        {item.sector}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-normal">{item.projects} Projects</span>
                        <span className="font-extrabold text-blue-950">₹{item.allocatedCr} Cr</span>
                        <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {item.utilizedPct}% Utilized
                        </span>
                      </div>
                    </div>
                    {/* 3D Animated Bar */}
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.allocatedCr / 45) * 100}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} shadow-md`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3D District Distribution Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass flex flex-col justify-between"
            >
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <PieChart size={18} className="text-purple-600" /> District Distribution
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">CSR allocation breakdown by district focus</p>
              </div>

              <div className="flex flex-col gap-3">
                {districtDistribution.map((dist, idx) => (
                  <div key={idx} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{dist.district}</h4>
                      <span className="text-[10px] text-purple-700 font-semibold">{dist.status}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-blue-950 font-heading">₹{dist.amountCr} Cr</p>
                      <span className="text-[10px] font-extrabold text-slate-500">{dist.sharePct}% Share</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Graph: 6-Month Disbursement Velocity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-600" /> Monthly Escrow Fund Release Velocity (Jan - Jun 2026)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verified milestone tranche disbursement curve (₹ Crores per Month)</p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                +192% Growth Rate
              </span>
            </div>

            {/* Visual SVG Trend Curve */}
            <div className="relative pt-4 pb-2">
              <div className="grid grid-cols-6 gap-2">
                {monthlyTrend.map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-extrabold text-blue-950 font-heading">₹{t.amountCr} Cr</span>
                    <div className="h-28 w-full bg-slate-100 rounded-xl overflow-hidden flex items-end p-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(t.amountCr / 40) * 100}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="w-full rounded-lg bg-gradient-to-t from-blue-900 via-blue-700 to-indigo-600 shadow-md"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{t.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === "REPORTS" && (
        <div className="rounded-3xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search reports by name, code, or category..."
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
                  <th className="py-3 px-4">Report Code</th>
                  <th className="py-3 px-4">Report Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Coverage</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{rpt.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rpt.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {rpt.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{rpt.period}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownload(rpt.id)}
                        disabled={downloadingId === rpt.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition-all hover:scale-105"
                      >
                        <Download size={13} />
                        {downloadingId === rpt.id ? "Generating..." : "Export Report"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
