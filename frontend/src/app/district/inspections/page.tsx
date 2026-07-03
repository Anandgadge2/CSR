import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DistrictInspectionsPage() {
  return (
    <CSRWorkflowModulePage
      area="District Officer"
      title="Inspection Queue"
      description="Record field visit remarks, geo-tagged evidence review, issues found, corrective action, and next visit dates."
      primaryHref="/convergence-projects"
      primaryLabel="Open District Projects"
    />
  );
}
