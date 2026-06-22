import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DistrictProjectsPage() {
  return (
    <CSRWorkflowModulePage
      area="District Officer"
      title="District Projects"
      description="Track CSR project execution, milestone evidence, local inspections, handover readiness, and district-level project risk."
      primaryHref="/district/inspections"
      primaryLabel="Open Inspections"
    />
  );
}
