"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, UserPlus, Shield, Building2, Search, CheckCircle2, Lock, Mail, Key,
  Copy, Check, AlertCircle, Sparkles, ShieldCheck, UserCheck, RefreshCw
} from "lucide-react";
import { GovPageHeader } from "@/components/layout/GovPageHeader";

interface AgencySubLogin {
  id: string;
  ngoName: string;
  darpanId: string;
  email: string;
  contactPerson: string;
  phone: string;
  assignedProject: string;
  roleScope: string;
  status: "ACTIVE" | "INVITE_SENT" | "SUSPENDED";
  createdDate: string;
}

const mockSubLogins: AgencySubLogin[] = [
  {
    id: "sub-1",
    ngoName: "Arogya Seva Foundation",
    darpanId: "MH/2022/0319482",
    email: "contact@arogyaseva.org",
    contactPerson: "Dr. Suresh Patil",
    phone: "+91 98230 11223",
    assignedProject: "Gadchiroli Tele-ICU Facilities Project",
    roleScope: "Assigned Project Manager",
    status: "ACTIVE",
    createdDate: "2026-07-15",
  },
  {
    id: "sub-2",
    ngoName: "Jal Jeevan Gramin Sanstha",
    darpanId: "MH/2021/0284719",
    email: "projects@jaljeevan.org",
    contactPerson: "Shri Aniket Deshmukh",
    phone: "+91 94221 88392",
    assignedProject: "Solapur Rural Solar RO Water Plants",
    roleScope: "Assigned Project Manager",
    status: "ACTIVE",
    createdDate: "2026-07-20",
  },
  {
    id: "sub-3",
    ngoName: "Vidarbha Krishi Shikshan Trust",
    darpanId: "MH/2023/0401928",
    email: "info@vidarbhakrishi.org",
    contactPerson: "Ms. Sunita Jadhav",
    phone: "+91 98901 44210",
    assignedProject: "Vidarbha Cotton Farmer Micro-Irrigation",
    roleScope: "Assigned Project Manager",
    status: "INVITE_SENT",
    createdDate: "2026-07-24",
  },
];

export default function AgencySubLoginsPage() {
  const [items, setItems] = useState<AgencySubLogin[]>(mockSubLogins);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [ngoName, setNgoName] = useState("");
  const [darpanId, setDarpanId] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [assignedProject, setAssignedProject] = useState("");
  const [roleScope, setRoleScope] = useState("Assigned Project Manager");

  const handleCreateSubLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngoName || !email) return;

    const newSub: AgencySubLogin = {
      id: `sub-${Date.now()}`,
      ngoName,
      darpanId: darpanId || "MH/2026/PENDING",
      email,
      contactPerson: contactPerson || "Authorized Representative",
      phone: phone || "+91 90000 00000",
      assignedProject: assignedProject || "State CSR Partnership Project",
      roleScope: "Assigned Project Manager",
      status: "INVITE_SENT",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setItems([newSub, ...items]);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNgoName("");
    setDarpanId("");
    setEmail("");
    setContactPerson("");
    setPhone("");
    setAssignedProject("");
    setRoleScope("Assigned Project Manager");
  };

  const handleCopyInvite = (id: string) => {
    setCopiedId(id);
    navigator.clipboard?.writeText(`https://mahacsr.gov.in/register/invited?subId=${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? {
      ...item,
      status: item.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
    } : item));
  };

  const filtered = items.filter(item =>
    item.ngoName.toLowerCase().includes(search.toLowerCase()) ||
    item.darpanId.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase()) ||
    item.assignedProject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-6 md:px-8">
      <GovPageHeader
        title="Implementing Agency Sub-Logins & Access Authority"
        eyebrow="Corporate Admin"
      />

      {/* 3D KPI Metrics Bar */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <motion.div 
          whileHover={{ y: -4, rotate: 1 }}
          className="rounded-2xl border border-white/60 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 p-6 backdrop-blur-xl shadow-glass"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Active Agency Sub-Logins</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-blue-950 font-heading">
            {items.filter(i => i.status === "ACTIVE").length}
          </p>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 block">Active implementing partners</span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, rotate: -1 }}
          className="rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 p-6 backdrop-blur-xl shadow-glass"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Pending Magic Invites</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Mail size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-950 font-heading">
            {items.filter(i => i.status === "INVITE_SENT").length}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Credentials dispatched to NGO</span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, rotate: 1 }}
          className="rounded-2xl border border-white/60 bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 p-6 backdrop-blur-xl shadow-glass"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700">Assigned CSR Outlay</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-purple-950 font-heading">3 Partner NGOs</p>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">Audited access control</span>
        </motion.div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-white/80 bg-white/90 backdrop-blur-2xl p-6 shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search NGO name, Darpan ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <UserPlus size={16} /> Create Agency Sub-Login
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3.5">NGO / Implementing Agency</th>
                <th className="px-4 py-3.5">Authorized Contact</th>
                <th className="px-4 py-3.5">Assigned CSR Project</th>
                <th className="px-4 py-3.5">Sub-Login Scope</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-900 text-sm">{item.ngoName}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">NGO Darpan: {item.darpanId}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{item.contactPerson}</p>
                    <p className="text-[11px] text-blue-700">{item.email}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700 font-semibold max-w-xs">{item.assignedProject}</td>
                  <td className="px-4 py-4">
                    <span className="bg-indigo-50 text-indigo-800 border border-indigo-100 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      {item.roleScope}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "INVITE_SENT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleCopyInvite(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      title="Copy Magic Login Link"
                    >
                      {copiedId === item.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      {copiedId === item.id ? "Copied" : "Magic Link"}
                    </button>

                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                        item.status === "SUSPENDED"
                          ? "bg-emerald-900 text-white hover:bg-emerald-800"
                          : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      }`}
                    >
                      <Lock size={12} />
                      {item.status === "SUSPENDED" ? "Activate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-white/20"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Authorize Agency Sub-Login</h3>
                <p className="text-xs text-slate-500">Create access credentials for NGO partner</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
            </div>

            <form onSubmit={handleCreateSubLogin} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Implementing Agency / NGO Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arogya Seva Foundation"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NGO Darpan ID</label>
                  <input
                    type="text"
                    placeholder="MH/2026/XXXXX"
                    value={darpanId}
                    onChange={(e) => setDarpanId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official NGO Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="ngo@domain.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Suresh Patil"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98230 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned CSR Project *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gadchiroli Hospital Tele-ICU Expansion"
                  value={assignedProject}
                  onChange={(e) => setAssignedProject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scope & Access Permissions</label>
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-950 flex items-start gap-2.5 shadow-sm">
                  <ShieldCheck size={18} className="text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Unified Assigned Project Access</p>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                      Implementing agencies can access only their explicitly assigned projects to update milestones, submit fund requests, upload Utilization Certificates (UCs), and post field status reports.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-5 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-md"
                >
                  Generate Credentials & Send Invite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
