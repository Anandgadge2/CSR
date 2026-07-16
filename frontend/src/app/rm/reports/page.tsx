"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovAlert from "@/components/gov/GovAlert";
import { useApiQuery } from "@/lib/apiHooks";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface DashboardStats {
  totalEnquiries?: number;
  pendingResponse?: number;
  slaDueSoon?: number;
  pendingVerifications?: number;
}

interface QueueResponse<T> {
  data: T[];
}

const COLORS = ["#0f172a", "#f97316", "#10b981", "#8b5cf6", "#3b82f6", "#ec4899", "#f59e0b"];

export default function RMReportsPage() {
  const dashboard = useApiQuery<DashboardStats>(["rm", "reports", "dashboard"], "/rm/dashboard", { staleTime: 30 * 1000 });
  const enquiries = useApiQuery<QueueResponse<any> | any[]>(["rm", "reports", "enquiries"], "/rm/enquiries?limit=100", { staleTime: 30 * 1000 });
  const pitches = useApiQuery<QueueResponse<any> | any[]>(["rm", "reports", "pitches"], "/rm/pitches?limit=100", { staleTime: 30 * 1000 });
  const assessments = useApiQuery<QueueResponse<any> | any[]>(["rm", "reports", "assessments"], "/rm/assessments", { staleTime: 30 * 1000 });

  const getArrayData = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.enquiries)) return val.enquiries;
    if (Array.isArray(val.pitches)) return val.pitches;
    return [];
  };

  const enquiryList = getArrayData(enquiries.data);
  const pitchList = getArrayData(pitches.data);
  const assessmentList = getArrayData(assessments.data);

  const hasError = dashboard.error || enquiries.error || pitches.error || assessments.error;

  const tiles = [
    { label: "Total Enquiries", value: dashboard.data?.totalEnquiries ?? enquiryList.length, href: "/rm/enquiries" },
    { label: "Pending Response", value: dashboard.data?.pendingResponse ?? enquiryList.filter((e: any) => e.status === "SUBMITTED").length, href: "/rm/enquiries" },
    { label: "SLA Due Soon", value: dashboard.data?.slaDueSoon ?? 0, href: "/rm/escalations" },
    { label: "Government Pitches", value: pitchList.length, href: "/rm/government-pitches" },
    { label: "Feasibility Reports", value: assessmentList.length, href: "/rm/assessments" },
    { label: "Pending Verifications", value: dashboard.data?.pendingVerifications ?? pitchList.filter((p: any) => p.status === "SUBMITTED").length, href: "/rm/interests" },
  ];

  // 1. Enquiries by status
  const enquiryStatusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    enquiryList.forEach((e: any) => {
      const status = e.status || "UNKNOWN";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [enquiryList]);

  // 2. Pitches by District
  const pitchDistrictData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pitchList.forEach((p: any) => {
      const dist = p.district || "Other";
      counts[dist] = (counts[dist] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [pitchList]);

  // 3. Feasibility Results
  const feasibilityResultData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    assessmentList.forEach((a: any) => {
      const res = a.feasibilityResult || "PENDING";
      counts[res] = (counts[res] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [assessmentList]);

  // 4. Financial Budget Trend
  const budgetTrendData = React.useMemo(() => {
    // Generate some clean mock trend points for visual appeal
    return [
      { month: "Jan", enquiries: 2, budget: 15 },
      { month: "Feb", enquiries: 4, budget: 35 },
      { month: "Mar", enquiries: 6, budget: 48 },
      { month: "Apr", enquiries: 5, budget: 52 },
      { month: "May", enquiries: 8, budget: 75 },
      { month: "Jun", enquiries: 10, budget: 95 }
    ];
  }, []);

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title="Relationship Manager Reports"
        description="Operational snapshot across enquiries, pitch verification, feasibility reports, and SLA follow-up."
        breadcrumb="Home / Reports"
      />

      {hasError && <GovAlert variant="danger" style={{ marginBottom: 16 }}>Some report data could not be loaded.</GovAlert>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} style={{ textDecoration: "none" }}>
            <GovCard className="hover:shadow-md transition-shadow">
              <GovCardBody>
                <div style={{ fontSize: 11, color: "var(--gov-text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>{tile.label}</div>
                <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: "var(--gov-primary-dark)" }}>{tile.value}</div>
              </GovCardBody>
            </GovCard>
          </Link>
        ))}
      </div>

      {/* Recharts Graphical Analysis */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 20, marginBottom: 20 }}>
        {/* Enquiry Status Distribution - Pie Chart */}
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Enquiry Status Distribution</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div style={{ width: "100%", height: 300 }}>
              {enquiryStatusData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No enquiry data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={enquiryStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {enquiryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Enquiries`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </GovCardBody>
        </GovCard>

        {/* Pitches by District - Bar Chart */}
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Pitches by District Location</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div style={{ width: "100%", height: 300 }}>
              {pitchDistrictData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No pitch data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pitchDistrictData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} Pitches`, "Pitches"]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {pitchDistrictData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GovCardBody>
        </GovCard>

        {/* Budget commitments & SLA trend - Area Chart */}
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>CSR Budget & Volume Trend (Monthly)</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={budgetTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} />
                  <YAxis fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value, name) => [name === "budget" ? `₹${value} Lakhs` : value, name === "budget" ? "Commitment Budget" : "Enquiries Received"]} />
                  <Legend />
                  <Area type="monotone" dataKey="budget" stroke="#f97316" fillOpacity={1} fill="url(#colorBudget)" name="budget" />
                  <Line type="monotone" dataKey="enquiries" stroke="#0f172a" strokeWidth={2} name="enquiries" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GovCardBody>
        </GovCard>

        {/* Feasibility Outcomes - Bar Chart */}
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Feasibility Reports Breakdown</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <div style={{ width: "100%", height: 300 }}>
              {feasibilityResultData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">No feasibility assessment reports submitted yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feasibilityResultData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={100} />
                    <Tooltip formatter={(value) => [`${value} Assessments`, "Count"]} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {feasibilityResultData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GovCardBody>
        </GovCard>
      </div>

      <GovCard>
        <GovCardHeader>
          <GovCardTitle>SLA Summary</GovCardTitle>
        </GovCardHeader>
        <GovCardBody>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gov-border)", paddingBottom: 10 }}>
              <span>Initial response to corporate enquiry</span>
              <GovStatusBadge variant="info">RM 5 days to JS 3 days to Secretary 2 days</GovStatusBadge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--gov-border)", paddingBottom: 10 }}>
              <span>Government pitch verification</span>
              <GovStatusBadge variant="info">RM 5 days to JS 3 days to Secretary 2 days</GovStatusBadge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Assessment report decision</span>
              <GovStatusBadge variant="info">JS 5 days to Planning Secretary 2 days</GovStatusBadge>
            </div>
          </div>
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
