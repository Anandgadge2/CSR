"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getStoredUser } from "@/lib/api";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { Search, Eye, Calendar, Plus } from "lucide-react";

export default function PartnerEnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<string>("CORPORATE_USER");

  useEffect(() => {
    // Get user role from stored user
    const user = getStoredUser();
    if (user?.role) {
      setUserRole(user.role);
    }
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>("/company/enquiries");
      setEnquiries(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load corporate enquiries");
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "PROJECT_ONBOARDED":
      case "EXECUTION_STARTED":
        return "success";
      case "SUBMITTED":
      case "TRACKING_ID_GENERATED":
      case "RM_ASSIGNED":
      case "RM_CONTACTED":
        return "info";
      case "ASSESSMENT_PENDING":
      case "ASSESSMENT_SUBMITTED_TO_JS":
      case "JS_APPROVED":
      case "MOU_PENDING":
      case "MOU_SIGNED":
        return "warning";
      case "JS_REJECTED":
      case "CLOSED":
      default:
        return "muted";
    }
  };

  const filteredEnquiries = enquiries.filter(item => {
    const matchesSearch = 
      (item.proposedCsrWork || item.trackingId || item.sector || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <GovPortalLayout userRole={userRole}>
      <GovPageHeader
        title="My Enquiries"
        description="Corporate partnership enquiries submitted through Partner with Maharashtra"
        breadcrumb="Home / Partner / Enquiries"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
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
              placeholder="Search enquiries by tracking ID, work, sector..."
              className="w-full pl-9 pr-4 py-2 border rounded-md text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none bg-slate-50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => router.push("/partner-with-maharashtra")}
            className="inline-flex h-9 items-center justify-center rounded bg-[#1789d6] hover:bg-[#146fb0] px-4 text-xs font-bold text-white transition-colors gap-2"
          >
            <Plus size={16} />
            Submit New Enquiry
          </button>
        </div>

        {/* Enquiries Table */}
        <GovCard>
          <GovCardBody className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <div>
                  <p className="font-medium text-slate-700">No enquiries found.</p>
                  <p className="text-xs mt-1">Submit a corporate partnership enquiry to get started.</p>
                </div>
                <button
                  onClick={() => router.push("/partner-with-maharashtra")}
                  className="inline-flex h-9 items-center justify-center rounded bg-[#1789d6] hover:bg-[#146fb0] px-4 text-xs font-bold text-white transition-colors gap-2"
                >
                  <Plus size={16} />
                  Submit New Enquiry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left">Tracking ID</th>
                      <th className="px-6 py-3 text-left">Proposed Work</th>
                      <th className="px-6 py-3 text-left">Sector</th>
                      <th className="px-6 py-3 text-left">Budget</th>
                      <th className="px-6 py-3 text-left">Districts</th>
                      <th className="px-6 py-3 text-left">Submission Date</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredEnquiries.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-blue-900">
                          {item.trackingId}
                        </td>
                        <td className="px-6 py-4 text-slate-750 font-medium max-w-[200px] truncate">
                          {item.proposedCsrWork}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold px-2 py-1 rounded">
                            {item.sector.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{Number(item.indicativeBudget || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-[150px] truncate">
                          {item.preferredDistricts?.join(", ") || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <span className="flex items-center gap-1 text-xs">
                            <Calendar size={13} className="text-slate-400" />
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <GovStatusBadge variant={getStatusVariant(item.status)}>
                            {item.status.replace(/_/g, " ")}
                          </GovStatusBadge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => router.push(`/track?id=${item.trackingId}`)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                            title="Track Enquiry"
                          >
                            <Eye size={14} /> Track
                          </button>
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
    </GovPortalLayout>
  );
}
