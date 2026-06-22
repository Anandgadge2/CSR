import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DistrictRequirementsPage() {
  return (
    <CSRWorkflowModulePage
      area="District Officer"
      title="District Requirements"
      description="Review government department requirements by district, taluka, village, sector, funding status, and priority."
      primaryHref="/csr-marketplace"
      primaryLabel="Open Marketplace"
    />
  );
}
