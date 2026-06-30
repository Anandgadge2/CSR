import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function DirectoryPage() {
  return (
    <StaticPdfSectionPage
      title="Directory"
      eyebrow="Public contact directory"
      description="Contact details of the State CSR Cell, the CSR Relationship Managers, and all District Nodal Officers."
      metrics={[
        { label: "State Cell", value: "1", note: "CSR coordination desk" },
        { label: "Districts", value: "36", note: "Nodal coverage" },
        { label: "Helpdesk SLA", value: "2 days", note: "Static helpdesk query" },
      ]}
      items={[
        "State CSR Cell: statecell.user@mahacsr.gov.in | 022-2202 1234",
        "CSR Relationship Manager Desk: rm.user@mahacsr.gov.in | 022-2202 1240",
        "District Nodal Officer Coordination: nodal.user@mahacsr.gov.in",
        "Public Helpdesk: helpdesk@mahacsr.gov.in | 1800-123-4567",
      ]}
      table={{
        columns: ["Desk", "Scope", "Response Standard"],
        rows: [
          ["CSR Relationship Manager", "Corporate enquiry, government pitch verification, coordination and follow-up", "5 days, then 3+2 escalation"],
          ["District Nodal Officer", "Project finalisation, field coordination, milestone verification, UC certification", "15 days for Level 1 grievances"],
          ["State CSR Cell", "Inter-departmental coordination and Level 2 grievance handling", "30 days for escalated grievances"],
          ["Helpdesk", "Static page queries, document guidance and public support", "2 days"],
        ],
      }}
      sections={[
        {
          title: "District Nodal Officer Coverage",
          items: [
            "Konkan: Mumbai City, Mumbai Suburban, Thane, Palghar, Raigad, Ratnagiri, Sindhudurg.",
            "Pune: Pune, Satara, Sangli, Solapur, Kolhapur.",
            "Nashik: Nashik, Ahmednagar, Dhule, Nandurbar, Jalgaon.",
            "Aurangabad: Chhatrapati Sambhajinagar, Jalna, Beed, Latur, Dharashiv, Nanded, Parbhani, Hingoli.",
            "Amravati and Nagpur: Akola, Amravati, Buldhana, Washim, Yavatmal, Nagpur, Wardha, Bhandara, Gondia, Chandrapur, Gadchiroli.",
          ],
        },
      ]}
    />
  );
}
