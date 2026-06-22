import LiveCSRReportPage from "@/components/LiveCSRReportPage";

export default function DistrictReportsPage() {
  return (
    <LiveCSRReportPage
      title="District CSR Reports"
      description="View district CSR summary, taluka-wise and village-wise requirements, funded versus unfunded gaps, inspections, and geo-tagged evidence reports."
      endpoint="/reports/district/summary"
    />
  );
}
