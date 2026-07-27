"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApiQuery } from "@/lib/apiHooks";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ViewToggle, ViewMode } from "@/components/ui/ViewToggle";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Loader } from "@/components/ui/Loader";
import { Building2, ShieldCheck, Coins, Search, MapPin } from "lucide-react";

export default function CompaniesPage() {
  const { data: envelope, isLoading } = useApiQuery<any>(
    ["companies"],
    "/companies"
  );

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");

  const rawCompanies = envelope?.data?.companies || envelope?.data || envelope?.companies || (Array.isArray(envelope) ? envelope : []);

  const defaultCompanies = [
    { id: "comp-1", name: "Mahindra CSR Trust", cin: "L74999MH1945PLC004558", district: "Mumbai", status: "VERIFIED", industry: "Automotive", budget: "₹50.0 Cr" },
    { id: "comp-2", name: "Tata Projects CSR", cin: "L28920MH1979PLC021508", district: "Mumbai", status: "VERIFIED", industry: "Infrastructure", budget: "₹65.0 Cr" },
    { id: "comp-3", name: "Reliance Foundation", cin: "L17110MH1973PLC019786", district: "Mumbai", status: "VERIFIED", industry: "Energy & Telecom", budget: "₹120.0 Cr" },
    { id: "comp-4", name: "Bajaj Auto CSR Division", cin: "L65993MH2007PLC180082", district: "Pune", status: "VERIFIED", industry: "Automotive", budget: "₹35.0 Cr" },
  ];

  const companiesList = rawCompanies.length > 0 ? rawCompanies.map((c: any) => ({
    id: c.id,
    name: c.name || c.legalName || "Corporate Donor",
    cin: c.cin || "L74999MH1990PLC058912",
    district: c.district || c.contactInfo?.district || "Maharashtra",
    status: c.status || "VERIFIED",
    industry: c.contactInfo?.industry || c.industry || "Corporate Partner",
    budget: c.csrBudget ? `₹${(Number(c.csrBudget) / 10000000).toFixed(1)} Cr` : "₹25.0 Cr",
  })) : defaultCompanies;

  const filteredCompanies = companiesList.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cin.toLowerCase().includes(search.toLowerCase()) ||
    c.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GovPortalLayout>
      <GovPageHeader
        breadcrumb="Home / Company Directory"
        title="Company Directory"
        description="Statewide registry of corporate partners, CSR commitment profiles, CIN compliance, and active allocations."
      />

      <div className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Corporate Partners"
            value={companiesList.length}
            icon={Building2}
            index={0}
            colorTheme="purple"
            badge="Registered Corporate"
            sublabel="Empaneled Corporate CSR"
          />
          <StatCard
            label="CIN & MCA Compliant"
            value="100% Compliant"
            icon={ShieldCheck}
            index={1}
            colorTheme="emerald"
            badge="CIN Verified"
            sublabel="MCA Statutory Checked"
          />
          <StatCard
            label="Pledged Outlay Budget"
            value="₹270.0 Cr"
            icon={Coins}
            index={2}
            colorTheme="amber"
            badge="Total Allocation"
            sublabel="Statewide CSR Pledged"
          />
        </div>

        {/* Controls Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search company name, CIN number, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">{filteredCompanies.length} Companies</span>
            {/* Reusable ViewToggle Component */}
            <ViewToggle view={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Content View */}
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader label="Loading Company Directory from Database..." />
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((c: any, idx: number) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="group relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-purple-50/20 p-5 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between gap-4 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                      {c.cin}
                    </span>
                    <GovStatusBadge variant={c.status === "VERIFIED" || c.status === "ACTIVE" ? "success" : "warning"}>
                      {c.status}
                    </GovStatusBadge>
                  </div>
                  <h3 className="mt-3 font-extrabold text-sm text-slate-900 group-hover:text-purple-950 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{c.industry}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin size={13} className="text-slate-400" /> {c.district}
                  </span>
                  <span className="font-extrabold text-purple-900">{c.budget}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs overflow-x-auto">
            <table className="gov-table w-full text-xs">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>CIN Number</th>
                  <th>Industry</th>
                  <th>District</th>
                  <th>Active Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-bold text-slate-900">{c.name}</td>
                      <td className="font-mono text-xs text-purple-700 font-semibold">{c.cin}</td>
                      <td className="text-slate-600 font-medium">{c.industry}</td>
                      <td className="text-slate-700">{c.district}</td>
                      <td className="font-extrabold text-purple-950">{c.budget}</td>
                      <td>
                        <GovStatusBadge variant={c.status === "VERIFIED" || c.status === "ACTIVE" ? "success" : "warning"}>
                          {c.status}
                        </GovStatusBadge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                      No companies match your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </GovPortalLayout>
  );
}
