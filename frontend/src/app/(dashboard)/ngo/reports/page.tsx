import LiveCSRReportPage from "@/components/LiveCSRReportPage";

export default function NgoReportsPage() {
  return (
    <LiveCSRReportPage
      title="NGO Performance Reports"
      description="Review assigned projects, proposal requests, funds received, utilization, progress, completion certificates, and performance scorecards."
      endpoint="/reports/ngo/performance-scorecard"
    />
  );
}
