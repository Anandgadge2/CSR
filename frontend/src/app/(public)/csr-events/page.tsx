import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function CsrEventsPage() {
  return (
    <StaticPdfSectionPage
      title="CSR Summits & Events"
      eyebrow="Engagement calendar"
      description="Past summit reports and videos; upcoming events; registration links."
      items={["State CSR Convergence Summit", "District CSR clinics", "Corporate roundtables", "Recognition ceremonies"]}
      records={[
        { title: "State CSR Convergence Summit 2026", detail: "Policy, Schedule VII alignment, MoU standardisation, and milestone evidence sessions for corporate CSR teams.", meta: "Mumbai | Proposed: August 2026", tag: "Upcoming" },
        { title: "District Development Need Pitch Clinics", detail: "Hands-on sessions for government officials to prepare 200-word CSR requirements, cost estimates, declarations, and geo-tagged site evidence.", meta: "Divisional rollout | Quarterly", tag: "Registration" },
        { title: "Corporate Partner Recognition Day", detail: "Recognition of corporate partners whose completed projects are published in the gallery with verified beneficiaries and UC status.", meta: "Pune | Annual", tag: "Awards" },
      ]}
    />
  );
}
