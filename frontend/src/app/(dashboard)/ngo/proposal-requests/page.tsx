import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function NgoProposalRequestsPage() {
  return (
    <CSRWorkflowModulePage
      area="NGO Implementation"
      title="Proposal Requests"
      description="Review proposal requests for approved government department CSR requirements and submit implementation plans."
      primaryHref="/csr-marketplace"
      primaryLabel="Open Marketplace"
    />
  );
}
