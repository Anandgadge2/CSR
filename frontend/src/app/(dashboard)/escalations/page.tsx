"use client";

import { useState } from "react";
import { 
  ShieldAlert, Clock, AlertTriangle, CheckCircle2, Filter, Search, ArrowUpRight, UserCheck
} from "lucide-react";
import { GovPageHeader } from "@/components/layout/GovPageHeader";

interface EscalationItem {
  id: string;
  code: string;
  project: string;
  category: string;
  raisedBy: string;
  daysOverdue: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  assignedTo: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
  date: string;
}

const mockEscalations: EscalationItem[] = [
  {
    id: "esc-1",
    code: "ESC-2026-089",
    project: "District Hospital Tele-ICU Expansion - Gadchiroli",
    category: "Fund Release SLA Delay",
    raisedBy: "CSR Relationship Manager",
    daysOverdue: 8,
    severity: "CRITICAL",
    assignedTo: "Joint Secretary (CSR Cell)",
    status: "OPEN",
    date: "2026-07-20",
  },
  {
    id: "esc-2",
    code: "ESC-2026-074",
    project: "Smart Classroom Infrastructure - Nandurbar Tribal Schools",
    category: "Nodal Appointment Overdue",
    raisedBy: "District Collectorate",
    daysOverdue: 5,
    severity: "HIGH",
    assignedTo: "Planning Secretary",
    status: "UNDER_REVIEW",
    date: "2026-07-22",
  },
  {
    id: "esc-3",
    code: "ESC-2026-062",
    project: "Clean Drinking Water RO Plants - Solapur Rural",
    category: "Milestone Deliverable Dispute",
    raisedBy: "Implementing Agency (NGO)",
    daysOverdue: 3,
    severity: "MEDIUM",
    assignedTo: "District Nodal Officer",
    status: "OPEN",
    date: "2026-07-23",
  },
];

export default function EscalationsPage() {
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [items, setItems] = useState<EscalationItem[]>(mockEscalations);

  const handleResolve = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: "RESOLVED" } : item));
  };

  const filtered = items.filter(item => {
    const matchesSearch = item.code.toLowerCase().includes(search.toLowerCase()) || 
                          item.project.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
    const matchesSev = filterSeverity === "ALL" || item.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <GovPageHeader
        title="Escalations & SLA Governance"
        description="Monitor automated SLA alerts, overdue workflow bottlenecks, and secretariat escalations."
        eyebrow="Workflow Operations"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">Critical SLA Breaches</span>
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-red-950">
            {items.filter(i => i.severity === "CRITICAL" && i.status !== "RESOLVED").length}
          </p>
          <span className="text-[11px] text-red-600 font-medium">Requires Secretariat Action within 24h</span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Open Escalations</span>
            <Clock className="text-amber-600" size={20} />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-950">
            {items.filter(i => i.status === "OPEN").length}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Active SLA monitoring</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Resolved Cases</span>
            <CheckCircle2 className="text-emerald-600" size={20} />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-950">
            {items.filter(i => i.status === "RESOLVED").length}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Clear of SLA bottlenecks</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by code, project, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Breaches</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3">Case Code</th>
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">Issue Category</th>
                <th className="px-4 py-3">Overdue</th>
                <th className="px-4 py-3">Assigned Authority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-blue-900">{item.code}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 max-w-xs truncate">{item.project}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.category}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                      <Clock size={12} /> {item.daysOverdue}d SLA
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{item.assignedTo}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.severity === "CRITICAL"
                        ? "bg-red-100 text-red-800 animate-pulse"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {item.status !== "RESOLVED" ? (
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition-colors"
                      >
                        <UserCheck size={12} /> Resolve
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Completed</span>
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
