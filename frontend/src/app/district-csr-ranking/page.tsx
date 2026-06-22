import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function DistrictCsrRankingPage() {
  return (
    <CSRWorkflowModulePage
      area="Public Transparency"
      title="District CSR Ranking"
      description="Public ranking of districts by published requirements, projects funded, CSR fund mobilized, beneficiaries reached, and completion status."
      primaryHref="/csr-impact-dashboard"
      primaryLabel="Open Impact Dashboard"
    />
  );
}
