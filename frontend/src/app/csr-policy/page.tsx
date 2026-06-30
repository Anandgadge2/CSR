import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function CsrPolicyPage() {
  return (
    <StaticPdfSectionPage
      title="CSR Policy"
      eyebrow="Legal and compliance reference"
      description="Plain-language reference for CSR applicability, eligible activities, reporting and portal implementation controls."
      metrics={[
        { label: "Applicability", value: "Section 135", note: "Companies Act, 2013" },
        { label: "CSR Rules", value: "2014", note: "With MCA amendments" },
        { label: "Activity List", value: "Schedule VII", note: "Eligible themes" },
      ]}
      items={[
        "CSR applies to eligible companies meeting the net worth, turnover or net profit thresholds under Section 135.",
        "CSR projects must align to Schedule VII activities and should not be employee-only, political, or normal course of business activity.",
        "Companies should maintain board-approved CSR policy, project approvals, expenditure records, impact evidence and annual reporting.",
        "The portal uses feasibility checks, MoU schedules, milestone evidence and Utilisation Certificates to support transparent compliance.",
      ]}
      table={{
        columns: ["Policy Area", "Portal Implementation"],
        rows: [
          ["Schedule VII alignment", "Captured in feasibility checklist and CSR requirement classification."],
          ["Board and CSR contact", "Captured during company onboarding and corporate enquiry."],
          ["Project monitoring", "Milestones, geo-tagged photo evidence, funds utilised and UC upload."],
          ["Public disclosure", "Completed Projects Gallery, Success Stories, reports and recognition records."],
        ],
      }}
      records={[
        {
          title: "Important note",
          detail: "This portal page is a facilitation reference. Corporate statutory filings and board reporting must continue to follow the Companies Act, MCA rules, MCA portal guidance and company auditor requirements.",
          tag: "Compliance",
        },
      ]}
    />
  );
}
