import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function ConvergencePage() {
  return (
    <StaticPdfSectionPage
      title="Convergence Framework"
      eyebrow="Government-corporate project model"
      description="How government needs, corporate CSR interest, Relationship Manager coordination, District Nodal Officer verification and public tracking converge into one project flow."
      metrics={[
        { label: "Entry Points", value: "2", note: "Corporate and government" },
        { label: "Common Flow", value: "MoU + Project ID", note: "After approval" },
        { label: "Tracking", value: "3 statuses", note: "NOT STARTED, IN PROGRESS, COMPLETED" },
      ]}
      items={[
        "Corporate entry: Partner with Maharashtra -> Unique Tracking ID -> CSR Relationship Manager -> Assessment Report -> JS decision.",
        "Government entry: Pitch a Development Need -> Relationship Manager verification -> JS approval -> Public Development Needs (Live).",
        "Common project flow: District Nodal Officer dialogue, standard MoU, deliverables, timeline, Project ID and milestone tracking.",
        "Closure flow: UC upload, District Nodal Officer certification, public completion record and recognition.",
      ]}
      sections={[
        {
          title: "Roles",
          items: [
            "CSR Relationship Manager is the single point of contact for corporate confidence and coordination.",
            "Joint Secretary decides on assessment reports and approves government pitch publication.",
            "District Nodal Officer anchors local development need, field verification, UC certification and grievances.",
          ],
        },
        {
          title: "Controls",
          items: [
            "Government fund non-availability declaration for government pitches.",
            "Critical feasibility checks on mandate, need, site support and sustainability.",
            "Auto-escalation if response timelines are breached.",
          ],
        },
      ]}
    />
  );
}
