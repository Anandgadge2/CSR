import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function ResourcesPage() {
  return (
    <StaticPdfSectionPage
      title="Resources"
      eyebrow="Formats and operating references"
      description="Download-ready portal resources for corporates, government officials, Relationship Managers, Nodal Officers and implementing agencies."
      metrics={[
        { label: "Form Packs", value: "6", note: "Corporate, pitch, MoU, UC, grievance, report" },
        { label: "Evidence", value: "Geo-tagged", note: "Photos against milestones" },
        { label: "Helpdesk", value: "2 days", note: "Static query response" },
      ]}
      items={[
        "Corporate Enquiry Form field guide",
        "Government Pitch Form field guide",
        "I am Interested pop-up form checklist",
        "Assessment Report and 13-Point Feasibility Checklist",
        "Standard MoU Template and Schedule I/II notes",
        "Milestone, UC, M&E and grievance evidence guide",
      ]}
      table={{
        columns: ["Resource", "Who uses it", "When"],
        rows: [
          ["Corporate Enquiry Checklist", "Corporate Partner", "Before submitting Partner with Maharashtra form"],
          ["Government Pitch Checklist", "Government Official", "Before publishing a development need"],
          ["Assessment Report", "CSR Relationship Manager", "Before JS decision"],
          ["MoU Schedules", "Corporate, Nodal Officer, Implementing Agency", "Before project onboarding"],
          ["UC Evidence Guide", "Implementing Agency and District Nodal Officer", "During milestone completion and verification"],
        ],
      }}
    />
  );
}
