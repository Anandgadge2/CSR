"use client";
import Link from "next/link";
import { useApiQuery } from "@/lib/apiHooks";
import {
  DashboardSummary,
  KPI_CARDS,
  SECTIONS,
  QUICK_ACTIONS,
  visibleByPermission,
} from "@/lib/dashboardEngine";

interface SummaryEnvelope {
  success: boolean;
  data: DashboardSummary;
}

export default function DashboardEngine() {
  const { data: summaryEnvelope, error, isLoading } = useApiQuery<SummaryEnvelope>(
    ["dashboard", "summary"],
    "/dashboard/summary",
    {
      staleTime: 30 * 1000,
    }
  );

  const rawData: any = (summaryEnvelope as any)?.data || summaryEnvelope;
  const summary: DashboardSummary = {
    generatedAt: rawData?.generatedAt || new Date().toISOString(),
    permissions: rawData?.permissions || {},
    kpis: Array.isArray(rawData?.kpis) ? rawData.kpis : [],
    pendingApprovals: rawData?.pendingApprovals || 0,
    openEscalations: rawData?.openEscalations || 0,
    recentActivity: Array.isArray(rawData?.recentActivity) ? rawData.recentActivity : [],
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, color: "var(--gov-text-muted, #64748b)" }}>
        Loading dashboard…
      </div>
    );
  }

  if (error || !rawData) {
    return (
      <div style={{ padding: 24, color: "#b91c1c" }}>
        {error instanceof Error ? error.message : "No dashboard data available."}
      </div>
    );
  }

  const kpiCards = visibleByPermission(KPI_CARDS, summary);
  const sections = visibleByPermission(SECTIONS, summary).filter((s) =>
    s.hasData(summary)
  );
  const quickActions = visibleByPermission(QUICK_ACTIONS, summary);

  // Map KPI values by key from the (already scoped + permission-filtered) summary.
  const kpiValues = new Map((summary.kpis || []).map((k) => [k.key, k]));

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.key}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                style={{ borderColor: "var(--gov-border, #e2e8f0)" }}
              >
                <Icon size={16} />
                {action.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* KPI cards */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            const kpi = kpiValues.get(card.key);
            if (!kpi) return null;
            return (
              <div
                key={card.key}
                className="rounded-lg border p-4"
                style={{ borderColor: "var(--gov-border, #e2e8f0)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{ fontSize: 11, fontWeight: 700, color: "var(--gov-text-muted, #64748b)" }}
                  >
                    {card.label}
                  </span>
                  <Icon size={18} style={{ color: card.accent }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: card.accent }}>
                  {kpi.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.key}
                className="rounded-lg border p-4"
                style={{ borderColor: "var(--gov-border, #e2e8f0)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} />
                  <h3 className="font-semibold">{section.title}</h3>
                </div>
                <SectionBody sectionKey={section.key} summary={summary} />
              </div>
            );
          })}
        </div>
      )}

      {kpiCards.length === 0 && sections.length === 0 && quickActions.length === 0 && (
        <div style={{ padding: 24, color: "var(--gov-text-muted, #64748b)" }}>
          You don&apos;t have any dashboard widgets enabled yet.
        </div>
      )}
    </div>
  );
}

/** Render the body of a section by key from the summary payload. */
function SectionBody({
  sectionKey,
  summary,
}: {
  sectionKey: string;
  summary: DashboardSummary;
}) {
  if (sectionKey === "approvals") {
    return (
      <div style={{ fontSize: 28, fontWeight: 800, color: "#166534" }}>
        {summary.pendingApprovals ?? 0}
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--gov-text-muted, #64748b)", marginLeft: 8 }}>
          awaiting decision
        </span>
      </div>
    );
  }

  if (sectionKey === "sla") {
    return (
      <div style={{ fontSize: 28, fontWeight: 800, color: "#b91c1c" }}>
        {summary.openEscalations ?? 0}
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--gov-text-muted, #64748b)", marginLeft: 8 }}>
          open escalations
        </span>
      </div>
    );
  }

  if (sectionKey === "activity") {
    const items = summary.recentActivity ?? [];
    return (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="text-sm flex items-center justify-between">
            <span>
              <span className="font-medium">{item.action}</span>
              <span style={{ color: "var(--gov-text-muted, #64748b)" }}> · {item.entityType}</span>
            </span>
            <span style={{ fontSize: 11, color: "var(--gov-text-muted, #64748b)" }}>
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
