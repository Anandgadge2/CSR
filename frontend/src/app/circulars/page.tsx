import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function CircularsPage() {
  return (
    <StaticPdfSectionPage
      title="Circulars"
      eyebrow="Government Resolution and notice desk"
      description="Official notices, circulars, Government Resolutions and portal operating instructions relevant to CSR convergence."
      items={[
        "CSR Rules 2014 and MCA amendment reference notes",
        "Schedule VII eligible activity reference",
        "State GR and departmental circular register",
        "Portal operating instructions and evidence formats",
      ]}
      records={[
        { title: "Portal Operating Circular: Corporate Enquiry SLA", detail: "Relationship Manager response within 5 days, escalation to Joint Secretary for 3 days, then Planning Secretary for 2 days.", meta: "Workflow notice | SLA", tag: "SLA" },
        { title: "Government Pitch Evidence Advisory", detail: "Government officials must attach minimum two geo-tagged site photos and certify government fund non-availability.", meta: "Pitch a Development Need | Validation", tag: "Advisory" },
        { title: "MoU and UC Documentation Advisory", detail: "Standard MoU schedules must capture deliverables, timeline, contribution, ownership, maintenance and UC obligations.", meta: "Project onboarding | Documents", tag: "Format" },
      ]}
      table={{
        columns: ["Category", "Contains", "Public Action"],
        rows: [
          ["Policy Notice", "CSR policy and framework guidance", "View and download"],
          ["Government Resolution", "State GRs and department decisions", "View register"],
          ["Workflow Circular", "Portal process, SLA and escalation guidance", "Read explainer"],
          ["Format", "Checklist, progress report and UC formats", "Open resources"],
        ],
      }}
    />
  );
}
