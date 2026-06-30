"use client";

import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import { Construction } from "lucide-react";

export default function JSReportsPage() {
  return (
    <GovPortalLayout userRole="JOINT_SECRETARY">
      <GovPageHeader
        title="Reports"
        description="Generate and download reports"
        breadcrumb="Home / Reports"
      />
      
      <GovCard>
        <GovCardBody style={{ padding: 60, textAlign: "center" }}>
          <Construction size={64} style={{ marginBottom: 24, opacity: 0.5, color: "var(--gov-text-muted)" }} />
          <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, color: "var(--gov-text)" }}>
            Reports Coming Soon
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--gov-text-secondary)", maxWidth: 500 }}>
            This page is under development.
          </p>
          <Link href="/js/dashboard">
            <GovButton variant="primary">Go to Dashboard</GovButton>
          </Link>
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
