"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import "../../../styles/gov-theme.css";

export default function AdminUsersRolesPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    apiFetch<any[]>("/admin/users")
      .then((data) => {
        if (data) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const defaultRows = [
    ["ROLE-NGO", "NGO admin and member roles", "System", "Active"],
    ["ROLE-COMPANY", "Company admin and member roles", "System", "Active"],
    ["ROLE-GOV", "Government entity restricted access", "System", "Active"],
  ];

  const userCount = users.length;
  const metrics = [
    { label: "Users", value: loading ? "..." : String(userCount) },
    { label: "Roles", value: "5" },
    { label: "Pending Access", value: "0" },
  ];

  return (
    <GovPortalLayout>
      <GovPageHeader
        title="Users and Roles"
        breadcrumb="Admin / Users & Roles"
        description="Manage platform users, access classes, department accounts, and role-based permissions."
        actions={
          <Link href="/admin/dashboard" passHref legacyBehavior>
            <GovButton variant="primary">
              Admin Dashboard
            </GovButton>
          </Link>
        }
      />

      <div className="gov-container">
        {/* Stats Cards */}
        <div className="gov-grid gov-grid-cols-3 gov-gap-6 gov-mb-6">
          {metrics.map((metric) => (
            <GovCard key={metric.label}>
              <GovCardBody>
                <div className="gov-text-sm gov-text-muted gov-mb-1">{metric.label}</div>
                <div className="gov-text-3xl gov-font-bold gov-text-primary">{metric.value}</div>
              </GovCardBody>
            </GovCard>
          ))}
        </div>

        {/* Roles Queue Card */}
        <GovCard>
          <GovCardHeader>
            <GovCardTitle>Access Classes and Permissions</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 w-full bg-white">
                <div className="w-10 h-10 rounded-full border-4 border-[#12325a] border-t-transparent animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">Loading users and roles data...</span>
              </div>
            ) : users.length > 0 ? (
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>User Email</th>
                      <th>Role Assigned</th>
                      <th>Linked Entity</th>
                      <th className="gov-text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="gov-font-semibold gov-text-primary">{u.email}</td>
                        <td>
                          <span className="gov-badge gov-badge-info">{u.role}</span>
                        </td>
                        <td className="gov-text-muted">
                          {u.ngo?.name || u.company?.name || "System"}
                        </td>
                        <td className="gov-text-right">
                          <GovStatusBadge variant={u.isVerified ? "success" : "warning"}>
                            {u.isVerified ? "Verified" : "Pending"}
                          </GovStatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Role description</th>
                      <th>Owner</th>
                      <th className="gov-text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultRows.map((row, index) => (
                      <tr key={index}>
                        <td className="gov-font-semibold gov-text-primary">{row[0]}</td>
                        <td>{row[1]}</td>
                        <td className="gov-text-muted">{row[2]}</td>
                        <td className="gov-text-right">
                          <GovStatusBadge variant="success">
                            {row[3]}
                          </GovStatusBadge>
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
