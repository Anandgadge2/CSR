"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovInput from "@/components/gov/GovInput";
import { Search, Eye, Calendar, Plus } from "lucide-react";

export default function MyPitchesPage() {
  const router = useRouter();
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<any>("/government-pitches/my");
      setPitches(response.data || response || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load government pitches");
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "JS_APPROVED":
      case "PUBLIC_LISTED":
      case "CORPORATE_INTEREST_RECEIVED":
      case "COMPLETED":
        return "success";
      case "SUBMITTED":
        return "info";
      case "RM_VERIFICATION_PENDING":
      case "JS_APPROVAL_PENDING":
      case "NODAL_OFFICER_ASSIGNED":
      case "MOU_PENDING":
      case "MOU_SIGNED":
      case "PROJECT_ONBOARDED":
        return "warning";
      case "DRAFT":
      case "CLOSED":
      default:
        return "muted";
    }
  };

  const filteredPitches = pitches.filter(item => {
    const matchesSearch = 
      (item.pitchReferenceId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.csrRequirement || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-xl font-bold font-heading text-blue-950">My Pitches</h1>
          <p className="text-xs text-slate-500">Track and manage your department's submitted district development needs.</p>
        </div>
        <GovButton
          onClick={() => router.push("/department/pitches/create")}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Pitch a New Need
        </GovButton>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Search bar */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search pitches..."
            className="w-full pl-9 pr-4 py-2 border rounded-md text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none bg-slate-50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Pitches Table */}
      <GovCard>
        <GovCardBody className="p-0">
          {filteredPitches.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-medium text-slate-700">No pitches submitted yet.</p>
              <p className="text-xs mt-1">Submit a district development need to request CSR sponsorship.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Pitch ID</th>
                    <th className="px-6 py-3 text-left">District</th>
                    <th className="px-6 py-3 text-left">Estimated Cost</th>
                    <th className="px-6 py-3 text-left">Requirement Description</th>
                    <th className="px-6 py-3 text-left">Submission Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPitches.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {item.pitchReferenceId}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.district}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#14274e]">
                        ₹{Number(item.estimatedCost || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-[280px] truncate">
                        {item.csrRequirement}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <GovStatusBadge variant={getStatusVariant(item.status)}>
                          {item.status.replace(/_/g, " ")}
                        </GovStatusBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <GovButton
                          onClick={() => router.push(`/track?id=${item.pitchReferenceId}`)}
                          variant="secondary"
                          className="p-1.5 flex items-center justify-center rounded-md text-xs shrink-0"
                          title="Track Status"
                        >
                          <Eye size={14} />
                        </GovButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GovCardBody>
      </GovCard>
    </div>
  );
}
