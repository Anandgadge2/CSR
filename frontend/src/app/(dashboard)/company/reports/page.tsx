import LiveCSRReportPage from "@/components/LiveCSRReportPage";

export default function CompanyReportsPage() {
  return (
    <LiveCSRReportPage
      title="Company CSR Reports"
      description="View CSR portfolio, fund commitment, fund release, utilization, Schedule VII, ESG, and impact reports."
      endpoint="/reports/company/portfolio"
    />
  );
}
