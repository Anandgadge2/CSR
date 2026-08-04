"use client";

import { useState } from "react";
import {
  ShieldCheck, FileCheck, CheckCircle2, XCircle, Search, Calendar, Landmark, ArrowUpRight
} from "lucide-react";
import { GovPageHeader } from "@/components/layout/GovPageHeader";

interface DecisionItem {
  id: string;
  refNo: string;
  title: string;
  department: string;
  companyPartner: string;
  outlayCr: number;
  jsRecommendation: "APPROVED" | "CONDITIONAL";
  status: "PENDING_SECRETARY_SIGN_OFF" | "DECISION_EXECUTED" | "RETURNED_FOR_REVISION";
  submittedDate: string;
}

const mockDecisions: DecisionItem[] = [
  {
    id: "dec-1",
    refNo: "MHA-DEC-2026-004",
    title: "Establishment of State AI Skill Hub & Robotics Labs across 10 ITIs",
    department: "Higher & Technical Education Department",
    companyPartner: "Tata Consultancy Services CSR Foundation",
    outlayCr: 45.0,
    jsRecommendation: "APPROVED",
    status: "PENDING_SECRETARY_SIGN_OFF",
    submittedDate: "2026-07-24",
  },
  {
    id: "dec-2",
    refNo: "MHA-DEC-2026-003",
    title: "Solar Energization of 250 Primary Health Sub-Centres",
    department: "Public Health Department",
    companyPartner: "Mahindra & Mahindra CSR",
    outlayCr: 18.5,
    jsRecommendation: "APPROVED",
    status: "DECISION_EXECUTED",
    submittedDate: "2026-07-21",
  },
  {
    id: "dec-3",
    refNo: "MHA-DEC-2026-001",
    title: "Integrated Micro-Irrigation Infrastructure for Vidarbha Cotton Farmers",
    department: "Agriculture & Water Conservation Dept",
    companyPartner: "Reliance Industries CSR Trust",
    outlayCr: 62.0,
    jsRecommendation: "CONDITIONAL",
    status: "PENDING_SECRETARY_SIGN_OFF",
    submittedDate: "2026-07-23",
  },
];

export default function DecisionsPage() {
  const [items, setItems] = useState<DecisionItem[]>(mockDecisions);
  const [search, setSearch] = useState("");

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: "DECISION_EXECUTED" } : item));
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: "RETURNED_FOR_REVISION" } : item));
  };

  const filtered = items.filter(item =>
    item.refNo.toLowerCase().includes(search.toLowerCase()) ||
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <GovPageHeader
        title="Final Policy Decisions & Sign-Off"
        description="Review high-value state CSR convergence proposals recommended by Joint Secretary for executive secretariat sanction."
        eyebrow="Secretariat Executive Workspace"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Pending Sign-Off</span>
          <p className="mt-2 text-3xl font-extrabold text-blue-950">
            {items.filter(i => i.status === "PENDING_SECRETARY_SIGN_OFF").length}
          </p>
          <span className="text-[11px] text-blue-700 font-medium">Awaiting Secretary approval</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Sanctioned Projects</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-950">
            {items.filter(i => i.status === "DECISION_EXECUTED").length}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Final approval recorded</span>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700">Total Sanction Value</span>
          <p className="mt-2 text-3xl font-extrabold text-purple-950">
            ₹{items.reduce((acc, curr) => acc + curr.outlayCr, 0).toFixed(1)} Cr
          </p>
          <span className="text-[11px] text-purple-700 font-medium">State CSR Outlay</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search decision proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5 hover:border-blue-200 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md">{item.refNo}</span>
                    <span className="text-xs text-slate-500 font-semibold">{item.submittedDate}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-slate-900">{item.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium"><Landmark size={14} className="text-slate-400" /> {item.department}</span>
                    <span className="font-semibold text-slate-800">Partner: {item.companyPartner}</span>
                    <span className="font-extrabold text-blue-900">Outlay: ₹{item.outlayCr} Cr</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.status === "PENDING_SECRETARY_SIGN_OFF" ? (
                    <>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={14} /> Return
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Approve & Sign
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                      <FileCheck size={14} /> {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
