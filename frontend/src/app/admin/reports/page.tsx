import GovPortalLayout from "@/components/layout/GovPortalLayout";
import LiveCSRReportPage from "@/components/LiveCSRReportPage";

export default function ReportsPage() {
  return (
    <GovPortalLayout>
      <LiveCSRReportPage
        title="Convergence CSR Reports"
        description="Live district, sector, and status reports for convergence projects — budgets, utilization, UC verification, and grievances under the Maha CSR Convergence Model."
        endpoint="/admin/convergence-report"
      />
    </GovPortalLayout>
  );
}
