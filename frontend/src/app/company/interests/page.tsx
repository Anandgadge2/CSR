import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function CompanyInterestsPage() {
  return (
    <CSRWorkflowModulePage
      area="CSR Company"
      title="My Requirement Interests"
      description="Track department CSR requirements where your company has shown interest, funding approval status, selected NGO, and project conversion."
      primaryHref="/company/marketplace"
      primaryLabel="Browse Requirements"
    />
  );
}
