"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useApiQuery } from "@/lib/apiHooks";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { 
  Building2, Search, Filter, Mail, Coins, ArrowUpRight, ShieldCheck, Clock, CheckCircle2, Plus, Landmark, AlertCircle, Loader2
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";

interface Enquiry {
  id: string;
  trackingId: string;
  companyName: string;
  sector: string;
  indicativeBudgetCr: number | null;
  status: "SUBMITTED" | "UNDER_ASSESSMENT" | "APPROVED" | "ASSIGNED";
  submittedDate: string;
}

export default function EnquiriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const activeRoles = (roles || []).length > 0 ? roles : (user?.role ? [user.role] : []);
  const isRM = activeRoles.some(r => r.toUpperCase().includes("RELATIONSHIP_MANAGER") || r.toUpperCase().includes("RELATIONSHIP MANAGER"));

  const { data: envelope, isLoading, error: fetchError } = useApiQuery<any>(
    [isRM ? "rm-enquiries" : "corporate-enquiries"],
    isRM ? "/rm/enquiries" : "/corporate-enquiries"
  );

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (searchParams.get("action") === "create" && !isRM) {
      router.replace("/enquiries/new");
    }
  }, [searchParams, router, isRM]);

  const rawEnquiries = Array.isArray(envelope?.data?.enquiries)
    ? envelope.data.enquiries
    : Array.isArray(envelope?.data)
    ? envelope.data
    : Array.isArray(envelope?.enquiries)
    ? envelope.enquiries
    : Array.isArray(envelope)
    ? envelope
    : [];

  const items: Enquiry[] = rawEnquiries.map((e: any) => ({
    id: e.id || e.trackingId,
    trackingId: e.trackingId || `ENQ-${e.id?.slice(0, 6) || "2026"}`,
    companyName: e.corporateName || e.companyName || e.company?.name || "Corporate Partner",
    sector: e.sector || "Not specified",
    indicativeBudgetCr: e.indicativeBudget != null ? Number(e.indicativeBudget) / 10000000 : (e.budget != null ? Number(e.budget) : null),
    status: e.status || "SUBMITTED",
    submittedDate: e.createdAt ? new Date(e.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  }));

  const filtered = items.filter(item => {
    const matchesSearch = item.companyName.toLowerCase().includes(search.toLowerCase()) ||
                          item.trackingId.toLowerCase().includes(search.toLowerCase()) ||
                          item.sector.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col gap-4 px-4 py-4 md:px-6">
      {/* Header */}
      <GovPageHeader
        title="Corporate Enquiries & CSR Partnership Register"
        eyebrow="Corporate Desk"
        actions={
          !isRM ? (
            <Link
              href="/enquiries/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={16} /> Submit Corporate Enquiry
            </Link>
          ) : null
        }
      />

      {/* 3D Compact Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard 
          label="Total Enquiries" 
          value={items.length} 
          icon={Building2} 
          index={0} 
          badge="Corporate Desk" 
          sublabel="Received submissions"
        />
        <StatCard 
          label="Indicative Outlay" 
          value={`₹${items.reduce((acc, curr) => acc + (curr.indicativeBudgetCr || 0), 0).toFixed(1)} Cr`}
          icon={Coins} 
          index={1} 
          badge="Pledged Budget" 
          sublabel="Aggregated outlay"
        />
        <StatCard 
          label="Under Review" 
          value={items.filter(e => e.status === "UNDER_ASSESSMENT" || e.status === "SUBMITTED").length} 
          icon={Clock} 
          index={2} 
          badge="Pending Review" 
          sublabel="Active verification queue"
        />
      </div>

      {/* Main Content Register */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company name, tracking ID, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_ASSESSMENT">Under Assessment</option>
              <option value="APPROVED">Approved</option>
              <option value="ASSIGNED">Assigned</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
            <Loader2 size={28} className="animate-spin text-blue-900" />
            <p className="text-xs font-bold">Loading Corporate Enquiries...</p>
          </div>
        ) : fetchError ? (
          <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center text-xs font-bold text-rose-800">
            Failed to load corporate enquiries register.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">
            No corporate enquiries found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs font-medium text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Corporate / Company</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Outlay (₹ Cr)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-950">{item.trackingId}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{item.companyName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{item.sector}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{item.indicativeBudgetCr == null ? "—" : `₹${item.indicativeBudgetCr} Cr`}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        item.status === "APPROVED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        item.status === "UNDER_ASSESSMENT" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                        "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{item.submittedDate}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/enquiries/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-700"
                      >
                        Details <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
