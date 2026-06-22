import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function AdminNgoSelectionPage() {
  return (
    <CSRWorkflowModulePage
      area="State CSR Cell"
      title="NGO Selection Approval"
      description="Approve final implementing NGO selections for department CSR requirements before agreement and project execution."
      primaryHref="/admin/ngo-registry"
      primaryLabel="Open NGO Registry"
    />
  );
}
