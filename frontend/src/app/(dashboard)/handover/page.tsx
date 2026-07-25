"use client";

import { useState } from "react";
import { CheckCircle2, Shield, Landmark, FileText, Search, Building2, Award } from "lucide-react";
import { GovPageHeader } from "@/components/layout/GovPageHeader";

interface HandoverItem {
  id: string;
  projectName: string;
  department: string;
  donorCompany: string;
  implementingNgo: string;
  assetValueCr: number;
  handoverCertificateStatus: "SIGNED" | "PENDING_DEPARTMENT_SIGNATURE" | "UNDER_AUDIT";
  completionDate: string;
}

const mockHandovers: HandoverItem[] = [
  {
    id: "ho-1",
    projectName: "Gadchiroli Tribal Tele-ICU Facilities & Equipment",
    department: "Public Health Department",
    donorCompany: "Tata Consultancy Services CSR Foundation",
    implementingNgo: "Arogya Seva Trust",
    assetValueCr: 12.4,
    handoverCertificateStatus: "PENDING_DEPARTMENT_SIGNATURE",
    completionDate: "2026-07-20",
  },
  {
    id: "ho-2",
    projectName: "Solapur Solar RO Water Purification Plants (15 Units)",
    department: "Rural Development & Water Supply Dept",
    donorCompany: "Mahindra CSR",
    implementingNgo: "Jal Jeevan Foundation",
    assetValueCr: 4.8,
    handoverCertificateStatus: "SIGNED",
    completionDate: "2026-06-15",
  },
];

export default function HandoverPage() {
  const [items, setItems] = useState<HandoverItem[]>(mockHandovers);
  const [search, setSearch] = useState("");

  const handleSignCertificate = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, handoverCertificateStatus: "SIGNED" } : item));
  };

  const filtered = items.filter(item =>
    item.projectName.toLowerCase().includes(search.toLowerCase()) ||
    item.department.toLowerCase().includes(search.toLowerCase()) ||
    item.donorCompany.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <GovPageHeader
        title="CSR Project Handover & Asset Transfer"
        description="Formal sign-off and transfer of completed CSR infrastructure assets into State Government Department operational custody."
        eyebrow="Asset Transfer Desk"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">Pending Department Sign-Off</span>
          <p className="mt-2 text-3xl font-extrabold text-amber-950">
            {items.filter(i => i.handoverCertificateStatus === "PENDING_DEPARTMENT_SIGNATURE").length}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Completed assets ready for takeover</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Transferred Assets</span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-950">
            {items.filter(i => i.handoverCertificateStatus === "SIGNED").length}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Handover certificate executed</span>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5 backdrop-blur-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">Total Transferred Asset Value</span>
          <p className="mt-2 text-3xl font-extrabold text-blue-950">
            ₹{items.reduce((acc, curr) => acc + curr.assetValueCr, 0).toFixed(1)} Cr
          </p>
          <span className="text-[11px] text-blue-700 font-medium">Public infrastructure value</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by project, department, or company..."
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
                <th className="px-4 py-3">Completed CSR Project</th>
                <th className="px-4 py-3">Recipient Department</th>
                <th className="px-4 py-3">Donor & Implementer</th>
                <th className="px-4 py-3">Asset Outlay</th>
                <th className="px-4 py-3">Handover Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900 max-w-xs">{item.projectName}</td>
                  <td className="px-4 py-3.5 text-slate-700">{item.department}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{item.donorCompany}</p>
                    <p className="text-[10px] text-slate-400">NGO: {item.implementingNgo}</p>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-blue-900">₹{item.assetValueCr} Cr</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.handoverCertificateStatus === "SIGNED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {item.handoverCertificateStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {item.handoverCertificateStatus !== "SIGNED" ? (
                      <button
                        onClick={() => handleSignCertificate(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition-colors"
                      >
                        <CheckCircle2 size={12} /> Sign Handover Doc
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                        <Award size={12} /> Transferred
                      </span>
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
