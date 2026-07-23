import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function FrameworkPolicyPage() {
  return (
    <StaticPdfSectionPage
      title="Framework & Policy Information"
      eyebrow="Static Part - Public Information"
      description="The State's CSR convergence framework explained simply; benefits to corporates. Marathi & English."
      metrics={[
        { label: "Coverage", value: "36", note: "Districts of Maharashtra" },
        { label: "CSR Basis", value: "Section 135", note: "Companies Act, 2013" },
        { label: "Project Rule", value: "Schedule VII", note: "Eligible CSR themes" },
      ]}
      items={[
        "Single-window red-carpet experience for corporates through a dedicated CSR Relationship Manager.",
        "Government comes to the corporate through time-bound response, online tracking, and standard MoU support.",
        "Two-part portal architecture: public information resources plus a dynamic workflow engine.",
        "Priority is given to genuine development needs, non-duplication of government schemes, clear ownership, and measurable completion evidence.",
      ]}
      sections={[
        {
          title: "Benefits to Corporates",
          items: [
            "One point of contact for enquiries, feasibility, coordination, MoU, and project onboarding.",
            "Guaranteed response times with auto-escalation to Joint Secretary and Planning Secretary.",
            "Transparent public recognition through success stories, gallery records, and CSR awards.",
          ],
        },
        {
          title: "Governance Principles",
          items: [
            "All critical feasibility checks must be resolved before approval.",
            "District Nodal Officer verifies implementation evidence and Utilisation Certificates.",
            "Progress tracking remains deliberately simple: NOT STARTED, IN PROGRESS, COMPLETED.",
          ],
        },
      ]}
      records={[
        {
          title: "Maharashtra CSR Development Snapshot",
          detail: "Public CSR reporting places Maharashtra among India's leading CSR destinations. Portal content should be treated as a coordination dashboard and must be reconciled with official MCA filings and departmental records before publication.",
          meta: "Reference basis: MCA CSR framework, CSR Rules 2014, Schedule VII, and state department validation.",
          tag: "Public reference",
        },
      ]}
    />
  );
}
