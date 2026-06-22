import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DistrictDashboardPage() {
  return (
    <CSRWorkflowModulePage
      area="District Officer"
      title="District CSR Dashboard"
      description="Monitor district requirements, funded projects, inspections, evidence review, and CSR gap indicators for assigned district data."
      primaryHref="/district/requirements"
      primaryLabel="Open District Requirements"
    />
  );
}
