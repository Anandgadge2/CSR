import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function CompanyProjectsPage() {
  return (
    <CSRWorkflowModulePage
      area="CSR Company"
      title="Committed CSR Projects"
      description="Track funded department CSR projects, NGO implementation, milestone evidence, tranche release status, and completion outcomes."
      primaryHref="/company/interests"
      primaryLabel="Open Interests"
    />
  );
}
