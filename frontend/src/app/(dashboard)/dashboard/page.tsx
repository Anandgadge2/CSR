"use client";

/**
 * Unified dashboard — /dashboard.
 *
 * Single permission-driven entry point that replaces the per-role dashboard
 * pages. The DashboardEngine fetches GET /api/dashboard/summary and renders
 * only the widgets/sections the caller's `dashboard:*` permissions unlock;
 * there are no hardcoded role branches here. Legacy per-role dashboard routes
 * redirect into this page (see the redirect shims added in T6).
 */
import { useEffect, useState } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import MyAssignmentsWidget from "@/components/assignments/MyAssignmentsWidget";
import DashboardEngine from "@/components/dashboard/DashboardEngine";
import { getStoredUser } from "@/lib/api";
import "@/styles/gov-theme.css";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const user = getStoredUser();
    if (user) setUserRole(user.role || "");
  }, []);

  return (
    <GovPortalLayout userRole={userRole}>
      <GovPageHeader
        breadcrumb="Home / Dashboard"
        title="Dashboard"
        description="Your unified view — the cards and sections shown reflect your permissions."
      />

      {/* Permission-driven KPIs, sections, and quick actions. */}
      <DashboardEngine />

      {/* Project assignments (field/nodal officers land here after activation). */}
      <div className="mt-6">
        <MyAssignmentsWidget />
      </div>
    </GovPortalLayout>
  );
}
