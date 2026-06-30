import StaticPdfSectionPage from "@/components/StaticPdfSectionPage";

export default function DirectoryPage() {
  return <StaticPdfSectionPage title="CSR Coordination Directory" description="Official contact directory for State CSR Cell, CSR Relationship Managers, District Nodal Officers and helpdesk." items={["State CSR Cell: statecell.user@mahacsr.gov.in", "CSR Relationship Manager: rm.user@mahacsr.gov.in", "District Nodal Officer Pune: nodal.user@mahacsr.gov.in", "Helpdesk: 1800-123-4567"]} />;
}
