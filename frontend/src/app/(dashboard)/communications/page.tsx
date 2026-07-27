"use client";

import { useState } from "react";
import { MessageSquare, Phone, Mail, Calendar, Plus, Search, Building2, User } from "lucide-react";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";

interface CommLog {
  id: string;
  companyOrEntity: string;
  contactPerson: string;
  channel: "MEETING" | "EMAIL" | "CALL";
  summary: string;
  rmName: string;
  date: string;
  followupRequired: boolean;
}

const mockComms: CommLog[] = [
  {
    id: "comm-1",
    companyOrEntity: "Reliance CSR Foundation",
    contactPerson: "Ms. Neha Sharma (Head of CSR)",
    channel: "MEETING",
    summary: "Discussed ₹60 Cr micro-irrigation project in Vidarbha. Expressed strong interest in phase 1 funding.",
    rmName: "Rajesh K. (RM)",
    date: "2026-07-24",
    followupRequired: true,
  },
  {
    id: "comm-2",
    companyOrEntity: "Tata Steel CSR Desk",
    contactPerson: "Shri Aniket Joshi",
    channel: "EMAIL",
    summary: "Sent revised draft MoU template and district priority list for Gadchiroli Health Sub-Centres.",
    rmName: "Rajesh K. (RM)",
    date: "2026-07-23",
    followupRequired: false,
  },
];

export default function CommunicationsPage() {
  const [items, setItems] = useState<CommLog[]>(mockComms);
  const [search, setSearch] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [entity, setEntity] = useState("");
  const [contact, setContact] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [channel, setChannel] = useState<"MEETING" | "EMAIL" | "CALL">("MEETING");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity || !summaryText) return;

    const newLog: CommLog = {
      id: `comm-${Date.now()}`,
      companyOrEntity: entity,
      contactPerson: contact || "Official Representative",
      channel,
      summary: summaryText,
      rmName: "Current RM",
      date: new Date().toISOString().split("T")[0],
      followupRequired: true,
    };

    setItems([newLog, ...items]);
    setShowLogModal(false);
    setEntity("");
    setContact("");
    setSummaryText("");
  };

  const filtered = items.filter(item =>
    item.companyOrEntity.toLowerCase().includes(search.toLowerCase()) ||
    item.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    item.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <GovPageHeader
        title="CSR Relationship Communication Log"
        description="Track all official meetings, call records, email exchanges, and corporate partner follow-ups."
        eyebrow="Relationship Management Desk"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard 
          label="Total Interactions" 
          value={items.length} 
          icon={MessageSquare} 
          index={0} 
          colorTheme="blue" 
          badge="Logged Comms" 
          sublabel="Logged stakeholder comms"
        />
        <StatCard 
          label="Follow-Ups Pending" 
          value={items.filter(i => i.followupRequired).length} 
          icon={Calendar} 
          index={1} 
          colorTheme="amber" 
          badge="Action Items" 
          sublabel="Action items assigned"
        />
        <StatCard 
          label="Meetings Conducted" 
          value={items.filter(i => i.channel === "MEETING").length} 
          icon={Building2} 
          index={2} 
          colorTheme="purple" 
          badge="Meetings" 
          sublabel="In-person & Virtual"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search communication logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus size={16} /> Log New Interaction
          </button>
        </div>

        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5 hover:border-blue-200 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.channel === "MEETING"
                        ? "bg-purple-100 text-purple-800"
                        : item.channel === "CALL"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {item.channel}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{item.date}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 size={16} className="text-blue-600" /> {item.companyOrEntity}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1">
                    <User size={12} className="text-slate-400" /> Contact: {item.contactPerson}
                  </p>
                  <p className="mt-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[11px] text-slate-400 font-medium">RM: {item.rmName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Log Interaction</h3>
            <form onSubmit={handleAddLog} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Foundation"
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Sharma"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="MEETING">In-Person / Virtual Meeting</option>
                  <option value="EMAIL">Email Exchange</option>
                  <option value="CALL">Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Summary & Next Steps</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summary of discussion..."
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
                >
                  Save Communication Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
