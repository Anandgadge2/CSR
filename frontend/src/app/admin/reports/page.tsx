import LiveCSRReportPage from "@/components/LiveCSRReportPage";

export default function ReportsPage() {
  return (
    <LiveCSRReportPage
      title="State CSR Cell Reports"
      description="Generate district, sector, department, company, NGO, gap analysis, and executive CSR reports from department-created requirements."
      endpoint="/reports/government/state-dashboard"
    />
  );
}
