import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DepartmentHandoverPage() {
  return (
    <CSRWorkflowModulePage
      area="Government Department"
      title="Asset Handover Confirmation"
      description="Confirm asset delivery, work completion, beneficiary reach, quality acceptance, and handover certificate status for completed department CSR projects."
      primaryHref="/department/projects"
      primaryLabel="Open Active Projects"
    />
  );
}
