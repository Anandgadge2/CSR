import CSRWorkflowModulePage from "@/components/CSRWorkflowModulePage";

export default function AdminCompanyInterestsPage() {
  return (
    <CSRWorkflowModulePage
      area="State CSR Cell"
      title="Company Interest Review"
      description="Review CSR company interest submissions, proposed funding amounts, funding type, and requirement conversion readiness."
      primaryHref="/admin/requirements/pending"
      primaryLabel="Open Requirement Queue"
    />
  );
}
