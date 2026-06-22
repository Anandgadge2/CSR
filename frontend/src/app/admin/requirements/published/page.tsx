import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function AdminPublishedRequirementsPage() {
  return (
    <CSRWorkflowModulePage
      area="State CSR Cell"
      title="Published Department Requirements"
      description="Monitor approved government department requirements that are visible to CSR companies in the marketplace."
      primaryHref="/csr-marketplace"
      primaryLabel="Open Marketplace"
    />
  );
}
