import LiveCSRReportPage from "@/components/LiveCSRReportPage";

export default function DepartmentReportsPage() {
  return (
    <LiveCSRReportPage
      title="Department CSR Reports"
      description="View department requirement, funding, project progress, handover, and beneficiary impact reports with filters, KPI cards, charts, tables, and export actions."
      endpoint="/reports/department/dashboard"
    />
  );
}
