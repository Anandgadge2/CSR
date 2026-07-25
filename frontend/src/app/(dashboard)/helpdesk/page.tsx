"use client";

import { useState } from "react";
import { HelpCircle, CheckCircle2, Clock, Search, MessageSquare, ShieldCheck } from "lucide-react";
import { GovPageHeader } from "@/components/layout/GovPageHeader";

interface Ticket {
  id: string;
  ticketNo: string;
  subject: string;
  raisedBy: string;
  role: string;
  category: "TECHNICAL" | "ONBOARDING" | "FUND_DISBURSEMENT" | "OTHER";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  date: string;
}

const mockTickets: Ticket[] = [
  {
    id: "t-1",
    ticketNo: "TKT-2026-102",
    subject: "Unable to upload Utilization Certificate PDF on milestone 3",
    raisedBy: "Arogya Seva Trust",
    role: "NGO Admin",
    category: "TECHNICAL",
    status: "OPEN",
    date: "2026-07-24",
  },
  {
    id: "t-2",
    ticketNo: "TKT-2026-098",
    subject: "GSTIN verification retry error during organization registration",
    raisedBy: "Tech Mahindra CSR Desk",
    role: "Company Admin",
    category: "ONBOARDING",
    status: "IN_PROGRESS",
    date: "2026-07-23",
  },
];

export default function HelpdeskPage() {
  const [items, setItems] = useState<Ticket[]>(mockTickets);
  const [search, setSearch] = useState("");

  const handleResolve = (id: string) => {
    setItems(prev => prev.map(t => t.id === id ? { ...t, status: "RESOLVED" } : t));
  };

  const filtered = items.filter(t =>
    t.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.raisedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <GovPageHeader
        title="State CSR Cell Helpdesk & Support Queue"
        description="Manage portal technical queries, onboarding assistance, and support tickets submitted by companies, NGOs, and departments."
        eyebrow="Helpdesk Operations Desk"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Open Tickets</span>
          <p className="mt-2 text-3xl font-extrabold text-amber-950">
            {items.filter(i => i.status === "OPEN").length}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting support response</span>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">In Progress</span>
          <p className="mt-2 text-3xl font-extrabold text-blue-950">
            {items.filter(i => i.status === "IN_PROGRESS").length}
          </p>
          <span className="text-[11px] text-blue-700 font-medium">Under tech cell review</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Resolved Queries</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-950">
            {items.filter(i => i.status === "RESOLVED").length}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Closed support cases</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by ticket no, subject, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3">Ticket No</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Raised By</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-blue-900">{item.ticketNo}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900 max-w-xs">{item.subject}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{item.raisedBy}</p>
                    <p className="text-[10px] text-slate-400">{item.role}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-semibold">{item.category}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
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
                        <CheckCircle2 size={12} /> Resolve Ticket
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[11px]">Closed</span>
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
